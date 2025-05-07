require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./models/dbConnect');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const thesisRoutes = require('./routes/thesisRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const recaptchaRoutes = require('./routes/recaptchaRoutes');
const studentRoutes = require('./routes/studentRoutes');
const { google } = require('googleapis');
const calendarRoutes = require('./routes/calendarRoutes');

const app = express();

// Connect to MongoDB - just call the function directly
connectDB();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'success',
        message: 'Server is running',
        timestamp: new Date(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/thesis', thesisRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', userRoutes);
app.use('/api', recaptchaRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/calendar', calendarRoutes);
app.use(cors({ origin: "http://192.168.1.135:5173" }));


const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];

app.get('/api/gmail/auth', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });
    res.redirect(url);
});

app.get('/google-callback', async (req, res) => {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    res.redirect('/api/gmail/emails');
});

app.get('/api/gmail/emails', async (req, res) => {
    try {
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 10
        });

        const messages = response.data.messages || [];
        const emails = await Promise.all(messages.map(async (message) => {
            const email = await gmail.users.messages.get({ userId: 'me', id: message.id });
            const subject = email.data.payload.headers.find(header => header.name === 'Subject').value;
            const from = email.data.payload.headers.find(header => header.name === 'From').value;
            return { from, subject };
        }));

        res.json(emails);
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).send('Error fetching emails');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    console.log('404 for path:', req.path);
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 8080;

// Start server only after DB connection
mongoose.connection.once('open', () => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`MongoDB connected: ${mongoose.connection.host}`);
    });
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

module.exports = app;