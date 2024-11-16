// middleware/auth.js
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Instructor = require('../models/Instructor');
const Admin = require('../models/Admin');

const authMiddleware = (allowedRoles = []) => {
    return async (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'Authentication required' });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // Find the user data based on the role
            if (decoded.role === 'Student') {
                req.userData = await Student.findById(decoded.id);
            } else if (decoded.role === 'Instructor') {
                req.userData = await Instructor.findById(decoded.id);
            } else if (decoded.role === 'Admin') {
                req.userData = await Admin.findById(decoded.id);
            }

            // Check if the user's role is included in the allowed roles
            if (!allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Forbidden: Access denied' });
            }

            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            res.status(401).json({ message: 'Invalid or expired token' });
        }
    };
};

module.exports = authMiddleware;
