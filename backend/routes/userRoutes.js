const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

// Register new user
router.post('/register', async (req, res) => {
    try {
        // Normalize gender to lowercase
        if (req.body.gender) {
            req.body.gender = req.body.gender.toLowerCase();
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            ...req.body,
            password: hashedPassword,
            admin_id: req.body.adminId
        });
        if (!user.validateRoleFields()) {
            return res.status(400).json({ message: 'Missing required fields for role' });
        }
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update user profile
router.put('/profile/:userId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updates = Object.keys(req.body);
        updates.forEach(update => user[update] = req.body[update]);

        if (!user.validateRoleFields()) {
            return res.status(400).json({ message: 'Missing required fields for role' });
        }

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all students
router.get('/students', auth, async (req, res) => {
    try {
        const students = await User.find({ role: 'student' });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Check lock status of a user
router.get('/users/:userId/lock-status', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ lock: user.lock });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Lock a user
router.post('/users/:userId/lock', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.lock) {
            return res.status(423).json({ message: 'User is already locked' });
        }
        user.lock = true;
        await user.save();
        res.status(200).json({ message: 'User locked successfully' });
    } catch (error) {
        console.error('Error locking user:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Unlock a user
router.post('/users/:userId/unlock', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.lock = false;
        await user.save();
        res.status(200).json({ message: 'User unlocked successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 