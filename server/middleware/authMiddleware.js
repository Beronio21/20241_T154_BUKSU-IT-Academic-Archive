const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// Middleware to check if the user is authenticated
const authMiddleware = (req, res, next) => {
    // Get token from headers (usually in the "Authorization" header)
    const authHeader = req.headers['authorization'];

    // Check if the authorization header is present
    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Extract the token
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Add the decoded token (with user details) to the request object
        next(); // Continue to the next middleware or route handler
    } catch (error) {
        res.status(403).json({ message: 'Invalid token. Access denied.', error: error.message });
    }
};

module.exports = authMiddleware;
