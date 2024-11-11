const Thesis = require('../models/Thesis');


class ThesisController {
    // Submit a new thesis
    static async submitThesis(req, res) {
        const { student_id, thesis_title, file_url, comments } = req.body;
        try {
            const newThesis = new Thesis({
                student_id,
                thesis_title,
                file_url,
                comments
            });
            const savedThesis = await newThesis.save();
            res.status(201).json({ message: "Thesis submitted successfully", thesis: savedThesis });
        } catch (error) {
            res.status(500).json({ message: "Error submitting thesis", error: error.message });
        }
    }

    // Get all submissions by a student
    static async getStudentSubmissions(req, res) {
        const { student_id } = req.params;
        try {
            const submissions = await Thesis.find({ student_id })
                .populate('student_id', 'name') // Populate student info
                .populate('instructor_id', 'name'); // Populate instructor info
            res.json(submissions);
        } catch (error) {
            res.status(500).json({ message: "Error retrieving submissions", error: error.message });
        }
    }

    // Update thesis status and provide feedback
    static async updateThesis(req, res) {
        const { thesis_id } = req.params;
        const { status, feedback } = req.body;
        try {
            const updatedThesis = await Thesis.findByIdAndUpdate(thesis_id, { status, feedback }, { new: true })
                .populate('student_id', 'name')
                .populate('instructor_id', 'name');
            res.json({ message: "Thesis updated successfully", thesis: updatedThesis });
        } catch (error) {
            res.status(500).json({ message: "Error updating thesis", error: error.message });
        }
    }

    // Upload a revised version of a thesis
    static async uploadRevision(req, res) {
        const { thesis_id } = req.params;
        const { file_url, comments } = req.body;
        try {
            const thesis = await Thesis.findById(thesis_id);
            if (!thesis) {
                return res.status(404).json({ message: "Thesis not found" });
            }
            thesis.revision_uploads.push({ file_url, comments });
            const updatedThesis = await thesis.save();
            res.json({ message: "Revision uploaded successfully", thesis: updatedThesis });
        } catch (error) {
            res.status(500).json({ message: "Error uploading revision", error: error.message });
        }
    }
}

// Get thesis submissions for a student
exports.getStudentTheses = async (req, res) => {
    try {
        const theses = await Thesis.find({ student_id: req.user.id });
        res.status(200).json(theses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student theses', error });
    }
};

// Get all thesis submissions for an instructor
exports.getAllTheses = async (req, res) => {
    try {
        const theses = await Thesis.find().populate('student_id', 'name');
        res.status(200).json(theses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching theses', error });
    }
};

// Review a thesis (for instructor)
exports.reviewThesis = async (req, res) => {
    try {
        const { feedback, status } = req.body;
        const thesis = await Thesis.findByIdAndUpdate(
            req.params.thesis_id,
            { feedback, status },
            { new: true }
        );

        if (!thesis) return res.status(404).json({ message: 'Thesis not found' });
        res.status(200).json(thesis);
    } catch (error) {
        res.status(500).json({ message: 'Error reviewing thesis', error });
    }
};

module.exports = ThesisController;
