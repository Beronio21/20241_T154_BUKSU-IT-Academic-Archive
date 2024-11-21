const express = require('express');
const router = express.Router();
const { registerStudent, loginStudent } = require('../controllers/StudentController');
const Student = require('../models/Student');

// Register route
router.post('/register', registerStudent);

// Login route
router.post('/login', loginStudent);

// Example: Get all students (you need to implement this in your controller)
router.get('/', async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;