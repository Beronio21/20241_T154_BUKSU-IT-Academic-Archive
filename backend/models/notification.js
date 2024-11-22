const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientEmail: {
        type: String,
        required: true
    },
    studentEmail: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['submission', 'feedback', 'status_update', 'other'],
        default: 'other'
    },
    read: {
        type: Boolean,
        default: false
    },
    thesisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Thesis',
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema); 