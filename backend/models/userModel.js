const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    image: String,
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        required: true
    },
    student_id: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: function(v) {
                return !v || /^\d{1,20}$/.test(v);
            },
            message: 'Student ID must be between 1 and 20 digits'
        }
    },
    contact_number: {
        type: String,
        unique: true,
        sparse: true,
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
        enum: ['male', 'female', 'other'],
        lowercase: true
    },
    course: String,
    year: {
        type: String,
        enum: ['1', '2', '3', '4']
    },
    password: {
        type: String,
        required: function() {
            return this.role !== 'student'; // Only required for non-student roles
        }
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    teacher_id: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: function(v) {
                return !v || /^\d{1,20}$/.test(v);
            },
            message: 'Teacher ID must be between 1 and 20 digits'
        }
    },
    admin_id: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: function(v) {
                return !v || /^\d{1,20}$/.test(v);
            },
            message: 'Admin ID must be between 1 and 20 digits'
        }
    },
    lock: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date,
        default: null
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Add compound unique index for role-specific IDs
userSchema.index({ role: 1, student_id: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1, teacher_id: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1, admin_id: 1 }, { unique: true, sparse: true });

userSchema.methods.validateRoleFields = function() {
    if (this.role === 'student' && !this.student_id) {
        return false;
    }
    if (this.role === 'teacher' && !this.teacher_id) {
        return false;
    }
    if (this.role === 'admin' && !this.admin_id) {
        return false;
    }
    return true;
};

// Add method to check if account is locked
userSchema.methods.isLocked = function() {
    return this.lock || (this.lockUntil && this.lockUntil > Date.now());
};

// Add method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) {
        this.lock = true;
        this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
    }
    await this.save();
};

// Add method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
    this.loginAttempts = 0;
    this.lock = false;
    this.lockUntil = null;
    await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;