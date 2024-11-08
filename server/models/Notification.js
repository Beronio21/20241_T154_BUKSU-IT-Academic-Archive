// server/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    notification_id: { type: Number, required: true, unique: true },
    student_id: { type: String, required: true },
    message: String,
    is_read: { type: Boolean, default: false },
    date_created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
