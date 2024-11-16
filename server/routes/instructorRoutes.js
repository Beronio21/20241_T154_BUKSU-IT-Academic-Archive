const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const authMiddleware = require('../middleware/auth'); // Authentication middleware for protected routes

// GET: Retrieve all instructors (can be open, or add authMiddleware if needed)
router.get('/', instructorController.getInstructors);

// GET: Retrieve a specific instructor by ID (protected)
router.get('/:id', authMiddleware, instructorController.getInstructorById);

// POST: Add a new instructor
router.post('/add', instructorController.addInstructor);

// PATCH: Update an instructor's details (protected)
router.patch('/:id', authMiddleware, instructorController.updateInstructor);

// DELETE: Remove an instructor by ID (protected)
router.delete('/:id', authMiddleware, instructorController.deleteInstructor);

// POST: Instructor login
router.post('/login', instructorController.loginInstructor);

// POST: Instructor logout
router.post('/logout', authMiddleware, instructorController.logoutInstructor); // Added logout route (optional auth)

module.exports = router;
