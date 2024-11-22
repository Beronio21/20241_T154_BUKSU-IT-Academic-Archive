const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Teacher = require('../models/Teacher');
const bcrypt = require('bcrypt');

// Google OAuth login
router.post('/google', async (req, res) => {
    try {
        const { access_token } = req.body;
        
        if (!access_token) {
            return res.status(400).json({
                status: 'error',
                message: 'Access token is required'
            });
        }

        // Get user info from Google
        const googleUserInfo = await axios.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            }
        ).catch(error => {
            console.error('Google API error:', error.response?.data || error.message);
            throw new Error('Failed to verify Google token');
        });

        const { email, name, picture } = googleUserInfo.data;
        console.log('Google user info:', { email, name, picture });

        // Determine role based on email
        let role;
        if (email === 'ivanrebato01@gmail.com') {
            role = 'admin';
        } else if (email.endsWith('@student.buksu.edu.ph')) {
            role = 'student';
        } else if (email.endsWith('@gmail.com')) {
            role = 'teacher';
        } else {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid email domain'
            });
        }

        // Find or create user
        let user = await User.findOne({ email });
        
        if (!user) {
            user = new User({
                name,
                email,
                image: picture,
                role,
                isProfileComplete: false
            });
            await user.save();
        }

        const token = jwt.sign(
            { 
                userId: user._id, 
                role: user.role,
                email: user.email,
                isProfileComplete: user.isProfileComplete
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                    isProfileComplete: user.isProfileComplete
                },
                token
            }
        });

    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Authentication failed'
        });
    }
});

// Email/Password login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);

        // First try to find a teacher
        let teacher = await Teacher.findOne({ email });
        
        if (teacher) {
            // Check teacher password
            const isMatch = await bcrypt.compare(password, teacher.password);
            if (!isMatch) {
                console.log('Teacher password mismatch');
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid email or password'
                });
            }

            const token = jwt.sign(
                { 
                    userId: teacher._id,
                    email: teacher.email,
                    role: 'teacher'
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.json({
                status: 'success',
                data: {
                    user: {
                        id: teacher._id,
                        name: teacher.name,
                        email: teacher.email,
                        role: 'teacher',
                        image: teacher.image
                    },
                    token
                }
            });
        }

        // If no teacher found, try student
        const student = await User.findOne({ email });
        if (!student) {
            console.log('No user found with email:', email);
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        // Check student password
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            console.log('Student password mismatch');
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            { 
                userId: student._id,
                email: student.email,
                role: student.role
            },
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
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Verify token
router.post('/verify-token', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                status: 'error',
                message: 'Token is required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isProfileComplete: user.isProfileComplete
                }
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({
            status: 'error',
            message: 'Invalid token'
        });
    }
});

module.exports = router;