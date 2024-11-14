//server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Import the auth controller
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');  // Import Admin model
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


router.post('/google-login', async (req, res) => {
    try {
        const { token } = req.body;

        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        // Extract user info from Google token payload
        const { email, name, sub: googleId } = ticket.getPayload();

        // Check if necessary fields are present
        if (!email || !googleId) {
            return res.status(400).json({ success: false, message: 'Missing required Google user data' });
        }

        // Attempt to find existing student by Google ID or email
        let student = await Student.findOne({ $or: [{ googleId }, { email }] });

        if (!student) {
            // If no existing student found, create a new one
            student = await Student.create({
                googleId,
                email,
                first_name: name.split(' ')[0],
                last_name: name.split(' ')[1] || '',
                password_hash: '',  // No password for Google login
                contact_number: '',
                gender: '',
                birthday: new Date(),  // Optional, set later
                department: '',
                course: '',
                year_level: '',
                isGoogleAuth: true
            });
        } else if (!student.googleId) {
            // If student found by email but without Google ID, update to add Google ID
            student.googleId = googleId;
            await student.save();
        }

        // Generate JWT token for the student
        const jwtToken = jwt.sign({ studentId: student._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Send the JWT token back to the client
        res.json({ success: true, token: jwtToken });
    } catch (error) {
        console.error('Google login failed:', error);
        res.status(400).json({ success: false, message: 'Google login failed', error: error.message });
    }
});
// Student login route
router.post('/student/login', authController.studentLogin); // Student login

// Instructor login route
router.post('/instructor/login', authController.instructorLogin); // Instructor login

// Admin login route
router.post('/admin/login', authController.adminLogin); // Admin login route


module.exports = router;
