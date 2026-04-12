const express = require('express');
const router = express.Router();




router.get('/', (req, res , next) => {
    ContactMessage.find()
    .then(contactMessages => {
        res.status(200).json(contactMessages);
    })
    .catch(err => {
        res.status(500).json({ message: err.message });
    });
});

router.post('/', (req, res , next) => {
    const { name, email, message } = req.body;
    const contactMessage = new ContactMessage({ name, email, message });
    contactMessage.save()
    .then(contactMessage => {
        res.status(201).json(contactMessage);
    })
    .catch(err => {
        res.status(500).json({ message: err.message });
    });
});

module.exports = router;

