const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
<<<<<<< HEAD
const authMiddleware = require('../middleware/auth'); // Corrected path
=======
>>>>>>> DEVELOPER2

// POST: Register a new student
router.post('/register', studentController.createStudent);

// POST: Login a student
router.post('/login', studentController.loginStudent);

// GET: Retrieve all students with optional pagination (requires authentication)
<<<<<<< HEAD
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
=======
router.get('/', studentController.getStudents);

// GET: Retrieve a specific student by ID (requires authentication)
router.get('/:id',studentController.getStudentById);

// PATCH: Update an existing student by ID (requires authentication)
router.patch('/update/:id', studentController.updateStudent);

// DELETE: Remove a student by ID (requires authentication)
router.delete('/delete/:id', studentController.deleteStudent);

// PATCH: Partially update student fields by student_id (requires authentication)
router.patch('/:student_id',  studentController.patchStudent);

// GET: Search students based on criteria (name, department, student_id) (requires authentication)
router.get('/search', studentController.searchStudents);
>>>>>>> DEVELOPER2

// Student Logout route
router.post('/logout', studentController.logoutStudent);

<<<<<<< HEAD
=======
// POST: Create a new student
router.post('/create', studentController.createStudent);

>>>>>>> DEVELOPER2
module.exports = router;
