const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const checkAuth = require('../middleware/check_auth');

const {
    GetAllPromotions, 
    GetPromotionById, 
    CreatePromotion, 
    UpdatePromotion, 
    DeletePromotion } = require('../controller/promotion_controller');


router.get('/', GetAllPromotions);

router.get('/:id', GetPromotionById);

router.use(checkAuth); // Apply authentication middleware to all routes below

router.post('/',[
    check('title').notEmpty().withMessage('Title is required'),
    check('description').notEmpty().withMessage('Description is required'),
    check('discountType').notEmpty().withMessage('Discount type is required'),
    check('discountValue').notEmpty().withMessage('Discount value is required'),
    check('startAt').notEmpty().withMessage('Start at is required'),
    check('endAt').notEmpty().withMessage('End at is required'),
], CreatePromotion);

router.patch('/:id', UpdatePromotion);

router.delete('/:id', DeletePromotion);

module.exports = router;