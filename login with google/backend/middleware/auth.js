const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const Student = require('../models/Student');  
const Instructor = require('../models/Instructor');
const Admin = require('../models/Admin');


const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'No token provided'
            });
        }

        // Extract token
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find user
            const user = await User.findById(decoded.userId);
            
            if (!user) {
                throw new Error('User not found');
            }

            // Add user info to request
            req.user = user;
            req.token = token;
            
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    }
};

module.exports = auth; 