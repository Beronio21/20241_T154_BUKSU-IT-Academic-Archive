const mongoose = require('mongoose');

const InstructorSchema = new mongoose.Schema({
    instructor_id: String,
    first_name: String,
    last_name: String,
    email: String,
    password_hash: String,
    contact_number: String,
    birthday: Date,  // Add birthday field
    gender: String,   // Add gender field
    department: String,
    position: String,
    profile_picture: String,
    total_reviews: Number,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Instructor', InstructorSchema);
