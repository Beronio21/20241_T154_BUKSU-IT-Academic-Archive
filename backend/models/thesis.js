const mongoose = require('mongoose');

const thesisSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    members: {
        type: [String],
        required: true
    },
    adviserEmail: {
        type: String,
        required: true
    },
    docsLink: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'revision needed'],
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
    }],
    submissionDate: {
        type: Date,
        default: Date.now
    },
    file: {
        url: { type: String, required: true },
        key: { type: String, required: true },
        size: { type: Number, required: true },
        hash: { type: String, required: true }
    },
    author: { type: String, required: true },
    abstract: { type: String, required: true },
    keywords: { type: [String], required: true },
    department: { type: String, required: true },
    academic_year: { type: Number, required: true },
    advisor_name: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Thesis', thesisSchema); 