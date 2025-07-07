const express = require('express');
const router = express.Router();
const Thesis = require('../models/thesis');
const Notification = require('../models/notification');

// Middleware for error handling
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation middleware
const validateThesis = (req, res, next) => {
    const { title, abstract, keywords, members, docsLink, email, category } = req.body;

    if (!title?.trim() || !abstract?.trim()) {
        return res.status(400).json({
            status: 'error',
            message: 'Title and abstract are required'
        });
    }

    if (!Array.isArray(keywords) || keywords.length === 0 || keywords.some(k => !k.trim())) {
        return res.status(400).json({
            status: 'error',
            message: 'At least one valid keyword is required'
        });
    }

    if (!Array.isArray(members) || members.length === 0 || members.some(m => !m.trim())) {
        return res.status(400).json({
            status: 'error',
            message: 'At least one valid member is required'
        });
    }

    if (!email?.trim()) {
        return res.status(400).json({
            status: 'error',
            message: 'Student email is required'
        });
    }

    if (!docsLink?.trim()) {
        return res.status(400).json({
            status: 'error',
            message: 'Document link is required'
        });
    }

    const validCategories = ['IoT', 'AI', 'ML', 'Sound', 'Camera'];
    if (!category || !validCategories.includes(category)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid category. Must be one of: ' + validCategories.join(', ')
        });
    }

    next();
};

// Validation middleware for review submission
const validateReview = (req, res, next) => {
    const { status } = req.body;

    // Only validate status (comments and reviewer are now optional)
    if (!status) {
        return res.status(400).json({
            status: 'error',
            message: 'Status is required'
        });
    }

    // Validate status value
    const validStatuses = ['pending', 'approved', 'rejected', 'revision'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            status: 'error',
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
    }

    next();
};

// Submit thesis
router.post('/submit', validateThesis, asyncHandler(async (req, res) => {
    const thesis = new Thesis({
        ...req.body,
        adviserEmail: 'admin@buksu.edu.ph', // Default admin email
        objective: req.body.abstract // Optional: Use abstract as objective if needed
    });
    const savedThesis = await thesis.save();

    // Create notifications in parallel
    await Promise.all([
        new Notification({
            recipientEmail: 'admin@buksu.edu.ph',
            studentEmail: req.body.email,
            title: 'New Thesis Submission',
            message: `A new thesis "${req.body.title}" has been submitted by ${req.body.email}`,
            type: 'submission',
            thesisId: savedThesis._id
        }).save(),
        new Notification({
            recipientEmail: req.body.email,
            studentEmail: req.body.email,
            title: 'Thesis Submitted Successfully',
            message: `Your thesis "${req.body.title}" has been submitted and is pending review`,
            type: 'submission',
            thesisId: savedThesis._id
        }).save()
    ]);

    res.status(201).json({
        status: 'success',
        message: 'Thesis submitted successfully',
        data: savedThesis
    });
}));

// Get all submissions (for admins)
router.get('/submissions', asyncHandler(async (req, res) => {
    console.log('Fetching submissions...');
    const submissions = await Thesis.find()
        .sort({ createdAt: -1 })
        .lean()
        .select('title abstract keywords members email status createdAt docsLink objective reviewComments reviewedBy reviewDate isDeleted');

    console.log(`Found ${submissions.length} submissions.`);
    res.json({
        status: 'success',
        count: submissions.length,
        data: submissions
    });
}));

