// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController'); // Ensure this path is correct

// POST: Register a new student
router.post('/register', studentController.createStudent); // Corrected case

// Other routes for student-related functionality
router.get('/', studentController.getStudents);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);
router.patch('/:student_id', studentController.patchStudent); // Ensure this matches the exported function

module.exports = router;
