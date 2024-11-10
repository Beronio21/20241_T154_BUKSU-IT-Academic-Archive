//middleware/auth.js
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Instructor = require('../models/Instructor');

const authenticateUser = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // Fetch user type based on role and ID
        if (decoded.role === 'Student') {
            req.userData = await Student.findById(decoded.id);
        } else if (decoded.role === 'Instructor') {
            req.userData = await Instructor.findById(decoded.id);
        }

        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticateUser;
