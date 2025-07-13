const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
// const auth = require('../middleware/auth'); // REMOVE auth middleware for public access

// Create a new student (admin/teacher only, so remove from public API)
// router.post('/', auth, async (req, res) => { ... });

// Get all students (public, no auth)
router.get('/', async (req, res) => {
    try {
        const students = await User.find({ role: 'student' });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a student (admin/teacher only, so remove from public API)
// router.put('/:id', auth, async (req, res) => { ... });

// Delete a student (admin/teacher only, so remove from public API)
// router.delete('/:id', auth, async (req, res) => { ... });

module.exports = router;