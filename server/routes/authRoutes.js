<<<<<<< HEAD
// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Make sure this controller exists

// POST: Login Route
router.post('/login', authController.login);
=======
//server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Import the auth controller

// Student login route
router.post('/student/login', authController.studentLogin); // Student login

// Instructor login route
router.post('/instructor/login', authController.instructorLogin); // Instructor login
>>>>>>> INTEGRATION

module.exports = router;
