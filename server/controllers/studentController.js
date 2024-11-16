//controllers/studentController.js
const Student = require('../models/Student');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { JWT_SECRET, GOOGLE_CLIENT_ID, JWT_EXPIRY_TIME } = process.env;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper function to verify Google Token
async function verifyGoogleToken(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        return ticket.getPayload();  // Return Google user data
    } catch (error) {
        console.error('Google Token verification error:', error);
        throw new Error('Google authentication failed');
    }
}

// Google Register
exports.googleRegister = async (req, res) => {
    try {
        const { token: googleToken } = req.body;

        // Verify Google token
        if (!googleToken) {
            return res.status(400).json({ message: 'Google token is required' });
        }

        const googleUser = await verifyGoogleToken(googleToken);

        // Check if a student already exists by email
        let student = await Student.findOne({ email: googleUser.email });
        if (student) {
            return res.status(200).json({ message: 'Student already registered', student });
        }

        // Create a new student if not exists
        student = new Student({
            first_name: googleUser.given_name || 'Unknown',
            last_name: googleUser.family_name || 'Unknown',
            email: googleUser.email,
            student_id: googleUser.sub,  // Use Google unique ID as student ID
            gender: googleUser.gender || 'Unknown',
            birthday: googleUser.birthdate || 'Not Provided',  // Optional field
            department: 'Unknown',
            course: 'Unknown',
            year_level: 1,
        });

        // Save the new student to the database
        await student.save();

        // Generate JWT token for the student
        const jwtToken = jwt.sign({ studentId: student._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY_TIME || '1h' });

        return res.status(201).json({ message: 'Student registered successfully', student, token: jwtToken });
    } catch (error) {
        console.error('Error during Google registration:', error);
        res.status(500).json({ message: `Error during Google registration: ${error.message}` });
    }
};


// Get all students with optional pagination
exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find()
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving students: " + err.message });
    }
};

// Create a new student with password hashing
exports.createStudent = async (req, res) => {
    try {
        const {
            student_id,
            first_name,
            last_name,
            email,
            password,
            contact_number,
            gender,
            birthday,
            department,
            course,
            year_level,
        } = req.body;

        // Validate required fields
        if (!student_id || !first_name || !last_name || !email || !password || !department || !course || !year_level) {
            return res.status(400).json({ message: "Please fill in all required fields." });
        }

        // Check if email already exists
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: "Email already in use." });
        }

        // Hash the password before saving
        const password_hash = await bcrypt.hash(password, 10);

        const newStudent = new Student({
            student_id,
            first_name,
            last_name,
            email,
            password_hash, // Store hashed password here
            contact_number,
            gender,
            birthday,
            department,
            course,
            year_level,
        });

        const savedStudent = await newStudent.save();
        return res.status(201).json(savedStudent);
    } catch (err) {
        res.status(400).json({ message: "Error creating student: " + err.message });
    }
};

// Login Student and generate JWT token
exports.loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if student exists
        const student = await Student.findOne({ email });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Check if password is correct
        const isMatch = await bcrypt.compare(password, student.password_hash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Generate a JWT token
        const token = jwt.sign({ studentId: student._id }, JWT_SECRET, { expiresIn: '1h' });

        return res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: "Error logging in: " + error.message });
    }
};

// Update an existing student by ID
exports.updateStudent = async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }
        return res.json(updatedStudent);
    } catch (err) {
        res.status(400).json({ message: "Error updating student: " + err.message });
    }
};

// Delete a student by ID
exports.deleteStudent = async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);
        if (!deletedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }
        return res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: "Error deleting student: " + err.message });
    }
};

// PATCH: Update specific fields of a student by student_id
exports.patchStudent = async (req, res) => {
    const { student_id } = req.params;
    const updateData = req.body;

    try {
        const updatedStudent = await Student.findOneAndUpdate(
            { student_id },
            { $set: updateData },
            { new: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        return res.json(updatedStudent);
    } catch (error) {
        res.status(500).json({ message: "Error updating student: " + error.message });
    }
};

// Search Students (by name, department, or student_id)
exports.searchStudents = async (req, res) => {
    try {
        const { name, department, student_id } = req.query;
        const query = {};

        if (name) query.first_name = new RegExp(name, 'i'); // case-insensitive search
        if (department) query.department = department;
        if (student_id) query.student_id = student_id;

        const students = await Student.find(query);
        return res.json(students);
    } catch (error) {
        res.status(500).json({ message: "Error searching students: " + error.message });
    }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        return res.json(student);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving student: " + error.message });
    }
};



const blacklist = new Set(); // In-memory store for blacklisted tokens

// Student Logout
exports.logoutStudent = (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract the token from the header

    if (token) {
        blacklist.add(token); // Add the token to the blacklist
        return res.json({ message: 'Student logged out successfully' });
    } else {
        return res.status(400).json({ message: 'No token provided' });
    }
};