// server/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message'); // Mongoose model

// GET: Retrieve all messages or by receiver ID
router.get('/', async (req, res) => {
    try {
        const messages = await Message.find();
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:receiver_id', async (req, res) => {
    try {
        const userMessages = await Message.find({ receiver_id: req.params.receiver_id });
        res.json(userMessages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST: Send a new message
router.post('/', async (req, res) => {
    const newMessage = new Message(req.body);

    try {
        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH: Mark a message as read
router.patch('/:id', async (req, res) => {
    try {
        const updatedMessage = await Message.findOneAndUpdate(
            { message_id: req.params.id },
            { is_read: true },
            { new: true }
        );
        if (!updatedMessage) return res.status(404).json({ message: "Message not found" });
        res.json(updatedMessage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE: Remove a message by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedMessage = await Message.findOneAndDelete({ message_id: req.params.id });
        if (!deletedMessage) return res.status(404).json({ message: "Message not found" });
        res.json(deletedMessage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
