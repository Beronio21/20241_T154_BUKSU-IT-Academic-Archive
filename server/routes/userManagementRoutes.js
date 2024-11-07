const express = require('express');
const router = express.Router();
const UserManagement = require('../models/UserManagement');

// GET: Retrieve all user management records
router.get('/', async (req, res) => {
    try {
        const records = await UserManagement.find();
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving records', error: error.message });
    }
});

// GET: Retrieve user management records by admin ID
router.get('/admin/:admin_id', async (req, res) => {
    try {
        const records = await UserManagement.find({ admin_id: req.params.admin_id });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving records', error: error.message });
    }
});

// POST: Create a new user management record
router.post('/', async (req, res) => {
    const newRecord = new UserManagement({
        user_management_id: req.body.user_management_id,
        admin_id: req.body.admin_id,
        action: req.body.action,
        user_id: req.body.user_id,
    });

    try {
        const savedRecord = await newRecord.save();
        res.status(201).json(savedRecord);
    } catch (error) {
        res.status(400).json({ message: 'Error saving record', error: error.message });
    }
});

// DELETE: Remove a user management record by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedRecord = await UserManagement.findOneAndDelete({ user_management_id: req.params.id });
        if (!deletedRecord) {
            return res.status(404).json({ message: 'Record not found' });
        }
        res.json(deletedRecord);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting record', error: error.message });
    }
});

module.exports = router;
