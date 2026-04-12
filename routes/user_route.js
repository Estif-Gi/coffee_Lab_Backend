const express = require('express');
const { check } = require('express-validator');
const checkAuth = require('../middleware/check_auth');
const {
    signup,
    login,
    verifyEmail,
    GetAllUsers,
    GetUserById,
    UpdateUser,
    DeleteUser
} = require('../controller/user_controller');

const router = express.Router();

router.post('/signup',
    [
        check('name').notEmpty().withMessage('Name is required'),
        check('email').normalizeEmail().isEmail().withMessage('Valid email is required'),
        check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    signup
);

router.post('/login',
    [
        check('email').normalizeEmail().isEmail().withMessage('Valid email is required'),
        check('password').notEmpty().withMessage('Password is required')
    ],
    login
);

router.get('/verify-email/:userId/:token', verifyEmail);

router.use(checkAuth); // Apply authentication middleware to all routes below

router.get('/', GetAllUsers);

router.get('/:id', GetUserById);

router.patch('/:id', UpdateUser
);

router.delete('/:id', DeleteUser);

module.exports = router;
