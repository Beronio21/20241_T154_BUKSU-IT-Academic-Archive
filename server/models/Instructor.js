const mongoose = require('mongoose');

const InstructorSchema = new mongoose.Schema({
    instructor_id: { type: String, required: true, unique: true }, // Unique identifier for the instructor
    first_name: { type: String, required: true }, // First name of the instructor
    last_name: { type: String, required: true }, // Last name of the instructor
    email: { type: String, required: true, unique: true }, // Unique email for the instructor
    password_hash: { type: String, required: true }, // Hashed password
    contact_number: { type: String, required: true }, // Contact number of the instructor
    birthday: { type: Date, required: true }, // Date of birth
    gender: { type: String, required: true }, // Gender of the instructor
    department: { type: String, required: true }, // Department of the instructor
    position: { type: String, required: true }, // Position (e.g., Professor, Assistant Professor)
    profile_picture: { type: String }, // URL to the instructor's profile picture
    total_reviews: { type: Number, default: 0 }, // Total number of reviews (default to 0)
    created_at: { type: Date, default: Date.now }, // Timestamp for creation
    updated_at: { type: Date, default: Date.now }, // Timestamp for the last update
});

// Middleware to update the 'updated_at' field before saving
InstructorSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('Instructor', InstructorSchema);
