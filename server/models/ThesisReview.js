// models/ThesisReview.js
const mongoose = require('mongoose');

const thesisReviewSchema = new mongoose.Schema({
    review_id: { type: Number, required: true, unique: true },
    thesis_id: { type: Number, required: true },
    student_id: { type: String, required: true },
    feedback: String,
    status: String,
    review_date: { type: Date, default: Date.now },
    revised_thesis_id: Number
});

module.exports = mongoose.model('ThesisReview', thesisReviewSchema);
