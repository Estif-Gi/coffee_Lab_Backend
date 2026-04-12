const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    publicId: {
        type: String,
        required: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed' , 'none'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    startAt: {
        type: String,
        required: true
    },
    endAt: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
  
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);