const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: 'default-avatar.png'
    },
    teacher_id: {
        type: String,
        unique: true,
        required: true,
        default: function() {
            // Generate a unique teacher ID if none is provided
            return `T-${Date.now().toString().slice(-8)}-${Math.random().toString(36).slice(-4)}`;
        }
    },
    department: {
        type: String,
        default: ''
    },
    contact_number: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    birthday: {
        type: Date,
        default: null
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', ''],
        default: ''
    },
    role: {
        type: String,
        default: 'teacher'
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Check if profile is complete
teacherSchema.methods.checkProfileComplete = function() {
    return !!(
        this.teacher_id &&
        this.department &&
        this.contact_number &&
        this.location &&
        this.birthday &&
        this.gender
    );
};

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher; 