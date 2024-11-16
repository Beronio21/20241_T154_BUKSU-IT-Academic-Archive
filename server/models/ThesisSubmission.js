// server/models/ThesisSubmission.js
const mongoose = require('mongoose');

const thesisSubmissionSchema = new mongoose.Schema({
    thesis_id: { type: String, required: true, unique: true },
    student_id: { type: String, required: true },
    title: String,
    feedback: String,
    grade: String,
    submission_status: String,
    submission_date: Date
});

module.exports = mongoose.model('ThesisSubmission', thesisSubmissionSchema);
