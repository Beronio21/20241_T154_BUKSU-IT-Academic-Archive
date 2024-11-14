// routes/instructorRoutes.js
const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const authMiddleware = require('../middleware/auth'); // Adjust path as needed

// Register a new instructor
router.post('/register', instructorController.registerInstructor);

// Login an instructor
router.post('/login', instructorController.loginInstructor);

// Get all instructors (protected route)
router.get('/', authMiddleware, instructorController.getAllInstructors);

// Get an instructor by ID (protected route)
router.get('/:id', authMiddleware, instructorController.getInstructorById);

// Update an instructor (protected route)
router.put('/:id', authMiddleware, instructorController.updateInstructor);

// Delete an instructor (protected route)
router.delete('/:id', authMiddleware, instructorController.deleteInstructor);

// Instructor Logout route
router.post('/logout', instructorController.logoutInstructor);


module.exports = router;
