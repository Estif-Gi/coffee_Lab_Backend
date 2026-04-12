const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    startsAt: {
        type: Date,
        required: true,
        default: Date.now

    },
    endsAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    location: {
        type: Object,
        required: true,
        default: {
            latitude: 8.9553608,
            longitude: 38.713286
        }
    },
    description: {
        type: String,
        required: true
    }, imageUrl: {
        type: String,
        required: true
    }, publicId: {
        type: String,
        required: false
    }, published: {
        type: Boolean,
        default: true
    }, sortOrder: {
        type: Number,
        default: 0
    }, createdAt: {
        type: Date,
        default: Date.now
    }
})

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;