const mongoose = require('mongoose');

const thesisSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    abstract: {
        type: String,
        required: true,
        trim: true
    },
    keywords: [{
        type: String,
        required: true,
        trim: true
    }],
    members: [{
        type: String,
        required: true,
        trim: true
    }],
    adviserEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    docsLink: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true,
        enum: ['IoT', 'AI', 'ML', 'Sound', 'Camera'],
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'revision'],
        default: 'pending',
        index: true
    },
    reviewComments: {
        type: String,
        default: ''
    },
    reviewedBy: {
        type: String,
        default: ''
    },
    reviewDate: {
        type: Date,
        index: true
    },
    feedback: [{
        comment: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'revision'],
            required: true
        },
        reviewedBy: {
            type: String,
            required: true
        },
        reviewDate: {
            type: Date,
            default: Date.now,
            index: true
        }
    }]
}, {
    timestamps: true
});

thesisSchema.index({ status: 1, createdAt: -1 });
thesisSchema.index({ adviserEmail: 1, status: 1 });

thesisSchema.path('feedback').validate(function(value) {
    if (value.length > 0) {
        return value.every(feedback => 
            feedback.comment && 
            feedback.comment.trim().length > 0 && 
            feedback.reviewedBy && 
            feedback.reviewedBy.trim().length > 0
        );
    }
    return true;
}, 'Each feedback entry must have a non-empty comment and reviewer');

module.exports = mongoose.model('Thesis', thesisSchema); 