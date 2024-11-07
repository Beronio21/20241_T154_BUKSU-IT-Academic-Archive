// server/routes/submissionHistoryRoutes.js
const express = require('express');
const router = express.Router();
const SubmissionHistory = require('../models/SubmissionHistory'); // Mongoose model

// GET: Retrieve all submission history records or by student ID
router.get('/', async (req, res) => {
    try {
        const records = await SubmissionHistory.find();
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:student_id', async (req, res) => {
    try {
        const studentHistory = await SubmissionHistory.find({ student_id: req.params.student_id });
        res.json(studentHistory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST: Add a new submission history record
router.post('/', async (req, res) => {
    const newSubmission = new SubmissionHistory(req.body);

    try {
        const savedSubmission = await newSubmission.save();
        res.status(201).json(savedSubmission);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH: Update submission status or feedback for a specific record
router.patch('/:id', async (req, res) => {
    try {
        const updatedSubmission = await SubmissionHistory.findOneAndUpdate(
            { submission_history_id: req.params.id },
            { $set: req.body },
            { new: true }
        );

        if (!updatedSubmission) return res.status(404).json({ message: "Submission history not found" });
        res.json(updatedSubmission);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE: Remove a submission history record by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedRecord = await SubmissionHistory.findOneAndDelete({ submission_history_id: req.params.id });
        if (!deletedRecord) return res.status(404).json({ message: "Submission history not found" });
        res.json(deletedRecord);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
