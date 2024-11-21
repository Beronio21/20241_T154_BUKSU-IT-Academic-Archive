const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: String,
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        required: true
    },
    student_id: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^\d{10}$/.test(v);
            },
            message: 'Student ID must be 10 digits'
        }
    },
    contact_number: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^\d{11}$/.test(v);
            },
            message: 'Contact number must be 11 digits'
        }
    },
    location: String,
    birthday: Date,
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    course: String,
    year: {
        type: String,
        enum: ['1', '2', '3', '4']
    },
    password: String,
    isProfileComplete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;