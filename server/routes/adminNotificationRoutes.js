const express = require('express');
const router = express.Router();
const AdminNotification = require('../models/AdminNotification'); // Import the AdminNotification model

// GET: Retrieve all admin notifications
router.get('/', async (req, res) => {
    try {
        const notifications = await AdminNotification.find();
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET: Retrieve notifications by admin ID
router.get('/:admin_id', async (req, res) => {
    try {
        const notifications = await AdminNotification.find({ admin_id: req.params.admin_id });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST: Create a new notification
router.post('/', async (req, res) => {
    const { admin_id, message } = req.body;
    
    if (!admin_id || !message) {
        return res.status(400).json({ message: "Required fields are missing" });
    }

    const newNotification = new AdminNotification({
        admin_id,
        message,
        is_read: false, // Default value for is_read
        created_at: new Date(),
    });

    try {
        const savedNotification = await newNotification.save();
        res.status(201).json(savedNotification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH: Mark a notification as read
router.patch('/:id', async (req, res) => {
    try {
        const notification = await AdminNotification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        notification.is_read = true;
        const updatedNotification = await notification.save();
        res.json(updatedNotification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE: Remove a notification by ID
router.delete('/:id', async (req, res) => {
    try {
        const notification = await AdminNotification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        await notification.remove();
        res.json({ message: "Notification deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
