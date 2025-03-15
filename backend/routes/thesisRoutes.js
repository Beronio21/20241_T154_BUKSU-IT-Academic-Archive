const express = require('express');
const router = express.Router();
const Thesis = require('../models/thesis');
const Notification = require('../models/notification');
const { authenticateToken } = require('../middleware/authMiddleware');

// Submit thesis
router.post('/submit', authenticateToken, async (req, res) => {
    try {
        const { title, members, adviserEmail, docsLink } = req.body;
        const email = req.user.email;

        // Create new thesis
        const thesis = new Thesis({
            title,
            members,
            adviserEmail,
            docsLink,
            email,
            status: 'pending'
        });

        // Save thesis
        const savedThesis = await thesis.save();

        // Create notifications
        const teacherNotification = new Notification({
            recipientEmail: adviserEmail,
            studentEmail: email,
            title: 'New Thesis Submission',
            message: `A new thesis "${title}" has been submitted by ${email}`,
            type: 'submission',
            thesisId: savedThesis._id
        });

        const studentNotification = new Notification({
            recipientEmail: email,
            studentEmail: email,
            title: 'Thesis Submitted Successfully',
            message: `Your thesis "${title}" has been submitted and is pending review`,
            type: 'submission',
            thesisId: savedThesis._id
        });

        await Promise.all([
            teacherNotification.save(),
            studentNotification.save()
        ]);

        res.status(201).json({
            status: 'success',
            data: savedThesis
        });
    } catch (error) {
        console.error('Error submitting thesis:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to submit thesis'
        });
    }
});

// Get all theses submitted by a student
router.get('/student-submissions', authenticateToken, async (req, res) => {
    try {
        const email = req.user.email;
        const submissions = await Thesis.find({ email })
            .sort({ submissionDate: -1 });

        res.json({
            status: 'success',
            data: submissions
        });
    } catch (error) {
        console.error('Error fetching student submissions:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch submitted theses'
        });
    }
});

// Get all submissions (for students)
router.get('/submissions', authenticateToken, async (req, res) => {
    try {
        const submissions = await Thesis.find()
            .sort({ submissionDate: -1 });
        
        res.json({
            status: 'success',
            data: submissions
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch submissions'
        });
    }
});

// Get submissions for specific adviser
router.get('/submissions/adviser', authenticateToken, async (req, res) => {
    try {
        const { email } = req.query;
        const submissions = await Thesis.find({ 
            adviserEmail: email 
        }).select('title members email status submissionDate docsLink');

        res.json({
            status: 'success',
            data: submissions
        });
    } catch (error) {
        console.error('Error fetching adviser submissions:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch submissions'
        });
    }
});

// Add feedback to thesis
router.post('/feedback/:thesisId', authenticateToken, async (req, res) => {
    try {
        const { thesisId } = req.params;
        const { comment, status, teacherName } = req.body;
        const teacherEmail = req.user.email;

        // Find the thesis
        const thesis = await Thesis.findById(thesisId);
        if (!thesis) {
            return res.status(404).json({
                status: 'error',
                message: 'Thesis not found'
            });
        }

        // Add feedback
        thesis.feedback.push({
            comment,
            status,
            teacherName,
            teacherEmail,
            dateSubmitted: new Date()
        });

        // Update thesis status
        thesis.status = status;
        await thesis.save();

        // Create notification for student
        const notification = new Notification({
            recipientEmail: thesis.email,
            title: 'Thesis Feedback Received',
            message: `Your thesis "${thesis.title}" has received feedback from ${teacherName}`,
            type: 'feedback',
            thesisId: thesis._id
        });

        await notification.save();

        res.json({
            status: 'success',
            data: thesis
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to submit feedback'
        });
    }
});

// Get feedback for a specific thesis
router.get('/feedback/:thesisId', authenticateToken, async (req, res) => {
    try {
        const { thesisId } = req.params;
        
        const thesis = await Thesis.findById(thesisId);
        if (!thesis) {
            return res.status(404).json({
                status: 'error',
                message: 'Thesis not found'
            });
        }

        res.json({
            status: 'success',
            data: thesis.feedback
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch feedback'
        });
    }
});

// Delete thesis
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const email = req.user.email;

        // Find and check thesis
        const thesis = await Thesis.findOne({ _id: id, email });
        if (!thesis) {
            return res.status(404).json({
                status: 'error',
                message: 'Thesis not found or unauthorized'
            });
        }

        if (thesis.status === 'approved') {
            return res.status(400).json({
                status: 'error',
                message: 'Cannot delete approved thesis'
            });
        }

        // Delete thesis and notifications
        await Promise.all([
            Thesis.findByIdAndDelete(id),
            Notification.deleteMany({ thesisId: id })
        ]);

        res.json({
            status: 'success',
            message: 'Thesis deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting thesis:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete thesis'
        });
    }
});

module.exports = router;