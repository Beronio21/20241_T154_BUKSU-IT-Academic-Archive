//server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Import the auth controller

// Student login route
router.post('/student/login', authController.studentLogin); // Student login

// Instructor login route
router.post('/instructor/login', authController.instructorLogin); // Instructor login

module.exports = router;
