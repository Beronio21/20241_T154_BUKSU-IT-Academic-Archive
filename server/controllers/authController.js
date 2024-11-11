<<<<<<< HEAD
// server/controllers/authController.js
const Student = require('../models/Student'); // Use the Student model
const bcrypt = require('bcryptjs'); // Use bcryptjs instead of bcrypt
const jwt = require('jsonwebtoken'); // Ensure this is installed

exports.login = async (req, res) => {
=======
//authController.js
const Student = require('../models/Student'); // Import the Student model
const Instructor = require('../models/Instructor'); // Import the Instructor model
const bcrypt = require('bcryptjs'); // Use bcryptjs instead of bcrypt
const jwt = require('jsonwebtoken'); // Ensure this is installed

// Student login
exports.studentLogin = async (req, res) => {
>>>>>>> INTEGRATION
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
<<<<<<< HEAD
        console.error("Login error:", error.message); // Log the error for debugging
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
};
=======
        console.error("Student login error:", error.message); // Log the error for debugging
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
};

exports.instructorLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log('Login attempt for instructor with email:', email);
        
        // Find the instructor by email
        const instructor = await Instructor.findOne({ email });
        if (!instructor) {
            console.log('Instructor not found');
            return res.status(404).json({ message: 'Instructor not found' });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, instructor.password_hash);
        if (!isMatch) {
            console.log('Password mismatch');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token if credentials are correct
        const token = jwt.sign({ instructorId: instructor._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, token });
    } catch (error) {
        console.error('Instructor login error:', error.message);  // Log any error for debugging
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
};
>>>>>>> INTEGRATION
