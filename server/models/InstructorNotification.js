// models/InstructorNotification.js
const mongoose = require('mongoose');

const instructorNotificationSchema = new mongoose.Schema({
    notification_id: { type: Number, required: true, unique: true },
    instructor_id: { type: String, required: true },
    message: String,
    is_read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InstructorNotification', instructorNotificationSchema);
