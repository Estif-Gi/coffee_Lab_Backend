const crypto = require('crypto');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http_error');
const HttpSuccess = require('../models/http_success');
const User = require('../models/user');
const { sendVerificationEmail } = require('../utils/sendEmail');

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError(errors.array()[0].msg, 422));
    }

    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new HttpError('User already exists, please login instead.', 422));
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

        const createdUser = new User({
            name,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiry: tokenExpiry
        });

        await createdUser.save();
        try {
            console.log('Sending verification email to:', createdUser._id);
            await sendVerificationEmail(email, verificationToken, createdUser._id);
        } catch (err) {
            console.error('Error sending verification email:', err);
            return next(new HttpError('User created but failed to send verification email. Please contact support.', 500));
        }

        res.status(201).json(new HttpSuccess('User signed up successfully. Please check your email to verify your account.', {
            userId: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
            role: createdUser.role
        }));
    } catch (err) {
        return next(new HttpError('Signing up failed, please try again later.', 500));
    }
};

const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError(errors.array()[0].msg, 422));
    }

    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email });
    } catch (err) {
        return next(new HttpError('Logging in failed, please try again later.', 500));
    }

    if (!existingUser) {
        return next(new HttpError('Invalid credentials, could not log you in.', 401));
    }

    if (!existingUser.isVerified) {
        return next(new HttpError('Please verify your email before logging in.', 403));
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        return next(new HttpError('Could not log you in, please check your credentials and try again.', 500));
    }

    if (!isValidPassword) {
        return next(new HttpError('Invalid credentials, could not log you in.', 401));
    }

    let token;
    try {
        token = jwt.sign(
            {
                userId: existingUser.id,
                email: existingUser.email,
                role: existingUser.role
            },
            process.env.JWT_SECRET || 'supersecret_dont_share',
            { expiresIn: '12h' }
        );
    } catch (err) {
        return next(new HttpError('Logging in failed, please try again later.', 500));
    }

    res.status(200).json(new HttpSuccess('Logged in successfully', {
        userId: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
        token
    }));
};

const verifyEmail = async (req, res, next) => {
    const { userId, token } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return next(new HttpError('Verification failed. User not found.', 404));
        }

        if (user.isVerified) {
            return res.status(200).json(new HttpSuccess('Email already verified.', {
                userId: user.id,
                email: user.email
            }));
        }

        if (!user.verificationToken || user.verificationToken !== token || user.verificationTokenExpiry < Date.now()) {
            return next(new HttpError('Invalid or expired verification link.', 400));
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();

        res.status(200).json(new HttpSuccess('Email verified successfully.', {
            userId: user.id,
            email: user.email
        }));
    } catch (err) {
        return next(new HttpError('Email verification failed, please try again later.', 500));
    }
};

const GetAllUsers = async (req, res, next) => {

    if (req.userData.role !== 'admin') {
        return next(new HttpError('Unauthorized access to user data.', 403));
    }
    try {
        const users = await User.find().select('-password');
        res.status(200).json(new HttpSuccess('Users fetched successfully', users));
    } catch (err) {
        return next(new HttpError('Fetching users failed, please try again later.', 500));
    }
};

const GetUserById = async (req, res, next) => {
    const { id } = req.params;

    if (req.userData.role !== 'admin') {
        return next(new HttpError('Unauthorized access to user data.', 403));
    }
    try {
        const user = await User.findById(id).select('-password');
        if (!user) {
            return next(new HttpError('User not found', 404));
        }
        res.status(200).json(new HttpSuccess('User fetched successfully', user));
    } catch (err) {
        return next(new HttpError('Fetching user failed, please try again later.', 500));
    }
};

const UpdateUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError(errors.array()[0].msg, 422));
    }

    if (req.userData.role !== 'admin') {
        return next(new HttpError('Unauthorized access to user data.', 403));
    }

    const { id } = req.params;
    const { name, email, password, active, role } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return next(new HttpError('User not found', 404));
        }

        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return next(new HttpError('Email already in use by another account', 422));
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (typeof active === 'boolean') user.active = active;
        if (role) user.role = role;
        if (password) {
            user.password = await bcrypt.hash(password, 12);
        }

        await user.save();
        res.status(200).json(new HttpSuccess('User updated successfully', {
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            active: user.active
        }));
    } catch (err) {
        return next(new HttpError('Updating user failed, please try again later.', 500));
    }
};

const DeleteUser = async (req, res, next) => {
    const { id } = req.params;

    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return next(new HttpError('User not found', 404));
        }
        res.status(200).json(new HttpSuccess('User deleted successfully', {
            userId: deletedUser.id,
            email: deletedUser.email
        }));
    } catch (err) {
        return next(new HttpError('Deleting user failed, please try again later.', 500));
    }
};

module.exports = {
    signup,
    login,
    verifyEmail,
    GetAllUsers,
    GetUserById,
    UpdateUser,
    DeleteUser
};
