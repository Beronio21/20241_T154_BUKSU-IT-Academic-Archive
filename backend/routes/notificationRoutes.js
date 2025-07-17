const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');

// Get notifications for a user
router.get('/', async (req, res) => {
    try {
        const { recipientEmail, role, type, teacherId } = req.query;
        if (!recipientEmail) {
            return res.status(400).json({
                status: 'error',
                message: 'recipientEmail query parameter is required'
            });
        }
        // Build base query
        let query = {
            $or: [
                { recipientEmail },
                { studentEmail: recipientEmail },
                { forAdmins: true }
            ]
        };
        // If teacher role, filter for teacher-relevant notifications only
        if (role === 'teacher') {
            query = {
                recipientEmail,
                forAdmins: false,
                type: { $in: ['submission', 'feedback', 'review_update', 'profile_reminder', 'status_update'] }
            };
            // If teacherId is provided, filter by teacherId field (if present in notification)
            if (teacherId) {
                query.teacherId = teacherId;
            }
        }
        // If type is provided, filter by type
        if (type) {
            query.type = type;
        }
        let notifications = await Notification.find(query).sort({ createdAt: -1 });
        // Deduplicate by unique event (thesisId + type + status + teacherId)
        const uniqueMap = new Map();
        notifications.forEach(n => {
            const key = `${n.thesisId || ''}_${n.type || ''}_${n.status || ''}_${n.teacherId || ''}`;
            if (!uniqueMap.has(key)) uniqueMap.set(key, n);
        });
        notifications = Array.from(uniqueMap.values());
        // After building the query and before returning the response, add debug logs
        console.log('[DEBUG] Notification fetch query:', JSON.stringify(query));
        console.log('[DEBUG] Notifications found:', notifications.length, notifications.map(n => ({_id: n._id, recipientEmail: n.recipientEmail, teacherId: n.teacherId, type: n.type, status: n.status, title: n.title})));
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
        const { recipientEmail } = req.body;
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ status: 'error', message: 'Notification not found' });
        }
        if (notification.forAdmins) {
            // Add to readBy array
            if (!notification.readBy.includes(recipientEmail)) {
                notification.readBy.push(recipientEmail);
                await notification.save();
            }
        } else {
            notification.read = true;
            await notification.save();
        }
        res.json({ status: 'success', data: notification });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update notification' });
    }
});

// Delete notification (per admin for admin notifications)
router.delete('/:id', async (req, res) => {
    try {
        const { recipientEmail } = req.body;
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ status: 'error', message: 'Notification not found' });
        }
        if (notification.forAdmins) {
            // Add to deletedBy array
            if (!notification.deletedBy.includes(recipientEmail)) {
                notification.deletedBy.push(recipientEmail);
                await notification.save();
            }
            res.json({ status: 'success', data: notification });
        } else {
            await Notification.findByIdAndDelete(req.params.id);
            res.json({ status: 'success', message: 'Notification deleted' });
        }
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete notification' });
    }
});

// Add this new route to notificationRoutes.js
router.post('/', async (req, res) => {
    try {
        const { recipientEmail, title, message, type, thesisId, status, reviewerComments, thesisTitle, forAdmins } = req.body;
        if (!recipientEmail || !title || !message || !type) {
            return res.status(400).json({
                status: 'error',    
                message: 'Missing required fields'
            });
        }
        // Deduplication logic
        let filter = { recipientEmail, thesisId, status };
        if (forAdmins) {
            filter = { forAdmins: true, thesisId, status, type };
        }
        const existing = await Notification.findOne(filter);
        if (existing) {
            // Return the existing notification, do not create a duplicate
            return res.status(200).json({
                status: 'exists',
                data: existing
            });
        }
        // Compose the notification message
        const notification = new Notification({
            recipientEmail,
            title: thesisTitle ? `${thesisTitle} - ${title}` : title,
            message,
            type,
            thesisId: thesisId || null,
            status: status || undefined,
            reviewerComments: reviewerComments || '',
            thesisTitle: thesisTitle || '',
            read: false,
            forAdmins: !!forAdmins
        });
        await notification.save();
        res.status(201).json({
            status: 'success',
            data: notification
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create notification'
        });
    }
});

// Mark all notifications as read for a user
router.post('/mark-all-read', async (req, res) => {
    try {
        const { recipientEmail } = req.body;
        if (!recipientEmail) {
            return res.status(400).json({ status: 'error', message: 'recipientEmail is required' });
        }
        const now = new Date();
        // Mark all personal notifications as read and set seenAt
        await Notification.updateMany(
            { recipientEmail, read: false },
            { $set: { read: true, seenAt: now } }
        );
        // Mark all admin notifications as read by this user and set seenAt
        await Notification.updateMany(
            { forAdmins: true, readBy: { $ne: recipientEmail } },
            { $addToSet: { readBy: recipientEmail }, $set: { seenAt: now } }
        );
        // Get updated notifications
        let notifications = await Notification.find({
            $or: [
                { recipientEmail },
                { studentEmail: recipientEmail },
                { forAdmins: true }
            ]
        }).sort({ createdAt: -1 });
        notifications = notifications.filter(n => {
            if (n.forAdmins) {
                return !n.deletedBy?.includes(recipientEmail);
            }
            return true;
        });
        // Get new unread count
        const unreadCount = notifications.filter(n => n.forAdmins ? !(n.readBy || []).includes(recipientEmail) : !n.read).length;
        res.json({ status: 'success', notifications, unreadCount });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ status: 'error', message: 'Failed to mark all as read' });
    }
});

// Debug endpoint: GET /debug/teacher-notifications?email=...&teacherId=...
router.get('/debug/teacher-notifications', async (req, res) => {
    const { email, teacherId } = req.query;
    if (!email) return res.status(400).json({ error: 'Missing email' });
    const query = { recipientEmail: email };
    if (teacherId) query.teacherId = teacherId;
    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    res.json({ count: notifications.length, notifications });
});

module.exports = router; 