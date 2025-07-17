const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const auth = require('../middleware/auth');
const Teacher = require('../models/Teacher');
const bcrypt = require('bcryptjs');

// Create a new teacher (registration, no auth required)
router.post('/', async (req, res) => {
    try {
        const { name, email, password, department, contact_number, location, birthday, gender } = req.body;
        // Validate required fields
        if (!name || !email || !password || !department || !contact_number || !location || !birthday || !gender) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        // Check for duplicate email
        const existing = await Teacher.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'A teacher with this email already exists.' });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create teacher
        const teacher = new Teacher({
            name,
            email,
            password: hashedPassword,
            department,
            contact_number,
            location,
            birthday,
            gender,
            role: 'teacher',
            isProfileComplete: false,
            status: 'Pending'
        });
        await teacher.save();
        // Admin notification for new teacher registration
        const Notification = require('../models/notification');
        const adminEmail = 'admin@buksu.edu.ph';
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const existingNotification = await Notification.findOne({
            recipientEmail: adminEmail,
            type: 'admin_event',
            title: 'New Teacher Registered',
            message: `A new teacher account has been registered: ${teacher.email}`,
            createdAt: { $gte: oneHourAgo }
        });
        if (!existingNotification) {
            await Notification.create({
                recipientEmail: adminEmail,
                title: 'New Teacher Registered',
                message: `A new teacher account has been registered: ${teacher.email}`,
                type: 'admin_event',
                read: false
            });
        }
        res.status(201).json({ message: 'Teacher registered successfully.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all teachers
router.get('/', auth, async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single teacher by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a teacher
router.put('/:id', auth, async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        // Emit real-time update event
        const io = req.app.get('io');
        io.emit('teacherUpdated', { teacherId: teacher._id, data: teacher });
        res.json(teacher);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a teacher
router.delete('/:id', auth, async (req, res) => {
    try {
        await Teacher.findByIdAndDelete(req.params.id);
        res.json({ message: 'Teacher deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 