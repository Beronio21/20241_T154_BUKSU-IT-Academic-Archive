const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const authMiddleware = require('../middleware/auth'); // Authentication middleware for protected routes

// GET: Retrieve all instructors (can be open, or add authMiddleware if needed)
<<<<<<< HEAD
router.get('/', instructorController.getAllInstructors);
=======
router.get('/', instructorController.getInstructors);
>>>>>>> DEVELOPER2

// GET: Retrieve a specific instructor by ID (protected)
router.get('/:id', authMiddleware, instructorController.getInstructorById);

// POST: Add a new instructor
<<<<<<< HEAD
router.post('/', instructorController.addInstructor);
=======
router.post('/add', instructorController.addInstructor);
>>>>>>> DEVELOPER2

// PATCH: Update an instructor's details (protected)
router.patch('/:id', authMiddleware, instructorController.updateInstructor);

// DELETE: Remove an instructor by ID (protected)
router.delete('/:id', authMiddleware, instructorController.deleteInstructor);

// POST: Instructor login
router.post('/login', instructorController.loginInstructor);

// POST: Instructor logout
router.post('/logout', authMiddleware, instructorController.logoutInstructor); // Added logout route (optional auth)

module.exports = router;
