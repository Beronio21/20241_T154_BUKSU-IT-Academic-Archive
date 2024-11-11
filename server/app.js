require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import route files
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const thesisRoutes = require('./routes/thesisRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const submissionHistoryRoutes = require('./routes/submissionHistoryRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userManagementRoutes = require('./routes/userManagementRoutes');
const systemConfigRoutes = require('./routes/systemConfigRoutes');
const adminNotificationRoutes = require('./routes/adminNotificationRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON, enable CORS, and set security headers
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
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
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
