const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const instructorController = require('../controllers/instructorController'); // Import the instructor controller

// GET: Retrieve all instructors
router.get('/', instructorController.getAllInstructors); // Updated to reflect a more accurate name

// GET: Retrieve a specific instructor by ID
router.get('/:id', instructorController.getInstructorById); // Updated to reflect a more accurate name

// POST: Add a new instructor
router.post('/', instructorController.addInstructor); // This will handle instructor registration

// PATCH: Update an instructor's details
router.patch('/:id', instructorController.updateInstructor); // Update instructor details

// DELETE: Remove an instructor by ID
router.delete('/:id', instructorController.deleteInstructor); // Delete instructor
=======
const instructorController = require('../controllers/instructorController');

// GET: Retrieve all instructors
router.get('/', instructorController.getAllInstructors);

// GET: Retrieve a specific instructor by ID
router.get('/:id', instructorController.getInstructorById);

// POST: Add a new instructor
router.post('/', instructorController.addInstructor);

// PATCH: Update an instructor's details
router.patch('/:id', instructorController.updateInstructor);

// DELETE: Remove an instructor by ID
router.delete('/:id', instructorController.deleteInstructor);

// POST: Instructor login
router.post('/login', instructorController.loginInstructor); // Added login route
>>>>>>> INTEGRATION

module.exports = router;
