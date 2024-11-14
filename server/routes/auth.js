//routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Student = require('../models/Student');
const Instructor = require('../models/Instructor');
const Admin = require('../models/Admin'); // Import the Admin model
const router = express.Router();

const createToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Student Login
router.post('/login/student', async (req, res) => {
    const { email, password } = req.body;

    try {
        const student = await Student.findOne({ email });
        if (student && await bcrypt.compare(password, student.password_hash)) {
            const token = createToken({ _id: student._id, role: 'Student' });
            res.json({ token, role: 'Student' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Instructor Login
router.post('/login/instructor', async (req, res) => {
    const { email, password } = req.body;

    try {
        const instructor = await Instructor.findOne({ email });
        if (instructor && await bcrypt.compare(password, instructor.password_hash)) {
            const token = createToken({ _id: instructor._id, role: 'Instructor' });
            res.json({ token, role: 'Instructor' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Admin Login
router.post('/login/admin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (admin && admin.password_hash === password) { // Only for testing (plain-text password check)
            const token = createToken({ _id: admin._id, role: 'Admin' });
            res.json({ token, role: 'Admin' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

module.exports = router;
