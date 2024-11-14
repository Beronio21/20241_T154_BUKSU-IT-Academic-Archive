// models/Instructor.js
const mongoose = require('mongoose');

const InstructorSchema = new mongoose.Schema({
    instructor_id: { type: String, required: true, unique: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    contact_number: { type: String },
    department: { type: String },
    role: { type: String, default: 'instructor' },
    profile_picture: { type: String, default: 'default-profile.png' }
}, { timestamps: true });

module.exports = mongoose.model('Instructor', InstructorSchema);
