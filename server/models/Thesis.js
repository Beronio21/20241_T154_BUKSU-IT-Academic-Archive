<<<<<<< HEAD
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
=======
// models/Thesis.js
const mongoose = require('mongoose');

const thesisSchema = new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' }, // Optional: link to instructor who reviewed
    thesis_title: { type: String, required: true },
    submission_date: { type: Date, default: Date.now },
    file_url: { type: String, required: true },
    comments: { type: String },
    status: { type: String, enum: ['Under Review', 'Approved', 'Revisions Required'], default: 'Under Review' },
    feedback: { type: String },
    revision_uploads: [{
        file_url: { type: String },
        date: { type: Date, default: Date.now },
        comments: { type: String }
    }]
}, { timestamps: true });

>>>>>>> INTEGRATION

module.exports = mongoose.model('Thesis', thesisSchema);
