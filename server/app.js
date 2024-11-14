//app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('./models/User');  // Make sure to define the User model correctly
const validateGoogleTokenMiddleware = require('./middleware/validateGoogleTokenMiddleware');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Import route files
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const thesisRoutes = require('./routes/thesisRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const submissionHistoryRoutes = require('./routes/submissionHistoryRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const adminRoutes = require('./routes/adminRoutes'); //  
const userManagementRoutes = require('./routes/userManagementRoutes');
const systemConfigRoutes = require('./routes/systemConfigRoutes');
const adminNotificationRoutes = require('./routes/adminNotificationRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');




// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Google registration route with middleware
app.post('/api/students/google-register', validateGoogleTokenMiddleware, async (req, res) => {
    console.log("Google registration request payload:", req.googlePayload);  // Debugging output

    const { email, name } = req.googlePayload;

    try {
        const user = await User.findOne({ email });
        if (user) {
            console.log(`User with email ${email} already registered.`);
            return res.status(400).json({ message: 'User already registered' });
        }

        // Create new user
        const newUser = new User({
            email,
            first_name: name.split(' ')[0],
            last_name: name.split(' ')[1] || '',
            // other fields as needed
        });

        await newUser.save();

        const authToken = generateToken(newUser);
        res.json({ success: true, token: authToken });
    } catch (error) {
        console.error('Error in Google registration:', error.message);
        res.status(500).json({ message: 'Google registration failed. Please try again.' });
    }
});


// JWT Token generation function
function generateToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,  // Ensure this is set in your .env file
        { expiresIn: '1h' }
    );
}

// Middleware to parse JSON, enable CORS, and set security headers
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'  // Ensure this matches your frontend URL
}));
app.use(helmet());
app.use(morgan('combined')); // Logs all requests

// Connect to MongoDB
if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined in environment variables');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // Exit the app if the connection fails
    });

// Set up routes for various entities
app.use('/api/admins', adminRoutes);
app.use('/api/user_management', userManagementRoutes);
app.use('/api/system_configurations', systemConfigRoutes);
app.use('/api/admin_notifications', adminNotificationRoutes);
app.use('/api/audit_logs', auditLogRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/submissionhistories', submissionHistoryRoutes);
app.use('/api/thesis', thesisRoutes);

// Authentication Routes
app.use('/api/auth', authRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to the Online Thesis Submission and Review System API');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.status || 500;
    res.status(statusCode).json({ message: statusCode === 500 ? 'Something went wrong!' : err.message });
});

// Start the server
app.listen(PORT, () => { //Error: listen EADDRINUSE: address already in use :::5000
    console.log(`Server running on http://localhost:${PORT}`);
});
