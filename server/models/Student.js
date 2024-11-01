const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    student_id: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true }, // Password will be stored as a hash
    contact_number: { type: String, required: true },
    gender: { type: String, required: true },
    birthday: { type: Date, required: true },
    department: { type: String, required: true },
    course: { type: String, required: true },
    year_level: { type: Number, required: true }
}, {
    timestamps: true // Automatically manage createdAt and updatedAt fields
});

module.exports = mongoose.model('Student', studentSchema);
