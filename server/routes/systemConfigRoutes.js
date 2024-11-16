const express = require('express');
const router = express.Router();
const SystemConfig = require('../models/SystemConfig');

// GET: Retrieve all system configuration records
router.get('/', async (req, res) => {
    try {
        const configs = await SystemConfig.find();
        res.json(configs);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving configurations', error: error.message });
    }
});

// GET: Retrieve a specific system configuration by ID
router.get('/:id', async (req, res) => {
    try {
        const config = await SystemConfig.findById(req.params.id);
        if (!config) {
            return res.status(404).json({ message: 'Configuration not found' });
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving configuration', error: error.message });
    }
});

// POST: Create a new system configuration
router.post('/', async (req, res) => {
    const newConfig = new SystemConfig({
        admin_id: req.body.admin_id,
        config_name: req.body.config_name,
        config_value: req.body.config_value,
    });

    try {
        const savedConfig = await newConfig.save();
        res.status(201).json(savedConfig);
    } catch (error) {
        res.status(400).json({ message: 'Error saving configuration', error: error.message });
    }
});

// PATCH: Update a specific system configuration by ID
router.patch('/:id', async (req, res) => {
    try {
        const updatedConfig = await SystemConfig.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedConfig) {
            return res.status(404).json({ message: 'Configuration not found' });
        }
        res.json(updatedConfig);
    } catch (error) {
        res.status(400).json({ message: 'Error updating configuration', error: error.message });
    }
});

// DELETE: Remove a specific system configuration by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedConfig = await SystemConfig.findByIdAndDelete(req.params.id);
        if (!deletedConfig) {
            return res.status(404).json({ message: 'Configuration not found' });
        }
        res.json(deletedConfig);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting configuration', error: error.message });
    }
});

module.exports = router;
