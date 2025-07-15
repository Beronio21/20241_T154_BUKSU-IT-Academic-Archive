const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Teacher = require('../models/Teacher');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('Auth header:', authHeader);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('Token:', token);

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);
            
            let user = await User.findById(decoded.userId);
            if (!user) {
                user = await Teacher.findById(decoded.userId);
            }
            if (!user) {
                throw new Error('User not found');
            }

            req.user = user;
            req.token = token;
            
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                status: 'error',
                message: 'Token verification error: ' + error.message
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