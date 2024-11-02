const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    admin_id: String,
    first_name: String,
    last_name: String,
    email: String,
    password_hash: String,
    contact_number: String,
    role: String,
    profile_picture: String,
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('Admin', adminSchema);
