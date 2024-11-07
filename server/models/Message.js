// server/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message_id: { type: Number, required: true, unique: true },
    sender_id: { type: String, required: true },
    receiver_id: { type: String, required: true },
    content: { type: String, required: true },
    is_read: { type: Boolean, default: false },
    date_sent: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
