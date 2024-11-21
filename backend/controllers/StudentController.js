const Student = require('../models/Student');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new student
exports.registerStudent = async (req, res) => {
    console.log('Register student endpoint hit');
    try {
        const { student_id, first_name, last_name, email, password, contact_number, gender, birthday, department, course, year_level } = req.body;

        // Check if student already exists
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student already registered' });
        }

        // Hash the password
        const password_hash = await bcrypt.hash(password, 10);

        // Create new student
        const student = new Student({
            student_id,
            first_name,
            last_name,
            email,
            password_hash,
            contact_number,
            gender,
            birthday,
            department,
            course,
            year_level
        });

        await student.save();
        console.log('Student registered:', student);

        res.status(201).json({ message: 'Student registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Login a student
exports.loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);

        // Convert email to lowercase for case-insensitive comparison
        const student = await Student.findOne({ email: email.toLowerCase() });
        if (!student) {
            console.log('No student found with email:', email);
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password using bcrypt.compare
        const isMatch = await bcrypt.compare(password, student.password_hash);
        if (!isMatch) {
            console.log('Password mismatch for email:', email);
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT
        const token = jwt.sign(
            { 
                userId: student._id, 
                email: student.email,
                role: 'student',
                isProfileComplete: true 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Login successful for:', email);
        res.status(200).json({ message: 'Login successful', token, student });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};