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
    // Only status is required
    const validStatuses = ['pending', 'approved', 'rejected', 'revision'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
            status: 'error',
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
    }
    next();
};

// Submit thesis
router.post('/submit', validateThesis, asyncHandler(async (req, res) => {
    // Use logged-in teacher info if available
    let adviserEmail = req.body.adviserEmail;
    let teacherId = req.body.teacher_id || req.body.teacherId;
    if (req.user && req.user.role === 'teacher') {
        adviserEmail = req.user.email;
        teacherId = req.user.teacher_id; // Always use teacher_id, not _id
    }
    // If teacherId is still undefined, try to fetch from Teacher model
    if (!teacherId && adviserEmail) {
        const Teacher = require('../models/Teacher');
        const teacherDoc = await Teacher.findOne({ email: adviserEmail });
        if (teacherDoc && teacherDoc.teacher_id) {
            teacherId = teacherDoc.teacher_id;
        }
    }
    const thesis = new Thesis({
        ...req.body,
        adviserEmail: adviserEmail || 'admin@buksu.edu.ph',
        objective: req.body.abstract
    });
    const savedThesis = await thesis.save();

    // Create admin notification for all admins (unchanged)
    const Notification = require('../models/notification');
    const io = req.app.get('io');
    const now = new Date();
    const adminNotif = await Notification.findOneAndUpdate(
        {
            forAdmins: true,
            thesisId: savedThesis._id,
            type: 'submission',
            status: 'pending'
        },
        {
            $set: {
                forAdmins: true,
                title: 'New Capstone Thesis Submitted',
                message: `A new thesis "${savedThesis.title}" has been submitted by ${savedThesis.email} on ${now.toLocaleString()}`,
                type: 'submission',
                thesisId: savedThesis._id,
                status: 'pending',
                thesisTitle: savedThesis.title,
                createdAt: now,
                updatedAt: now
            }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (io && adminNotif) {
        io.to('admins').emit('admin_notification', adminNotif);
        io.to('admins').emit('admin_notification', {
            _id: `toast-${savedThesis._id}`,
            title: '📘 New Capstone Submission Received',
            message: 'A teacher has submitted a new capstone project. Check the dashboard for review.',
            type: 'toast',
            createdAt: now,
            updatedAt: now
        });
    }
    // --- Teacher notification: pending review ---
    // Always set all relevant fields for teacher notifications
    let finalTeacherId = teacherId;
    if (!finalTeacherId && adviserEmail) {
        const Teacher = require('../models/Teacher');
        const teacherDoc = await Teacher.findOne({ email: adviserEmail });
        if (teacherDoc && teacherDoc.teacher_id) {
            finalTeacherId = teacherDoc.teacher_id;
        }
    }
    if (adviserEmail && adviserEmail !== 'admin@buksu.edu.ph') {
        const teacherNotif = await Notification.findOneAndUpdate(
            {
                recipientEmail: adviserEmail,
                teacherId: finalTeacherId,
                thesisId: savedThesis._id,
                status: 'pending',
                type: 'submission'
            },
            {
                $set: {
                    title: 'Capstone Submission Pending Review',
                    message: `Capstone titled "${savedThesis.title}" has been submitted and is pending admin review.`,
                    thesisTitle: savedThesis.title,
                    status: 'pending',
                    reviewerComments: '',
                    teacherId: finalTeacherId,
                    recipientEmail: adviserEmail,
                    read: false,
                    createdAt: now,
                    updatedAt: now
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        if (io && teacherNotif) {
            io.to(adviserEmail).emit('teacher_notification', teacherNotif);
        }
    }
    // --- End teacher notification ---

    // Student notification (unchanged)
    await Notification.findOneAndUpdate(
        {
            recipientEmail: req.body.email,
            thesisId: savedThesis._id,
            status: 'pending',
            type: 'submission'
        },
        {
            $set: {
                title: 'Thesis Submitted Successfully',
                message: `Your thesis "${req.body.title}" has been submitted and is pending review`,
                thesisTitle: savedThesis.title,
                read: false,
                createdAt: now,
                updatedAt: now
            }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

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
        .select('title abstract keywords members email status createdAt docsLink objective reviewComments reviewedBy reviewDate isDeleted category');

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
        const { comment, status, teacherName, teacherEmail, teacherId } = req.body;
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
        // --- Teacher notification for feedback ---
        if (teacherEmail && teacherId) {
            const teacherNotif = await Notification.findOneAndUpdate(
                {
                    recipientEmail: teacherEmail,
                    teacherId: teacherId,
                    thesisId: thesis._id,
                    status: status,
                    type: 'feedback'
                },
                {
                    $set: {
                        title: 'Feedback Submitted',
                        message: `You submitted feedback for thesis "${thesis.title}".`,
                        thesisTitle: thesis.title,
                        status: status,
                        reviewerComments: '',
                        teacherId: teacherId,
                        recipientEmail: teacherEmail,
                        read: false,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            if (req.app.get('io') && teacherNotif) {
                req.app.get('io').to(teacherEmail).emit('teacher_notification', teacherNotif);
            }
        }
        // --- End teacher notification for feedback ---
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

        const thesis = await Thesis.findById(thesisId);
        if (!thesis) {
            console.error(`Thesis ${thesisId} not found.`);
            return res.status(404).json({
                status: 'error',
                message: 'Thesis not found'
            });
        }

        thesis.isDeleted = true;
        thesis.deletedAt = new Date();
        await thesis.save();

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

// Add a public-safe endpoint for fetching approved capstone submissions
router.get('/public/approved', async (req, res) => {
    try {
        const submissions = await Thesis.find({ status: 'approved' }).sort({ createdAt: -1 });
        res.json({
            status: 'success',
            data: submissions
        });
    } catch (error) {
        console.error('Error fetching public approved submissions:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch approved submissions',
            error: error.message
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
    const { status, reviewerComments } = req.body;

    // Validate status input
    const validStatuses = ['pending', 'approved', 'rejected', 'revision'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid status provided. Must be one of: approved, rejected, revision, pending.'
        });
    }

    // Find thesis and ensure it exists
    let thesis;
    try {
        thesis = await Thesis.findById(id);
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: 'Database error while finding thesis.'
        });
    }
    if (!thesis) {
        return res.status(404).json({
            status: 'error',
            message: 'Thesis not found.'
        });
    }

    // Detect resubmission after revision (status changes from 'revision' to 'pending')
    const wasRevision = thesis.status === 'revision';
    const isResubmitted = wasRevision && status === 'pending';

    // Special handling for 'pending' (Under Review) status
    if (status === 'pending') {
        if (thesis.status === 'pending') {
            return res.status(409).json({
                status: 'error',
                message: 'Capstone is already under review. No changes detected.'
            });
        }
    } else {
        if (thesis.status === status) {
            return res.status(400).json({
                status: 'error',
                message: 'No changes detected in the review.'
            });
        }
    }

    // Update thesis with review information
    thesis.status = status;
    try {
        await thesis.save();
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: 'Database error while saving review.'
        });
    }

    // Prepare notification message based on status
    let notificationMessage = `Capstone titled "${thesis.title}" has been ${status.toUpperCase()} by Admin.`;
    let notificationTitle = `Capstone ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    if (reviewerComments && reviewerComments.trim()) {
        notificationMessage += ` Remarks: ${reviewerComments}`;
    }

    try {
        const Notification = require('../models/notification');
        const io = req.app.get('io');
        let teacherEmail = thesis.adviserEmail;
        let teacherId = thesis.teacherId || thesis.adviserId || thesis.adviser_id || (thesis.adviser && thesis.adviser._id) || null;
        // Defensive: Try to resolve missing teacherEmail or teacherId
        if (!teacherEmail || teacherEmail === 'admin@buksu.edu.ph') {
            if (thesis.adviser && thesis.adviser.email) teacherEmail = thesis.adviser.email;
            if (!teacherEmail && thesis.adviserId) {
                const Teacher = require('../models/Teacher');
                const teacherDoc = await Teacher.findOne({ _id: thesis.adviserId });
                if (teacherDoc) teacherEmail = teacherDoc.email;
            }
        }
        if (!teacherId && teacherEmail) {
            const Teacher = require('../models/Teacher');
            const teacherDoc = await Teacher.findOne({ email: teacherEmail });
            if (teacherDoc && teacherDoc.teacher_id) {
                teacherId = teacherDoc.teacher_id;
            }
        }
        // Log all relevant values
        if (!teacherEmail || !teacherId) {
            console.warn('[WARN] Missing teacherEmail or teacherId for status update notification:', { teacherEmail, teacherId, thesisId: thesis._id });
        } else {
            console.log('[DEBUG] teacherEmail:', teacherEmail, 'teacherId:', teacherId);
        }
        // When creating teacher notification for status update:
        const statusMap = {
          approved: {
            title: 'Capstone Approved',
            message: `Your capstone "${thesis.title}" has been APPROVED by Admin.`
          },
          rejected: {
            title: 'Capstone Rejected',
            message: `Your capstone "${thesis.title}" has been REJECTED by Admin.`
          },
          revision: {
            title: 'Capstone Revision Required',
            message: `Your capstone "${thesis.title}" requires REVISION as per Admin.`
          },
          pending: {
            title: 'Capstone Pending',
            message: `Your capstone "${thesis.title}" is PENDING review by Admin.`
          }
        };
        const notifContent = statusMap[status] || statusMap['pending'];
        if (teacherEmail && teacherId) {
            const teacherNotif = await Notification.create({
              recipientEmail: teacherEmail,
              teacherId: teacherId,
              thesisId: thesis._id,
              status: status,
              type: 'status_update',
              title: notifContent.title,
              message: notifContent.message,
              reviewerComments: reviewerComments || '',
              thesisTitle: thesis.title,
              read: false,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            // After creating teacherNotif, add debug log
            console.log('[DEBUG] Created teacher notification:', teacherNotif);
            // Emit real-time notification to teacher
            if (io && teacherNotif) {
                console.log('[DEBUG] Emitting teacher_notification to', teacherEmail);
                io.to(teacherEmail).emit('teacher_notification', teacherNotif);
            }
        } else {
            console.warn('[WARN] Skipping teacher notification emit due to missing teacherEmail or teacherId:', { teacherEmail, teacherId, thesisId: thesis._id });
        }
        // --- Always create a new admin notification for each status change ---
        const adminNotif = await Notification.create({
            forAdmins: true,
            thesisId: thesis._id,
            status: status,
            type: 'status_update',
            title: notificationTitle,
            message: notificationMessage + ` (Teacher: ${teacherEmail})`,
            reviewerComments: reviewerComments || '',
            thesisTitle: thesis.title,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        if (io && adminNotif) {
            io.to('admins').emit('admin_notification', adminNotif);
        }
        // If resubmitted after revision, notify admin (as before)
        if (isResubmitted) {
            const adminEmail = 'admin@buksu.edu.ph';
            const existing = await Notification.findOne({
                recipientEmail: adminEmail,
                thesisId: thesis._id,
                type: 'admin_event',
                status: 'resubmitted'
            });
            if (!existing) {
                await Notification.create({
                    recipientEmail: adminEmail,
                    title: 'Thesis Resubmitted After Revision',
                    message: `The thesis "${thesis.title}" has been resubmitted after revision by ${thesis.email}.`,
                    type: 'admin_event',
                    thesisId: thesis._id,
                    status: 'resubmitted',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }
    } catch (err) {
        // Notifications are not critical, so log but do not fail the review update
        console.error('Notification error:', err);
    }

    res.json({
        status: 'success',
        message: 'Review submitted successfully',
        data: {
            thesis: {
                _id: thesis._id,
                title: thesis.title,
                status: thesis.status,
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
