// models/Instructor.js
const mongoose = require('mongoose');

// Define the Instructor schema
const InstructorSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password_hash: {
        type: String,
        required: true,
    },
    contact_number: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Admin', 'Instructor'], // Add roles as needed
        default: 'Instructor',
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

// Create the Instructor model
const Instructor = mongoose.model('Instructor', InstructorSchema);

// Export the model
module.exports = Instructor;
