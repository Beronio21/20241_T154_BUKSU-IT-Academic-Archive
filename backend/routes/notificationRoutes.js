const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');

// Get notifications for a user
router.get('/:email', async (req, res) => {
    try {
        console.log('Fetching notifications for email:', req.params.email); // Debug log
        
        const notifications = await Notification.find({
            $or: [
                { recipientEmail: req.params.email },
                { studentEmail: req.params.email }
            ]
        }).sort({ createdAt: -1 });

        console.log('Found notifications:', notifications); // Debug log

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

module.exports = router; 