const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog'); // Import the AuditLog model

// GET: Retrieve all audit logs
router.get('/', async (req, res) => {
    try {
        const logs = await AuditLog.find();
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET: Retrieve audit logs by admin ID
router.get('/:admin_id', async (req, res) => {
    try {
        const logs = await AuditLog.find({ admin_id: req.params.admin_id });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST: Create a new audit log
router.post('/', async (req, res) => {
    const { admin_id, action, details } = req.body;

    if (!admin_id || !action || !details) {
        return res.status(400).json({ message: "Required fields are missing" });
    }

    const newLog = new AuditLog({
        admin_id,
        action,
        details,
        timestamp: new Date(),
    });

    try {
        const savedLog = await newLog.save();
        res.status(201).json(savedLog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE: Remove an audit log by ID
router.delete('/:id', async (req, res) => {
    try {
        const log = await AuditLog.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ message: "Audit log not found" });
        }

        await log.remove();
        res.json({ message: "Audit log deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
