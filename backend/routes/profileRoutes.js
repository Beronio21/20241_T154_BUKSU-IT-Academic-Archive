const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');


// Get profile
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            data: {
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
                student_id: user.student_id,
                contact_number: user.contact_number,
                location: user.location,
                birthday: user.birthday,
                gender: user.gender,
                course: user.course,
                year: user.year,
                isProfileComplete: user.isProfileComplete
            }
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch profile'
        });
    }
});

// Update profile
router.put('/', auth, async (req, res) => {
    try {
        const updates = req.body;
        
        // Format date if provided
        if (updates.birthday) {
            updates.birthday = new Date(updates.birthday);
        }

        // Hash the password if it is being updated
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            user: {
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
                student_id: user.student_id,
                contact_number: user.contact_number,
                location: user.location,
                birthday: user.birthday,
                gender: user.gender,
                course: user.course,
                year: user.year,
                isProfileComplete: user.isProfileComplete
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to update profile'
        });
    }
});

// Add this to your routes
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

module.exports = router; 