// Get submissions for specific adviser
router.get('/submissions/adviser', asyncHandler(async (req, res) => {
    const { email } = req.query;
    
    if (!email?.trim()) {
        return res.status(400).json({
            status: 'error',
            message: 'Email parameter is required'
        });
    }

    const submissions = await Thesis.find({ 
        adviserEmail: email.toLowerCase() 
    })
    .lean()
    .select('title abstract keywords members email status createdAt docsLink category reviewComments reviewedBy reviewDate')
    .sort({ createdAt: -1 });

    res.json({
        status: 'success',
        count: submissions.length,
        data: submissions
    });
}));

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
router.put('/delete/:thesisId', async (req, res) => {
    try {
        const { thesisId } = req.params;
        console.log(`Moving thesis ${thesisId} to trash...`);

        const thesis = await Thesis.findByIdAndUpdate(
            thesisId,
            { 
                isDeleted: true, 
                deletedAt: new Date() 
            },
            { new: true }
        );

        if (!thesis) {
            console.error(`Thesis ${thesisId} not found.`);
            return res.status(404).json({
                status: 'error',
                message: 'Thesis not found'
            });
        }

        console.log(`Thesis ${thesisId} moved to trash successfully.`);
        res.json({
            status: 'success',
            message: 'Thesis moved to trash successfully',
            data: thesis
        });
    } catch (error) {
        console.error('Error moving to trash:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to move to trash'
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

// Admin approves a thesis submission
router.put('/approve/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Expecting status to be 'approved' or 'rejected'

        const thesis = await Thesis.findByIdAndUpdate(id, { status }, { new: true });
        
        if (!thesis) {
            return res.status(404).json({
                status: 'error',
                message: 'Thesis not found'
            });
        }

        res.json({
            status: 'success',
            message: `Thesis ${status} successfully`,
            data: thesis
        });
    } catch (error) {
        console.error('Error approving thesis:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to approve thesis',
            error: error.message
        });
    }
});

// Get all approved submissions (for students)
router.get('/approved', async (req, res) => {
    try {
        const submissions = await Thesis.find({ status: 'approved' })
            .sort({ createdAt: -1 }); // Sort by newest first

        res.json({
            status: 'success',
            data: submissions
        });
    } catch (error) {
        console.error('Error fetching approved submissions:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch approved submissions'
        });
    }
});

// Get capstone statistics
router.get('/statistics', async (req, res) => {
    try {
        const totalCapstones = await Thesis.countDocuments();
        const yearlyApprovals = await Thesis.aggregate([
            {
                $match: { status: 'approved' }
            },
            {
                $group: {
                    _id: { $year: '$createdAt' },
                    count: { $sum: 1 }
                }
            }
        ]);
        const categoryCounts = await Thesis.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            status: 'success',
            data: {
                totalCapstones,
                yearlyApprovals: yearlyApprovals.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {}),
                categoryCounts: categoryCounts.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {})
            }
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch statistics'
        });
    }
});

// Update thesis review status
router.put('/submissions/:id/status', validateReview, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, reviewComments, reviewedBy } = req.body;

    // Find thesis and ensure it exists
    const thesis = await Thesis.findById(id);
    if (!thesis) {
        return res.status(404).json({
            status: 'error',
            message: 'Thesis not found'
        });
    }

    // Update thesis with review information
    const now = new Date();
    const reviewUpdate = {
        status,
        reviewComments: reviewComments || '',  // Default to empty string if not provided
        reviewedBy: reviewedBy || '',         // Default to empty string if not provided
        reviewDate: now
    };

    // Add to feedback history (skip if no comment/reviewer)
    if (reviewComments || reviewedBy) {
        thesis.feedback.push({
            comment: reviewComments || '',
            status: status,
            reviewedBy: reviewedBy || '',
            reviewDate: now
        });
    }

    // Update current review status
    thesis.status = status;
    thesis.reviewComments = reviewUpdate.reviewComments;
    thesis.reviewedBy = reviewUpdate.reviewedBy;
    thesis.reviewDate = now;

    // Save changes
    await thesis.save();

    // Prepare notification message based on status
    let notificationMessage = `Your thesis "${thesis.title}" has been reviewed.`;
    let notificationTitle = 'Thesis Review Update';

    switch (status) {
        case 'approved':
            notificationMessage += ' Congratulations! Your thesis has been APPROVED.';
            notificationTitle = 'Thesis Approved';
            break;
        case 'rejected':
            notificationMessage += ' Unfortunately, your thesis has been REJECTED.';
            notificationTitle = 'Thesis Rejected';
            break;
        case 'revision':
            notificationMessage += ' Your thesis needs REVISION.';
            notificationTitle = 'Thesis Needs Revision';
            break;
        default:
            notificationMessage += ` Status: ${status.toUpperCase()}`;
    }

    notificationMessage += `\n\nReviewer Comments: ${reviewComments}`;

    // Create notifications in parallel
    await Promise.all([
        // Notification for student
        new Notification({
            recipientEmail: thesis.email,
            title: notificationTitle,
            message: notificationMessage,
            type: 'status_update',
            thesisId: thesis._id,
            priority: status === 'revision' ? 'high' : 'normal'
        }).save(),
        // Notification for adviser
        new Notification({
            recipientEmail: thesis.adviserEmail,
            title: notificationTitle,
            message: notificationMessage,
            type: 'status_update',
            thesisId: thesis._id,
            priority: status === 'revision' ? 'high' : 'normal'
        }).save()
    ]);

    res.json({
        status: 'success',
        message: 'Review submitted successfully',
        data: {
            thesis: {
                _id: thesis._id,
                title: thesis.title,
                status: thesis.status,
                reviewComments: thesis.reviewComments,
                reviewedBy: thesis.reviewedBy,
                reviewDate: thesis.reviewDate,
                lastFeedback: thesis.feedback[thesis.feedback.length - 1]
            }
        }
    });
}));

