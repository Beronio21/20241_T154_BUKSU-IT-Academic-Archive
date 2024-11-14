// controllers/InstructorController.js
const Instructor = require('../models/Instructor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new instructor
exports.registerInstructor = async (req, res) => {
    try {
        const { instructor_id, first_name, last_name, email, password, contact_number, department } = req.body;

        // Check if instructor already exists
        const existingInstructor = await Instructor.findOne({ email });
        if (existingInstructor) {
            return res.status(400).json({ message: 'Instructor already exists' });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        const instructor = new Instructor({
            instructor_id,
            first_name,
            last_name,
            email,
            password_hash,
            contact_number,
            department
        });

        await instructor.save();
        res.status(201).json({ message: 'Instructor registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering instructor', error });
    }
};

// Login an instructor
exports.loginInstructor = async (req, res) => {
    try {
        const { email, password } = req.body;

        const instructor = await Instructor.findOne({ email });
        if (!instructor) {
            return res.status(400).json({ message: 'Instructor not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, instructor.password_hash);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: instructor._id, role: instructor.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

// Get all instructors
exports.getAllInstructors = async (req, res) => {
    try {
        const instructors = await Instructor.find();
        res.json(instructors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching instructors', error });
    }
};

// Get instructor by ID
exports.getInstructorById = async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id);
        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.json(instructor);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching instructor', error });
    }
};

// Update instructor
exports.updateInstructor = async (req, res) => {
    try {
        const instructor = await Instructor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.json({ message: 'Instructor updated successfully', instructor });
    } catch (error) {
        res.status(500).json({ message: 'Error updating instructor', error });
    }
};

// Delete instructor
exports.deleteInstructor = async (req, res) => {
    try {
        const instructor = await Instructor.findByIdAndDelete(req.params.id);
        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.json({ message: 'Instructor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting instructor', error });
    }
};

const blacklist = new Set(); // In-memory store for blacklisted tokens

// Instructor Logout
exports.logoutInstructor = (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract the token from the header

    if (token) {
        blacklist.add(token); // Add the token to the blacklist
        return res.json({ message: 'Instructor logged out successfully' });
    } else {
        return res.status(400).json({ message: 'No token provided' });
    }
};