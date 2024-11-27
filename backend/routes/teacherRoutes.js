const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const auth = require('../middleware/auth');

// Create a new teacher
router.post('/', auth, async (req, res) => {
    try {
        const teacher = new User({ ...req.body, role: 'teacher' });
        await teacher.save();
        res.status(201).json(teacher);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all teachers
router.get('/', auth, async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' });
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a teacher
router.put('/:id', auth, async (req, res) => {
    try {
        const teacher = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(teacher);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a teacher
router.delete('/:id', auth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Teacher deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 