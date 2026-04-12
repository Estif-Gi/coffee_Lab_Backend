const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const { uploadToCloudinary } = require('../middleware/file_upload');
const checkAuth = require('../middleware/check_auth');
const { GetAllEvents, CreateEvent, UpdateEvent, DeleteEvent, GetEventById } = require('../controller/event_controller');



router.get('/', GetAllEvents);
router.get('/:id', GetEventById);


router.use(checkAuth); // Apply authentication middleware to all routes below
router.post('/',
    uploadToCloudinary.single("image"),
    [
    check('title').notEmpty().withMessage('Title is required'),
    check('startsAt').notEmpty().withMessage('Starts at is required'),
    check('description').notEmpty().withMessage('Description is required'),
], CreateEvent);
router.patch('/:id',
    uploadToCloudinary.single("image"),
    UpdateEvent);
router.delete('/:id', DeleteEvent);

module.exports = router;