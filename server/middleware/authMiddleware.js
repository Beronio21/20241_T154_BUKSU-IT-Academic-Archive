//middlware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET, GOOGLE_CLIENT_ID } = process.env;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Function to verify Google Token
async function verifyGoogleToken(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        return ticket.getPayload();
    } catch (error) {
        console.error('Google Token verification error:', error);
        throw new Error('Invalid Google Token');
    }
}

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const googleToken = req.body.token || req.headers['authorization']?.split(' ')[1]; // Support Google token in header or body

    if (googleToken) {
        try {
            const googleUser = await verifyGoogleToken(googleToken);
            req.user = { ...googleUser, isGoogleAuthenticated: true }; 
            next(); 
        } catch (error) {
            return res.status(401).json({ message: 'Invalid Google token. Access denied.' });
        }
    } else if (authHeader) {
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(403).json({ message: 'Token expired. Please log in again.' });
            } else if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token. Access denied.' });
            } else {
                console.error('Unexpected error in authMiddleware:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        }
    } else {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
};

module.exports = authMiddleware;
