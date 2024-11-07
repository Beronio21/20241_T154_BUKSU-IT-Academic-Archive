// server/controllers/authController.js
const Student = require('../models/Student'); // Use the Student model
const bcrypt = require('bcryptjs'); // Use bcryptjs instead of bcrypt
const jwt = require('jsonwebtoken'); // Ensure this is installed

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find the student by email
        const student = await Student.findOne({ email });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, student.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        // Generate a JWT token
        const token = jwt.sign({ studentId: student._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, token });
    } catch (error) {
        console.error("Login error:", error.message); // Log the error for debugging
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
};
