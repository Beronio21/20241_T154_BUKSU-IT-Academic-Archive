const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Teacher = require('../models/Teacher');

// Get teacher profile
router.get('/', auth, async (req, res) => {
    try {
        console.log('Looking for teacher with email:', req.user.email); // Debug log

        let teacher = await Teacher.findOne({ email: req.user.email });
        
        if (!teacher) {
            console.log('Creating new teacher profile'); // Debug log
            teacher = await Teacher.create({
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                image: req.user.image,
                role: 'teacher',
                teacher_id: '',
                department: '',
                contact_number: '',
                location: '',
                birthday: null,
                gender: ''
            });
            return res.json({
                status: 'success',
                data: newTeacher
            });
        }

        res.json({
            status: 'success',
            data: teacher
        });
    } catch (error) {
        console.error('Get teacher profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    }
});

// Update teacher profile
router.put('/', auth, async (req, res) => {
    try {
        let teacher = await Teacher.findOne({ email: req.user.email });

        if (!teacher) {
            return res.status(404).json({
                status: 'error',
                message: 'Teacher profile not found'
            });
        }

        // Get updates from request body
        const updates = req.body;
        
        // Update all fields except password
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined && key !== 'password') {
                teacher[key] = updates[key];
            }
        });

        // Handle password update separately
        if (updates.password) {
            teacher.password = updates.password; // Direct password update (no hashing for now)
        }

        // Save the updated teacher
        await teacher.save();

        // Return response without password
        const teacherResponse = teacher.toObject();
        delete teacherResponse.password;

        res.json({
            status: 'success',
            data: teacherResponse
        });

    } catch (error) {
        console.error('Update teacher profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update profile'
        });
    }
});

module.exports = router; 