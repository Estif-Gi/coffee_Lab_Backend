const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const { uploadToCloudinary } = require('../middleware/file_upload');
const checkAuth = require('../middleware/check_auth');
const {
    GetAllMenus,
    CreateMenuItem,
    DeleteMenuItem,
    UpdateMenuItem,
    GetMenuItemById } = require('../controller/menu_controller');


router.get('/', GetAllMenus);

router.get('/:id', GetMenuItemById);

router.use(checkAuth); // Apply authentication middleware to all routes below

router.post('/',
    uploadToCloudinary.single("image"),
    [
        check('category').notEmpty().withMessage('Category is required'),
        check('name').notEmpty().withMessage('Name is required'),
        check('description').notEmpty().withMessage('Description is required'),
        check('priceCents').notEmpty().withMessage('Price is required'),
    ], CreateMenuItem);

router.patch('/:id',
    uploadToCloudinary.single("image"),
    [
        check('category').notEmpty().withMessage('Category is required'),
        check('name').notEmpty().withMessage('Name is required'),
        check('description').notEmpty().withMessage('Description is required'),
        check('priceCents').notEmpty().withMessage('Price is required'),
        check('imageUrl').isURL().withMessage('Image URL must be a valid URL'),
    ], UpdateMenuItem);

router.delete('/:id', DeleteMenuItem);

module.exports = router
