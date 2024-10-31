// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Make sure this controller exists

// POST: Login Route
router.post('/login', authController.login);

module.exports = router;
