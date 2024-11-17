// controllers/ThesisController.js
const Thesis = require('../models/Thesis');
const Student = require('../models/Student');
const Instructor = require('../models/Instructor');

// Submit a thesis (for students)
exports.submitThesis = async (req, res) => {
    try {
        const { student_id, thesis_title, file_url, instructor_id } = req.body;

        // Check if student exists
        const student = await Student.findById(student_id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if instructor exists
        const instructor = await Instructor.findById(instructor_id);
        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        const newThesis = new Thesis({
            student_id,
            thesis_title,
            file_url,
            instructor_id,
        });

        await newThesis.save();
        res.status(201).json(newThesis);
    } catch (error) {
        console.error('Error submitting thesis:', error);
        res.status(500).json({ message: 'Failed to submit thesis', error });
    }
};

// Get all submissions by a specific student
exports.getStudentSubmissions = async (req, res) => {
    try {
        const { student_id } = req.params;
        const theses = await Thesis.find({ student_id });

        if (!theses.length) {
            return res.status(404).json({ message: 'No submissions found for this student' });
        }

        res.status(200).json(theses);
    } catch (error) {
        console.error('Error fetching student submissions:', error);
        res.status(500).json({ message: 'Failed to fetch submissions', error });
    }
};

// Update thesis status and feedback (for instructors)
exports.updateThesis = async (req, res) => {
    try {
        const { thesis_id } = req.params;
        const { status, feedback } = req.body;

        const thesis = await Thesis.findById(thesis_id);
        if (!thesis) {
            return res.status(404).json({ message: 'Thesis not found' });
        }

        thesis.status = status || thesis.status;
        thesis.feedback = feedback || thesis.feedback;

        await thesis.save();
        res.status(200).json(thesis);
    } catch (error) {
        console.error('Error updating thesis:', error);
        res.status(500).json({ message: 'Failed to update thesis', error });
    }
};

// Upload a revision (for students)
exports.uploadRevision = async (req, res) => {
    try {
        const { thesis_id } = req.params;
        const { file_url, comments } = req.body;

        const thesis = await Thesis.findById(thesis_id);
        if (!thesis) {
            return res.status(404).json({ message: 'Thesis not found' });
        }

        thesis.revision_uploads.push({ file_url, comments });
        await thesis.save();

        res.status(201).json(thesis);
    } catch (error) {
        console.error('Error uploading revision:', error);
        res.status(500).json({ message: 'Failed to upload revision', error });
    }
};

// Get all thesis submissions (for instructors)
exports.getThesisSubmissions = async (req, res) => {
    try {
        const theses = await Thesis.find().populate('student_id instructor_id', 'first_name last_name');
        res.status(200).json(theses);
    } catch (error) {
        console.error('Error fetching thesis submissions:', error);
        res.status(500).json({ message: 'Failed to fetch thesis submissions', error });
    }
};

// Get a specific thesis by ID
exports.getThesisById = async (req, res) => {
    try {
        const { thesis_id } = req.params;
        const thesis = await Thesis.findById(thesis_id).populate('student_id instructor_id', 'first_name last_name');

        if (!thesis) {
            return res.status(404).json({ message: 'Thesis not found' });
        }

        res.status(200).json(thesis);
    } catch (error) {
        console.error('Error fetching thesis:', error);
        res.status(500).json({ message: 'Failed to fetch thesis', error });
    }
};

// Review a thesis (for instructors)
exports.reviewThesis = async (req, res) => {
    try {
        const { thesis_id } = req.params;
        const { feedback, status } = req.body;

        const thesis = await Thesis.findById(thesis_id);
        if (!thesis) {
            return res.status(404).json({ message: 'Thesis not found' });
        }

        thesis.feedback = feedback || thesis.feedback;
        thesis.status = status || thesis.status;
        thesis.instructor_id = req.user._id; // Link the thesis to the instructor who reviewed it

        await thesis.save();
        res.status(200).json(thesis);
    } catch (error) {
        console.error('Error reviewing thesis:', error);
        res.status(500).json({ message: 'Failed to review thesis', error });
    }
};

// Get all theses by a specific student
exports.getStudentTheses = async (req, res) => {
    try {
        const theses = await Thesis.find({ student_id: req.user._id });

        if (!theses.length) {
            return res.status(404).json({ message: 'No theses found for this student' });
        }

        res.status(200).json(theses);
    } catch (error) {
        console.error('Error fetching student theses:', error);
        res.status(500).json({ message: 'Failed to fetch student theses', error });
    }
};

// Get all theses (for instructors or admins)
exports.getAllTheses = async (req, res) => {
    try {
        const theses = await Thesis.find().populate('student_id instructor_id', 'first_name last_name');
        
        if (!theses.length) {
            return res.status(404).json({ message: 'No theses found' });
        }

        res.status(200).json(theses);
    } catch (error) {
        console.error('Error fetching all theses:', error);
        res.status(500).json({ message: 'Failed to fetch all theses', error });
    }
};
