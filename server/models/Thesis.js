const mongoose = require('mongoose');

const ThesisSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true },
  comments: { type: String },
  status: { type: String, enum: ['Pending', 'Under Review', 'Approved', 'Rejected'], default: 'Pending' },
  submissionDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Thesis', ThesisSchema);
