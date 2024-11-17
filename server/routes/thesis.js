//routes/thesis.js
const express = require('express');
const router = express.Router();
const ThesisController = require('../controllers/ThesisController');
const { authenticateStudent, authenticateInstructor, authenticateAdmin } = require('../middleware/auth');

// Student Routes
// Submit a thesis
router.post('/submit', authenticateStudent, ThesisController.submitThesis);

// Get all submissions by a specific student
router.get('/student/:student_id', authenticateStudent, ThesisController.getStudentSubmissions);

// Upload a revision for a thesis
router.post('/:thesis_id/revision', authenticateStudent, ThesisController.uploadRevision);

// Instructor Routes
// Get all thesis submissions
router.get('/instructor/submissions', authenticateInstructor, ThesisController.getThesisSubmissions);

// Review a thesis
router.put('/:thesis_id/review', authenticateInstructor, ThesisController.reviewThesis);

// Admin and Instructor Routes
// Get all theses
router.get('/all', [authenticateInstructor, authenticateAdmin], ThesisController.getAllTheses);

// Get a specific thesis by ID
router.get('/:thesis_id', [authenticateInstructor, authenticateAdmin], ThesisController.getThesisById);

// Update thesis status and feedback
router.put('/:thesis_id', authenticateInstructor, ThesisController.updateThesis);

module.exports = router;
