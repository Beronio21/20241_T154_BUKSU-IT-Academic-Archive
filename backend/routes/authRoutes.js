const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Teacher = require('../models/Teacher');
const bcrypt = require('bcryptjs');

// Google OAuth login (teachers/admin only)
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
        // Check teacher first
        let teacher = await Teacher.findOne({ email });
        if (!teacher) {
            // Create new teacher with Google info and a random password
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await require('bcryptjs').hash(randomPassword, 10);
            teacher = new Teacher({
                name,
                email,
                password: hashedPassword,
                image: picture,
                role: 'teacher',
                isProfileComplete: false
            });
            await teacher.save();
        }
        if (teacher) {
            const token = jwt.sign(
                { 
                    userId: teacher._id,
                    email: teacher.email,
                    role: 'teacher'
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            teacher.lastLogin = new Date();
            await teacher.save();
            return res.json({
                status: 'success',
                data: {
                    user: {
                        _id: teacher._id,
                        name: teacher.name,
                        email: teacher.email,
                        role: 'teacher',
                        image: teacher.image
                    },
                    token
                }
            });
        }
        // Check admin in User model
        let admin = await User.findOne({ email, role: 'admin' });
        if (admin) {
            const token = jwt.sign(
                {
                    userId: admin._id,
                    email: admin.email,
                    role: 'admin'
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            admin.lastLogin = new Date();
            await admin.save();
            return res.json({
                status: 'success',
                data: {
                    user: {
                        _id: admin._id,
                        name: admin.name,
                        email: admin.email,
                        role: 'admin',
                        image: admin.image
                    },
                    token
                }
            });
        }
        return res.status(401).json({
            status: 'error',
            message: 'Only BUKSU faculty emails (@buksu.edu.ph) or @gmail.com are allowed for teacher/admin login'
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Authentication failed'
        });
    }
});

// Email/Password login (teachers/admin only)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check teacher first
        let teacher = await Teacher.findOne({ email });
        if (teacher) {
            const isMatch = await bcrypt.compare(password, teacher.password);
            if (!isMatch) {
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
                        _id: teacher._id,
                        name: teacher.name,
                        email: teacher.email,
                        role: 'teacher',
                        image: teacher.image
                    },
                    token
                }
            });
        }
        // Check admin in User model
        let admin = await User.findOne({ email, role: 'admin' });
        if (admin) {
            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid email or password'
                });
            }
            const token = jwt.sign(
                {
                    userId: admin._id,
                    email: admin.email,
                    role: 'admin'
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            return res.json({
                status: 'success',
                data: {
                    user: {
                        _id: admin._id,
                        name: admin.name,
                        email: admin.email,
                        role: 'admin',
                        image: admin.image
                    },
                    token
                }
            });
        }
        return res.status(401).json({
            status: 'error',
            message: 'Invalid email or password'
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

// Remove student token verification
// Only keep teacher/admin token verification if needed

module.exports = router;