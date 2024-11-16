// routes/thesisRoutes.js
const express = require('express');
const router = express.Router();
const Thesis = require('../models/Thesis'); // Adjust path based on your folder structure

// GET all theses
router.get('/', async (req, res) => {
    try {
        const theses = await Thesis.find().populate('student_id'); // Populate with student data if needed
        res.json(theses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST a new thesis submission
router.post('/', async (req, res) => {
    try {
        const thesis = new Thesis({
            student_id: req.body.student_id,
            thesis_title: req.body.thesis_title,
            file_url: req.body.file_url,
            comments: req.body.comments,
            status: req.body.status || 'Under Review',
            feedback: req.body.feedback || '',
            revision_uploads: req.body.revision_uploads || []
        });
        const newThesis = await thesis.save();
        res.status(201).json(newThesis);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Other routes, like PUT or DELETE for thesis, can be added here if needed

module.exports = router;
