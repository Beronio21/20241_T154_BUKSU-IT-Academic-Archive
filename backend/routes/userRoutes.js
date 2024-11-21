const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const auth = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const user = new User(req.body);
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
router.put('/profile', auth, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const user = await User.findById(req.user._id);
        
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

module.exports = router; 