// server/models/SubmissionHistory.js
const mongoose = require('mongoose');

const submissionHistorySchema = new mongoose.Schema({
    submission_history_id: { type: Number, required: true, unique: true },
    student_id: { type: String, required: true },
    thesis_id: { type: String, required: true },
    submission_status: { type: String, default: "Pending" },
    feedback: { type: String, default: "" },
    submission_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SubmissionHistory', submissionHistorySchema);
