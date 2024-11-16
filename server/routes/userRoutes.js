//routes/userRoutes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const authMiddleware = require('../middleware/auth');

// Fetch all users (open to all authenticated users)
router.get(
    '/',
    authMiddleware(), // Any authenticated user
    userController.getAllUsers
);

// Create a new user (Admin only)
router.post(
    '/',
    authMiddleware(['Admin']), // Only Admin can create users
    userController.createUser
);

// Update a user by ID (Admin only)
router.put(
    '/:id',
    authMiddleware(['Admin']), // Only Admin can update users
    userController.updateUser
);

// Delete a user by ID and userType (Admin only)
router.delete(
    '/:id/:userType',
    authMiddleware(['Admin']), // Only Admin can delete users
    userController.deleteUser
);

module.exports = router;
