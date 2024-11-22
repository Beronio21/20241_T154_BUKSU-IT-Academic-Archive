const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Student login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const student = await User.findOne({ email, role: 'student' });

        if (!student || student.password !== password) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            { userId: student._id, email: student.email, role: student.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            status: 'success',
            data: {
                user: {
                    id: student._id,
                    name: student.name,
                    email: student.email,
                    role: student.role,
                    image: student.image
                },
                token
            }
        });
    } catch (error) {
        console.error('Student login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Login failed'
        });
    }
});

module.exports = router;