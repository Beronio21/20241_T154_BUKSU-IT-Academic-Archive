const mongoose = require('mongoose');

const adminNotificationSchema = new mongoose.Schema({
    notification_id: Number,
    admin_id: String,
    message: String,
    is_read: Boolean,
    created_at: Date
});

module.exports = mongoose.model('AdminNotification', adminNotificationSchema);
