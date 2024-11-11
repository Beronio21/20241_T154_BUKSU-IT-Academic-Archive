const express = require('express');
const router = express.Router();
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

module.exports = router;
