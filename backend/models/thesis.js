const mongoose = require('mongoose');

const thesisSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    members: [{
        type: String,
        required: true
    }],
    adviserEmail: {
        type: String,
        required: true
    },
    docsLink: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'revision'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Thesis', thesisSchema); 