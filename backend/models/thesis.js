const mongoose = require('mongoose');

const thesisSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    objective: {
        type: String,
        required: true
    },
    abstract: {
        type: String,
        required: true
    },
    keywords: [{
        type: String,
        required: true
    }],
    members: [{
        type: String,
        required: true
    }],
    adviserEmail: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    docsLink: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    feedback: [{
        comment: String,
        status: String,
        teacherName: String,
        teacherEmail: String,
        dateSubmitted: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Thesis', thesisSchema); 