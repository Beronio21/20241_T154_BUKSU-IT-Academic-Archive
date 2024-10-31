const ThesisSubmission = require('../models/ThesisSubmission');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const Instructor = require('../models/Instructor'); // Import the Instructor model

// Submissions
exports.getAllSubmissions = async (req, res) => {
    try {
        const instructors = await Instructor.find(); // Retrieve all instructors
        res.json(instructors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSubmissionById = async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id); // Retrieve instructor by ID
        if (!instructor) return res.status(404).json({ message: "Instructor not found" });
        res.json(instructor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new instructor
exports.addInstructor = async (req, res) => {
    const { instructor_id, first_name, last_name, email, password_hash, contact_number, department, position, profile_picture, total_reviews, created_at, updated_at } = req.body;

    const newInstructor = new Instructor({
        instructor_id,
        first_name,
        last_name,
        email,
        password_hash,
        contact_number,
        department,
        position,
        profile_picture,
        total_reviews,
        created_at,
        updated_at
    });

    try {
        const savedInstructor = await newInstructor.save();
        res.status(201).json(savedInstructor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update an instructor's details
exports.updateInstructor = async (req, res) => {
    try {
        const updatedInstructor = await Instructor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedInstructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.json(updatedInstructor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an instructor by ID
exports.deleteInstructor = async (req, res) => {
    try {
        const instructor = await Instructor.findByIdAndDelete(req.params.id);
        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.json({ message: 'Instructor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
