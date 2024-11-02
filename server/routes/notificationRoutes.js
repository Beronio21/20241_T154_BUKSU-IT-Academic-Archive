// server/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification'); // Mongoose model

// GET: Retrieve all notifications or by student ID
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find();
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:student_id', async (req, res) => {
    try {
        const studentNotifications = await Notification.find({ student_id: req.params.student_id });
        res.json(studentNotifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST: Add a new notification
router.post('/', async (req, res) => {
    const notification = new Notification(req.body);
    try {
        const newNotification = await notification.save();
        res.status(201).json(newNotification);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH: Mark a notification as read
router.patch('/:id', async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { notification_id: req.params.id },
            { is_read: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: "Notification not found" });
        res.json(notification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE: Remove a notification by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedNotification = await Notification.findOneAndDelete({ notification_id: req.params.id });
        if (!deletedNotification) return res.status(404).json({ message: "Notification not found" });
        res.json(deletedNotification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
