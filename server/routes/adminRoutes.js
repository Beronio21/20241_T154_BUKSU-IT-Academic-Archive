// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');
const authMiddleware = require('../middleware/auth'); // Authentication middleware for protected routes

// POST: Register a new admin (createAdmin)
router.post('/register', adminController.createAdmin);

// POST: Login an admin (loginAdmin)
router.post('/login', adminController.loginAdmin);

// GET: Retrieve all admins (requires authentication)
router.get('/', authMiddleware, adminController.getAllAdmins);

// GET: Retrieve a specific admin by ID (requires authentication)
router.get('/:admin_id', authMiddleware, adminController.getAdminById);

// PUT: Update an existing admin by ID (requires authentication)
router.put('/:admin_id', authMiddleware, adminController.updateAdmin);

// DELETE: Remove an admin by ID (requires authentication)
router.delete('/:admin_id', authMiddleware, adminController.deleteAdmin);

// Admin Logout route
router.post('/logout', adminController.logoutAdmin);

module.exports = router;
