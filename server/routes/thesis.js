//routes/thesis.js
const express = require('express');
const ThesisController = require('../controllers/ThesisController');
const authenticateUser = require('../middleware/auth');

const router = express.Router();

// Route to submit a thesis (no authentication needed, but might be restricted to students in the future)
router.post('/submit', authenticateUser, ThesisController.submitThesis);

// Route to get all submissions by a student (only for students)
router.get('/student/:student_id', authenticateUser, ThesisController.getStudentSubmissions);

// Route to update thesis status and provide feedback (instructor only)
router.put('/update/:thesis_id', authenticateUser, ThesisController.updateThesis);

// Route to upload a revision (only for students)
router.post('/revision/:thesis_id', authenticateUser, ThesisController.uploadRevision);

// Route to get thesis submissions with filtering (only for instructors)
router.get('/submissions', authenticateUser, ThesisController.getThesisSubmissions);

// Route to get a specific thesis by ID (public access, or restricted based on role)
router.get('/:thesis_id', ThesisController.getThesisById);

// Route to review a thesis (only for instructors)
router.post('/review/:thesis_id', authenticateUser, (req, res, next) => {
    if (req.user.role === 'Instructor') {
        ThesisController.reviewThesis(req, res);
    } else {
        res.status(403).json({ message: 'Access denied' });
    }
});

// Get student theses (only for students)
router.get('/student', authenticateUser, (req, res, next) => {
    if (req.user.role === 'Student') {
        ThesisController.getStudentTheses(req, res);
    } else {
        res.status(403).json({ message: 'Access denied' });
    }
});

// Get all theses (only for instructors)
router.get('/instructor', authenticateUser, (req, res, next) => {
    if (req.user.role === 'Instructor') {
        ThesisController.getAllTheses(req, res);
    } else {
        res.status(403).json({ message: 'Access denied' });
    }
});

module.exports = router;
