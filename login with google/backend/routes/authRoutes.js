const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');

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
            try {
                await user.save();
                console.log('New user created:', user);
            } catch (error) {
                console.error('User creation error:', error);
                throw new Error('Failed to create user');
            }
        }

        // Generate JWT token
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined');
            throw new Error('Server configuration error');
        }

        const token = jwt.sign(
            { 
                userId: user._id, 
                role: user.role,
                email: user.email,
                isProfileComplete: user.isProfileComplete
            },
            process.env.JWT_SECRET,
            { 
                expiresIn: '24h',
                algorithm: 'HS256'
            }
        );

        // Update last login
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
                    isProfileComplete: user.isProfileComplete,
                    student_id: user.student_id,
                    contact_number: user.contact_number,
                    location: user.location,
                    birthday: user.birthday,
                    gender: user.gender,
                    course: user.course,
                    year: user.year
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

// Verify token route
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

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email });

        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        // Use bcrypt to compare the password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = jwt.sign(
            { 
                userId: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    image: user.image
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Login failed'
        });
    }
});

module.exports = router;