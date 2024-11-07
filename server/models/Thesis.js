// server/models/Thesis.js
const mongoose = require('mongoose');

const thesisSchema = new mongoose.Schema({
    thesis_id: { type: Number, required: true, unique: true },
    student_id: String,
    thesis_title: String,
    abstract: String,
    keywords: [String],
    advisor_id: Number,
    file_url: String,
    submission_status: String,
    submission_date: Date,
    last_updated: Date,
});

module.exports = mongoose.model('Thesis', thesisSchema);
