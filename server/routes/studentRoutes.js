const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const studentController = require('../controllers/studentController'); // Ensure this path is correct
const authMiddleware = require('../middleware/authMiddleware'); // Import auth middleware

// POST: Register a new student
router.post('/register', studentController.createStudent); // Register a new student

// POST: Login a student
router.post('/login', studentController.loginStudent); // Login student and generate token

// GET: Retrieve all students with optional pagination (requires authentication)
router.get('/', authMiddleware, studentController.getStudents); // Fetch all students, optional pagination

// GET: Retrieve a specific student by ID (requires authentication)
router.get('/:id', authMiddleware, studentController.getStudentById); // Get a student by ID

// PUT: Update an existing student by ID (requires authentication)
router.put('/:id', authMiddleware, studentController.updateStudent); // Full update of student by ID

// DELETE: Remove a student by ID (requires authentication)
router.delete('/:id', authMiddleware, studentController.deleteStudent); // Delete a student by ID

// PATCH: Partially update student fields by student_id (requires authentication)
router.patch('/:student_id', authMiddleware, studentController.patchStudent); // Partially update specific fields

// GET: Search students based on criteria (name, department, student_id) (requires authentication)
router.get('/search', authMiddleware, studentController.searchStudents); // Search for students by criteria
=======
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/auth'); // Corrected path

// POST: Register a new student
router.post('/register', studentController.createStudent);

// POST: Login a student
router.post('/login', studentController.loginStudent);

// GET: Retrieve all students with optional pagination (requires authentication)
router.get('/', authMiddleware, studentController.getStudents);

// GET: Retrieve a specific student by ID (requires authentication)
router.get('/:id', authMiddleware, studentController.getStudentById);

// PUT: Update an existing student by ID (requires authentication)
router.put('/:id', authMiddleware, studentController.updateStudent);

// DELETE: Remove a student by ID (requires authentication)
router.delete('/:id', authMiddleware, studentController.deleteStudent);

// PATCH: Partially update student fields by student_id (requires authentication)
router.patch('/:student_id', authMiddleware, studentController.patchStudent);

// GET: Search students based on criteria (name, department, student_id) (requires authentication)
router.get('/search', authMiddleware, studentController.searchStudents);
>>>>>>> INTEGRATION

module.exports = router;
