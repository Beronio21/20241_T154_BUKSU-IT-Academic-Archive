// server/app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// Import route files
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');// error
const thesisRoutes = require('./routes/thesisRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const submissionHistoryRoutes = require('./routes/submissionHistoryRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
// Admin
const adminRoutes = require('./routes/adminRoutes');
const userManagementRoutes = require('./routes/userManagementRoutes');
const systemConfigRoutes = require('./routes/systemConfigRoutes');
const adminNotificationRoutes = require('./routes/adminNotificationRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');

// Middleware to parse JSON
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173' // Adjust this port if your frontend runs on a different one
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // Exit the app if the connection fails
    });

// Admin Routes
app.use('/api/admins', adminRoutes);
app.use('/api/user_management', userManagementRoutes);
app.use('/api/system_configurations', systemConfigRoutes);
app.use('/api/admin_notifications', adminNotificationRoutes);
app.use('/api/audit_logs', auditLogRoutes);

// Routes for other entities
app.use('/api/instructors', instructorRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/theses', thesisRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/submissionhistories', submissionHistoryRoutes);

// Authentication Routes
app.use('/api/auth', authRoutes); // Set up login route at /api/auth/login

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to the Online Thesis Submission and Review System API');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
