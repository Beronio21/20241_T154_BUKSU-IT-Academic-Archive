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
const systemConfigRoutes = require('./routes/systemConfigRoutes');
const adminNotificationRoutes = require('./routes/adminNotificationRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const userRoutes = require('./routes/userRoutes'); // Import the user routes



// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 5000;


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
    origin: 'http://localhost:5173', // Allow the frontend URL
    methods: ['GET', 'POST', 'PATCH', 'DELETE'], // Allow specific methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow specific headers
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
app.use('/api/system_configurations', systemConfigRoutes);
app.use('/api/admin_notifications', adminNotificationRoutes);
app.use('/api/audit_logs', auditLogRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/submissionhistories', submissionHistoryRoutes);   
app.use('/api/thesis', thesisRoutes);
app.use('/api/users', userRoutes); // Link the route to the '/api/users' path

// Authentication Routes
app.use('/api/auth', authRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to the Online Thesis Submission and Review System API');
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); // Allow the frontend URL
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE'); // Allow methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow headers
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // If you need credentials (cookies, etc.)

    // Handle pre-flight request (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next(); // Pass control to the next middleware or route
});

// Start the server
app.listen(PORT, () => { 
    console.log(`Server running on http://localhost:${PORT}`);
});

