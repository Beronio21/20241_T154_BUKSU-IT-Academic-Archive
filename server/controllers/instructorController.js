//server/controllers/instructorController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Instructor = require('../models/Instructor');

// GET: Retrieve all instructors
exports.getAllInstructors = async (req, res) => {
    try {
        const instructors = await Instructor.find();
        res.json(instructors);
    } catch (error) {
        console.error("Error retrieving instructors:", error);
        res.status(500).json({ message: error.message });
    }
};

// GET: Retrieve a specific instructor by ID
exports.getInstructorById = async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id);
        if (!instructor) return res.status(404).json({ message: "Instructor not found" });
        res.json(instructor);
    } catch (error) {
        console.error("Error retrieving instructor by ID:", error);
        res.status(500).json({ message: error.message });
    }
};

// POST: Add a new instructor
exports.addInstructor = async (req, res) => {
    const { 
        instructor_id, 
        first_name, 
        last_name, 
        email, 
        password_hash, // This will be hashed before saving
        contact_number, 
        birthday, 
        gender, 
        department, 
        position, 
        profile_picture 
    } = req.body;

    // Validate required fields
    if (!instructor_id || !first_name || !last_name || !email || !password_hash) {
        return res.status(400).json({ message: "Please provide all required fields." });
    }

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password_hash, 10);

        // Create a new instructor instance with the hashed password
        const newInstructor = new Instructor({
            instructor_id,
            first_name,
            last_name,
            email,
            password_hash: hashedPassword, // Store the hashed password here
            contact_number,
            birthday,
            gender,
            department,
            position,
            profile_picture,
            total_reviews: 0, // Default value
            created_at: Date.now(), // Default value
            updated_at: Date.now() // Default value
        });

        const savedInstructor = await newInstructor.save();
        res.status(201).json(savedInstructor);
    } catch (error) {
        console.error("Error adding instructor:", error);
        res.status(400).json({ message: error.message });
    }
};


// PATCH: Update an instructor's details
exports.updateInstructor = async (req, res) => {
    try {
        const updatedInstructor = await Instructor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedInstructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.json(updatedInstructor);
    } catch (error) {
        console.error("Error updating instructor:", error);
        res.status(400).json({ message: error.message });
    }
};

// DELETE: Remove an instructor by ID
exports.deleteInstructor = async (req, res) => {
    try {
        const instructor = await Instructor.findByIdAndDelete(req.params.id);
        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.json({ message: 'Instructor deleted successfully' });
    } catch (error) {
        console.error("Error deleting instructor:", error);
        res.status(500).json({ message: error.message });
    }
};

// POST: Login instructor
// In the loginInstructor function
exports.loginInstructor = async (req, res) => {
    const { email, password } = req.body;

    try {
        const instructor = await Instructor.findOne({ email });
        if (!instructor) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare plain text password with the one stored (not hashed)
        if (password !== instructor.password_hash) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: instructor._id, email: instructor.email },
            process.env.JWT_SECRET, // Ensure you have this in your environment variables
            { expiresIn: '1h' } // Expiration time (1 hour)
        );

        res.json({ token });
    } catch (error) {
        console.error('Error logging in instructor:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
// GET: Retrieve all instructors with full name
exports.getAllInstructors = async (req, res) => {
    try {
        const instructors = await Instructor.find();
        
        // Map through the instructors and create a new array with full name
        const instructorsWithFullName = instructors.map(instructor => ({
            _id: instructor._id,
            name: `${instructor.first_name} ${instructor.last_name}` // Concatenate first and last name
        }));

        res.json(instructorsWithFullName); // Send the formatted response
    } catch (error) {
        console.error("Error retrieving instructors:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.logoutInstructor = (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract the token from the header

    if (token) {
        blacklist.add(token); // Add the token to the blacklist
        return res.json({ message: 'Instructor logged out successfully' });
    } else {
        return res.status(400).json({ message: 'No token provided' });
    }
};