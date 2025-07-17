const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientEmail: {
        type: String,
        required: true,
        index: true
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
        enum: ['submission', 'feedback', 'status_update', 'review_update', 'admin_event', 'other'],
        default: 'other',
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'revision', 'needs_revision', 'under_review', 'resubmitted'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    thesisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Thesis',
        required: false,
        index: true
    },
    thesisTitle: {
        type: String,
        required: false
    },
    reviewerComments: {
        type: String,
        required: false
    },
    reviewerName: {
        type: String,
        required: false
    },
    isDuplicate: {
        type: Boolean,
        default: false
    },
    forAdmins: {
        type: Boolean,
        default: false
    },
    readBy: [{ type: String }], // admin emails/IDs
    deletedBy: [{ type: String }], // admin emails/IDs
    teacherId: {
        type: String,
        required: false,
        index: true
    },
}, { timestamps: true });

// Index for efficient querying
notificationSchema.index({ recipientEmail: 1, createdAt: -1 });
notificationSchema.index({ recipientEmail: 1, read: 1 });
notificationSchema.index({ thesisId: 1, type: 1, status: 1 });

module.exports = mongoose.model('Notification', notificationSchema); 