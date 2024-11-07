// server/routes/thesisRoutes.js
const express = require('express');
const router = express.Router();
const Thesis = require('../models/Thesis'); // Mongoose model

// GET: Retrieve all thesis submissions
router.get('/', async (req, res) => {
    try {
        const theses = await Thesis.find();
        res.json(theses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET: Retrieve a thesis submission by ID
router.get('/:id', async (req, res) => {
    try {
        const thesis = await Thesis.findOne({ thesis_id: req.params.id });
        if (!thesis) return res.status(404).json({ message: "Thesis not found" });
        res.json(thesis);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST: Add a new thesis submission
router.post('/', async (req, res) => {
    const thesis = new Thesis(req.body);
    try {
        const newThesis = await thesis.save();
        res.status(201).json(newThesis);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT: Replace thesis submission data
router.put('/:id', async (req, res) => {
    try {
        const updatedThesis = await Thesis.findOneAndReplace(
            { thesis_id: req.params.id },
            req.body,
            { new: true }
        );
        if (!updatedThesis) return res.status(404).json({ message: "Thesis not found" });
        res.json(updatedThesis);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH: Update specific fields of thesis submission data
router.patch('/:id', async (req, res) => {
    try {
        const updatedThesis = await Thesis.findOneAndUpdate(
            { thesis_id: req.params.id },
            { $set: req.body },
            { new: true }
        );
        if (!updatedThesis) return res.status(404).json({ message: "Thesis not found" });
        res.json(updatedThesis);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE: Remove a thesis submission
router.delete('/:id', async (req, res) => {
    try {
        const deletedThesis = await Thesis.findOneAndDelete({ thesis_id: req.params.id });
        if (!deletedThesis) return res.status(404).json({ message: "Thesis not found" });
        res.json(deletedThesis);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
