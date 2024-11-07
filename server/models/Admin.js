const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    admin_id: { type: String, required: true, unique: true }, // Unique and required
    first_name: { type: String, required: true }, // Required
    last_name: { type: String, required: true }, // Required
    email: { type: String, required: true, unique: true }, // Required and unique
    password_hash: { type: String, required: false }, // Optional
    contact_number: { type: String, required: true }, // Required
    role: { type: String, default: 'admin' }, // Default to 'admin'
    profile_picture: { type: String, default: 'default-profile.png' } // Default profile picture
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model('Admin', adminSchema);
