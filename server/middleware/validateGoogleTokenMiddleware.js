// validateGoogleTokenMiddleware.js
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const validateGoogleTokenMiddleware = async (req, res, next) => {
    const { token } = req.body;
    
    if (!token) {
        console.log("No token in request body:", req.body);  // Debugging output
        return res.status(400).json({ message: 'Google token is required' });
    }

    try {
        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        req.googlePayload = ticket.getPayload();
        next();  // Pass control to the next middleware/route handler
    } catch (error) {
        console.error('Invalid Google token:', error.message);
        return res.status(401).json({ message: 'Invalid Google token' });
    }
};

module.exports = validateGoogleTokenMiddleware;
