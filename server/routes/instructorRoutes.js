const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController'); // Import the instructor controller

// GET: Retrieve all instructors
router.get('/', instructorController.getAllSubmissions); // Use the controller method

// GET: Retrieve a specific instructor by ID
router.get('/:id', instructorController.getSubmissionById); // Use the controller method

// POST: Add a new instructor
router.post('/', instructorController.addInstructor); // Add a new method in the controller

// PATCH: Update an instructor's details
router.patch('/:id', instructorController.updateInstructor); // Add a new method in the controller

// DELETE: Remove an instructor by ID
router.delete('/:id', instructorController.deleteInstructor); // Add a new method in the controller

module.exports = router;
