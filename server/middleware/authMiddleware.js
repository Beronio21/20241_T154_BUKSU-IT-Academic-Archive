const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// Middleware to check if the user is authenticated
const authMiddleware = (req, res, next) => {
    // Get token from headers (usually in the "Authorization" header)
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Add the decoded token (with studentId) to the request object
        next(); // Continue to the next middleware or route handler
    } catch (error) {
        res.status(403).json({ message: 'Invalid token. Access denied.' });
    }
};

module.exports = authMiddleware;
