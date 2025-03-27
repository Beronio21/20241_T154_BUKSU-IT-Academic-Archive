const express = require('express');
const router = express.Router();
const Thesis = require('../models/thesis');
const Notification = require('../models/notification');

// Submit thesis
router.post('/submit', async (req, res) => {
    try {
        const { title, abstract, keywords, members, adviserEmail, docsLink, email, category } = req.body;

        // Validate required fields
        if (!title || !abstract || !keywords || !members || !adviserEmail || !docsLink || !email || !category) {
            return res.status(400).json({
                status: 'error',
                message: 'All fields are required'
            });
        }

        // Validate keywords array
        if (!Array.isArray(keywords) || keywords.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Keywords must be provided as an array with at least one keyword'
            });
        }

        // Create new thesis
        const thesis = new Thesis({
            title,
            abstract,
            keywords,
            members,
            adviserEmail,
            docsLink,
            email,
            category,
            status: 'pending'
        });

        // Save thesis
        const savedThesis = await thesis.save();

        // Create notification for adviser
        const teacherNotification = new Notification({
            recipientEmail: adviserEmail,
            studentEmail: email,
            title: 'New Thesis Submission',
            message: `A new thesis "${title}" has been submitted by ${email}`,
            type: 'submission',
            thesisId: savedThesis._id
        });

        // Create notification for student
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
            message: 'Thesis submitted successfully',
            data: savedThesis
        });

    } catch (error) {
        console.error('Error in thesis submission:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to submit thesis',
            error: error.message
        });
    }
});

// Get all submissions (for students)
router.get('/submissions', async (req, res) => {
    try {
        console.log('Fetching all submissions');
        const submissions = await Thesis.find()
            .sort({ createdAt: -1 }); // Sort by newest first

        console.log('Found submissions:', submissions.length);
        
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

// Get submissions for specific adviser (for teachers)
router.get('/submissions/adviser', async (req, res) => {
    try {
        const { email } = req.query;
        const submissions = await Thesis.find({ 
            adviserEmail: email 
        }).select('title abstract keywords members email status createdAt docsLink');

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

// Add feedback to thesis
router.post('/feedback/:thesisId', async (req, res) => {
    try {
        const { thesisId } = req.params;
        const { comment, status, teacherName, teacherEmail } = req.body;

        // Find the thesis first
        const thesis = await Thesis.findById(thesisId);
        if (!thesis) {
            return res.status(404).json({
                status: 'error',
                message: 'Thesis not found'
            });
        }

        // Add feedback to the thesis
        thesis.feedback.push({
            comment,
            status,
            teacherName,
            teacherEmail,
            dateSubmitted: new Date()
        });

        // Update thesis status
        thesis.status = status;

        // Save the update without validating the entire document
        await thesis.save({ validateModifiedOnly: true });

        // Create notification for the student
        const notification = new Notification({
            recipientEmail: thesis.email, // Student's email
            title: 'Thesis Feedback Received',
            message: `Your thesis "${thesis.title}" has received feedback from ${teacherName}`,
            type: 'feedback',
            thesisId: thesis._id
        });

        await notification.save();

        res.json({
            status: 'success',
            message: 'Feedback submitted successfully',
            data: thesis
        });

    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to submit feedback',
            error: error.message
        });
    }
});

// Get feedback for a specific thesis
router.get('/feedback/:thesisId', async (req, res) => {
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

// Add this route to handle thesis deletion
router.delete('/delete/:thesisId', async (req, res) => {
    try {
        const { thesisId } = req.params;
        
        // Find the thesis
        const thesis = await Thesis.findById(thesisId);
        
        if (!thesis) {
            return res.status(404).json({
                status: 'error',
                message: 'Thesis not found'
            });
        }

        // Only prevent deletion of approved theses


        // Delete the thesis
        await Thesis.findByIdAndDelete(thesisId);

        // Delete associated notifications
        await Notification.deleteMany({ thesisId });

        res.json({
            status: 'success',
            message: 'Thesis deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting thesis:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete thesis',
            error: error.message
        });
    }
});

// Add this route to get student's submissions
router.get('/student-submissions/:email', async (req, res) => {
    try {
        const submissions = await Thesis.find({ 
            email: req.params.email 
        }).sort({ createdAt: -1 });

        res.json({
            status: 'success',
            data: submissions
        });
    } catch (error) {
        console.error('Error fetching student submissions:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch submissions',
            error: error.message
        });
    }
});

// Update a thesis submission
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        // Find the thesis by ID and update it
        const thesis = await Thesis.findByIdAndUpdate(id, updatedData, { new: true });
        
        if (!thesis) {
            return res.status(404).json({
                status: 'error',
                message: 'Thesis not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Thesis updated successfully',
            data: thesis
        });
    } catch (error) {
        console.error('Error updating thesis:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update thesis',
            error: error.message
        });
    }
});

module.exports = router; 