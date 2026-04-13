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

    const successPage = (email) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verified - Coffee Lab</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5ebe0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .card {
            background-color: #fff8f2;
            border-radius: 16px;
            padding: 48px 40px;
            max-width: 460px;
            width: 90%;
            text-align: center;
            box-shadow: 0 8px 30px rgba(139, 90, 43, 0.12);
            border-top: 5px solid #a0522d;
        }

        .icon {
            font-size: 64px;
            margin-bottom: 20px;
        }

        h1 {
            color: #6b3a2a;
            font-size: 1.8rem;
            margin-bottom: 12px;
        }

        p {
            color: #8b6347;
            font-size: 1rem;
            line-height: 1.6;
            margin-bottom: 8px;
        }

        .email {
            display: inline-block;
            background-color: #ede0d4;
            color: #6b3a2a;
            padding: 6px 16px;
            border-radius: 20px;
            font-weight: 600;
            margin: 12px 0 24px;
            font-size: 0.95rem;
        }

        .btn {
            display: inline-block;
            background-color: #a0522d;
            color: #fff;
            padding: 12px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 1rem;
            font-weight: 600;
            transition: background-color 0.2s;
        }

        .btn:hover { background-color: #7a3e20; }

        .footer {
            margin-top: 32px;
            color: #b08870;
            font-size: 0.82rem;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">☕</div>
        <h1>You're Verified!</h1>
        <p>Your email address has been successfully verified.</p>
        <span class="email">${email}</span>
        <p>You can now log in and start exploring Coffee Lab.</p>
        <br/>
        <a href="${process.env.FRONTEND_URL || '#'}" class="btn">Go to Login</a>
        <div class="footer">© ${new Date().getFullYear()} Coffee Lab. All rights reserved.</div>
    </div>
</body>
</html>`;

    const alreadyVerifiedPage = (email) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Already Verified - Coffee Lab</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5ebe0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .card {
            background-color: #fff8f2;
            border-radius: 16px;
            padding: 48px 40px;
            max-width: 460px;
            width: 90%;
            text-align: center;
            box-shadow: 0 8px 30px rgba(139, 90, 43, 0.12);
            border-top: 5px solid #c8956c;
        }

        .icon { font-size: 64px; margin-bottom: 20px; }

        h1 { color: #6b3a2a; font-size: 1.8rem; margin-bottom: 12px; }

        p { color: #8b6347; font-size: 1rem; line-height: 1.6; margin-bottom: 8px; }

        .email {
            display: inline-block;
            background-color: #ede0d4;
            color: #6b3a2a;
            padding: 6px 16px;
            border-radius: 20px;
            font-weight: 600;
            margin: 12px 0 24px;
            font-size: 0.95rem;
        }

        .btn {
            display: inline-block;
            background-color: #a0522d;
            color: #fff;
            padding: 12px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 1rem;
            font-weight: 600;
        }

        .btn:hover { background-color: #7a3e20; }

        .footer { margin-top: 32px; color: #b08870; font-size: 0.82rem; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">✅</div>
        <h1>Already Verified</h1>
        <p>This account is already verified.</p>
        <span class="email">${email}</span>
        <p>You can go ahead and log in.</p>
        <br/>
        <a href="${process.env.FRONTEND_URL || '#'}" class="btn">Go to Login</a>
        <div class="footer">© ${new Date().getFullYear()} Coffee Lab. All rights reserved.</div>
    </div>
</body>
</html>`;

    const errorPage = (message) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Failed - Coffee Lab</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5ebe0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .card {
            background-color: #fff8f2;
            border-radius: 16px;
            padding: 48px 40px;
            max-width: 460px;
            width: 90%;
            text-align: center;
            box-shadow: 0 8px 30px rgba(139, 90, 43, 0.12);
            border-top: 5px solid #c0392b;
        }

        .icon { font-size: 64px; margin-bottom: 20px; }

        h1 { color: #6b3a2a; font-size: 1.8rem; margin-bottom: 12px; }

        p { color: #8b6347; font-size: 1rem; line-height: 1.6; }

        .error-msg {
            background-color: #fdecea;
            color: #c0392b;
            padding: 10px 20px;
            border-radius: 8px;
            margin: 16px 0 24px;
            font-size: 0.95rem;
        }

        .btn {
            display: inline-block;
            background-color: #a0522d;
            color: #fff;
            padding: 12px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 1rem;
            font-weight: 600;
        }

        .btn:hover { background-color: #7a3e20; }

        .footer { margin-top: 32px; color: #b08870; font-size: 0.82rem; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">❌</div>
        <h1>Verification Failed</h1>
        <p>Something went wrong while verifying your email.</p>
        <div class="error-msg">${message}</div>
        <p>Please request a new verification link or contact support.</p>
        <br/>
        <a href="${process.env.FRONTEND_URL || '#'}" class="btn">Go to Home</a>
        <div class="footer">© ${new Date().getFullYear()} Coffee Lab. All rights reserved.</div>
    </div>
</body>
</html>`;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send(errorPage('User not found.'));
        }

        if (user.isVerified) {
            return res.status(200).send(alreadyVerifiedPage(user.email));
        }

        if (!user.verificationToken || user.verificationToken !== token || user.verificationTokenExpiry < Date.now()) {
            return res.status(400).send(errorPage('Invalid or expired verification link.'));
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();

        res.status(200).send(successPage(user.email));

    } catch (err) {
        return res.status(500).send(errorPage('Something went wrong. Please try again later.'));
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
