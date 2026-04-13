const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menuSchema = new Schema({
    category:{
        type: String,
        enum: ['Hot Drinks', 'Cold Drinks', 'Pastries / Snacks'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },priceCents: {
        type: Number,
        required: true
    },featured: {
        type: Boolean,
        default: true
    },imageUrl: {
        type: String,
        required: true
    },
    publicId: {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    },sortOrder: {
        type: Number,
        default: 0
    },createdAt: {
        type: Date,
        default: Date.now
    }
})

const MenuItem = mongoose.model('MenuItem', menuSchema);

module.exports = MenuItem;