// Get thesis review history with pagination
router.get('/submissions/:id/reviews', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const thesis = await Thesis.findById(id);
    if (!thesis) {
        return res.status(404).json({
            status: 'error',
            message: 'Thesis not found'
        });
    }

    // Get total count of feedback items
    const totalFeedback = thesis.feedback.length;
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Get paginated feedback
    const paginatedFeedback = thesis.feedback
        .sort((a, b) => b.reviewDate - a.reviewDate)
        .slice(startIndex, endIndex);

    res.json({
        status: 'success',
        data: {
            currentStatus: thesis.status,
            currentReview: {
                comments: thesis.reviewComments,
                reviewedBy: thesis.reviewedBy,
                reviewDate: thesis.reviewDate,
                status: thesis.status
            },
            feedback: {
                items: paginatedFeedback,
                pagination: {
                    total: totalFeedback,
                    pages: Math.ceil(totalFeedback / limit),
                    currentPage: parseInt(page),
                    hasMore: endIndex < totalFeedback
                }
            }
        }
    });
}));

// Get review statistics
router.get('/review-stats', asyncHandler(async (req, res) => {
    const stats = await Thesis.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                averageReviewTime: {
                    $avg: {
                        $cond: [
                            { $and: [
                                { $ne: ['$reviewDate', null] },
                                { $ne: ['$createdAt', null] }
                            ]},
                            { $subtract: ['$reviewDate', '$createdAt'] },
                            null
                        ]
                    }
                }
            }
        }
    ]);

    const totalTheses = stats.reduce((acc, curr) => acc + curr.count, 0);

    res.json({
        status: 'success',
        data: {
            statusBreakdown: stats.map(stat => ({
                status: stat._id,
                count: stat.count,
                percentage: ((stat.count / totalTheses) * 100).toFixed(2),
                averageReviewTime: stat.averageReviewTime ? 
                    Math.round(stat.averageReviewTime / (1000 * 60 * 60 * 24)) : // Convert to days
                    null
            })),
            total: totalTheses
        }
    });
}));

// Add this route to fetch deleted submissions
router.get('/trash', async (req, res) => {
    try {
        const deletedSubmissions = await Thesis.find({ isDeleted: true })
            .sort({ deletedAt: -1 })
            .lean();

        res.json({
            status: 'success',
            data: deletedSubmissions
        });
    } catch (error) {
        console.error('Error fetching trash:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch trash'
        });
    }
});

// Add this route to recover a submission from trash
router.put('/recover/:thesisId', async (req, res) => {
    try {
        const { thesisId } = req.params;
        console.log(`Recovering thesis ${thesisId} from trash...`);

        const thesis = await Thesis.findByIdAndUpdate(
            thesisId,
            { 
                isDeleted: false, 
                deletedAt: null 
            },
            { new: true }
        );

        if (!thesis) {
            console.error(`Thesis ${thesisId} not found.`);
            return res.status(404).json({
                status: 'error',
                message: 'Thesis not found'
            });
        }

        console.log(`Thesis ${thesisId} recovered successfully.`);
        res.json({
            status: 'success',
            message: 'Thesis recovered successfully',
            data: thesis
        });
    } catch (error) {
        console.error('Error recovering thesis:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to recover thesis'
        });
    }
});

// Add this route to permanently delete a thesis
router.delete('/permanent-delete/:thesisId', async (req, res) => {
    try {
        const { thesisId } = req.params;
        await Thesis.findByIdAndDelete(thesisId);
        
        // Delete associated notifications
        await Notification.deleteMany({ thesisId });

        res.json({
            status: 'success',
            message: 'Thesis permanently deleted'
        });
    } catch (error) {
        console.error('Error in permanent deletion:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete permanently'
        });
    }
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('Error in thesis routes:', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = router; 