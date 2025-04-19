const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');

// Get notifications for a user
router.get('/', async (req, res) => {
    try {
        const { recipientEmail } = req.query;
        
        if (!recipientEmail) {
            return res.status(400).json({
                status: 'error',
                message: 'recipientEmail query parameter is required'
            });
        }

        console.log('Fetching notifications for email:', recipientEmail);
        
        const notifications = await Notification.find({
            $or: [
                { recipientEmail },
                { studentEmail: recipientEmail }
            ]
        }).sort({ createdAt: -1 });

        console.log('Found notifications:', notifications);

        res.json({
            status: 'success',
            data: notifications
        });
    } catch (error) {
        console.error('Error in notification route:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch notifications'
        });
    }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        res.json({
            status: 'success',
            data: notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update notification'
        });
    }
});

// Add this new route to notificationRoutes.js
router.post('/', async (req, res) => {
    try {
        const { recipientEmail, title, message, type, thesisId } = req.body;
        
        if (!recipientEmail || !title || !message || !type) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields'
            });
        }

        const newNotification = new Notification({
            recipientEmail,
            title,
            message,
            type,
            thesisId: thesisId || null
        });

        await newNotification.save();

        res.status(201).json({
            status: 'success',
            data: newNotification
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create notification'
        });
    }
});

module.exports = router; 