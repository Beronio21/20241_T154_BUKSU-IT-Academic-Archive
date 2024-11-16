const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    first_name: { type: String, required: true },
    last_name: { type: String },
    // Add other fields from the payload or default values if necessary
    contact_number: { type: String },
    gender: { type: String },
    birthday: { type: Date },
    department: { type: String },
    course: { type: String },
    year_level: { type: String },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
