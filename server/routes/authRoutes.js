//server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Import the auth controller
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');  // Import Admin model
const { googleAuth } = require('../controllers/authController');

router.get("/google", googleAuth); // error here

// Student login route
router.post('/student/login', authController.studentLogin); // Student login

// Instructor login route
router.post('/instructor/login', authController.instructorLogin); // Instructor login

// Admin login route
router.post('/admin/login', authController.adminLogin); // Admin login route


module.exports = router;
