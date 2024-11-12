// middleware/authConfig.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Ensure required environment variables are set
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, JWT_SECRET } = process.env;
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !JWT_SECRET) {
    console.error("Missing required environment variables for Google OAuth.");
    process.exit(1); // Exit the app if critical environment variables are missing
}

// Import the Student model
const Student = require('../models/Student');

passport.use(new GoogleStrategy(
    {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback',
        scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Look for an existing student by their Google email
            let student = await Student.findOne({ email: profile.emails[0].value });

            // If student doesn't exist, create a new student in the database
            if (!student) {
                student = await Student.create({
                    student_id: profile.id,
                    first_name: profile.name.givenName,
                    last_name: profile.name.familyName,
                    email: profile.emails[0].value,
                    password: '', // Empty password for OAuth login
                    contact_number: '', // Optional, set later
                    gender: '', // Optional, set later
                    birthday: new Date(), // Optional, can update later
                    department: '',
                    course: '',
                    year_level: '',
                    isGoogleAuth: true
                });
            }

            // Generate JWT token with student ID as payload
            const token = jwt.sign({ studentId: student._id }, JWT_SECRET, { expiresIn: '1h' });

            // Return the student and the token
            done(null, { student, token });
        } catch (error) {
            console.error("Google OAuth error:", error);
            done(error, null);
        }
    }
));

// Optionally customize Passport serialization/deserialization for session handling
passport.serializeUser((student, done) => {
    done(null, student);
});

passport.deserializeUser((student, done) => {
    done(null, student);
});

module.exports = passport;
