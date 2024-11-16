// controllers/UserController.js
const Student = require('../models/Student');
const Instructor = require('../models/Instructor');

exports.getAllUsers = async (req, res) => {
    try {
        console.log('Fetching students and instructors...');
        const students = await Student.find();
        const instructors = await Instructor.find();
        console.log('Students:', students);
        console.log('Instructors:', instructors);

        res.status(200).json({ students, instructors });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to retrieve users', error });
    }
};

// Create a new user (student or instructor)
exports.createUser = async (req, res) => {
    try {
        const { userType, ...userData } = req.body;
        let newUser;

        if (userType === 'student') {
            newUser = new Student(userData);
        } else if (userType === 'instructor') {
            newUser = new Instructor(userData);
        } else {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create user', error });
    }
};

// Update a user by ID
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { userType, ...userData } = req.body;

        let updatedUser;

        if (userType === 'student') {
            updatedUser = await Student.findByIdAndUpdate(id, userData, { new: true });
        } else if (userType === 'instructor') {
            updatedUser = await Instructor.findByIdAndUpdate(id, userData, { new: true });
        } else {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user', error });
    }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
    try {
        const { id, userType } = req.params;

        let deletedUser;

        if (userType === 'student') {
            deletedUser = await Student.findByIdAndDelete(id);
        } else if (userType === 'instructor') {
            deletedUser = await Instructor.findByIdAndDelete(id);
        } else {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error });
    }
};
