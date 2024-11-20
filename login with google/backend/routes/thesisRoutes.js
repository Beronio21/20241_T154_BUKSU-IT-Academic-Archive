const express = require('express');
const router = express.Router();
const Thesis = require('../models/thesis');

// Submit thesis (without auth middleware)
router.post('/submit', async (req, res) => {
    try {
        console.log('Received thesis submission:', req.body);
        
        const { title, members, adviserEmail, docsLink } = req.body;

        // Validate required fields
        if (!title || !members || !adviserEmail || !docsLink) {
            return res.status(400).json({
                status: 'error',
                message: 'All fields are required'
            });
        }

        // Create new thesis
        const thesis = new Thesis({
            title,
            members,
            adviserEmail,
            docsLink,
            status: 'pending'
        });

        // Save thesis
        await thesis.save();

        res.status(201).json({
            status: 'success',
            message: 'Thesis submitted successfully',
            data: thesis
        });

    } catch (error) {
        console.error('Thesis submission error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to submit thesis'
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
        const adviserEmail = req.query.email;
        
        if (!adviserEmail) {
            return res.status(400).json({
                status: 'error',
                message: 'Adviser email is required'
            });
        }

        const submissions = await Thesis.find({ adviserEmail })
            .sort({ createdAt: -1 });

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

module.exports = router; 