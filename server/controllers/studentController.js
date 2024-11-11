// Imports
const Student = require('../models/Student');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

<<<<<<< HEAD
=======
// POST: Login student
exports.loginStudent = async (req, res) => {
    const { email, password } = req.body;

    try {
        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare plain text password with the one stored (hashed)
        const isMatch = await bcrypt.compare(password, student.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create a JWT token (student_id is included in the payload)
        const token = jwt.sign(
            { student_id: student._id, email: student.email },
            process.env.JWT_SECRET, // Ensure you have JWT_SECRET in your .env file
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.json({ token });
    } catch (error) {
        console.error('Error logging in student:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

>>>>>>> INTEGRATION
// Get all students with optional pagination
exports.getStudents = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const students = await Student.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        const count = await Student.countDocuments();
        
        res.json({
            total: count,
            pages: Math.ceil(count / limit),
            students,
        });
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
