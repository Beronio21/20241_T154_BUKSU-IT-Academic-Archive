const Thesis = require('../models/Thesis'); // Make sure the Thesis model is correctly defined
const path = require('path');
const fs = require('fs');

// Submit a thesis
exports.submitThesis = async (req, res) => {
  try {
    const { studentId, instructorId, comments } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'File upload required' });
    }

    const thesis = new Thesis({
      studentId,
      instructorId,
      comments,
      filePath: req.file.path,
      fileType: req.file.mimetype,
    });

    await thesis.save();
    res.status(201).json({ message: 'Thesis submitted successfully', thesis });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting thesis', error: error.message });
  }
};
// Get all theses
exports.getAllTheses = async (req, res) => {
    try {
        const theses = await Thesis.find(); // Fetch all theses from the database
        res.status(200).json(theses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching theses', error: error.message });
    }
};

// Get a single thesis by ID
exports.getThesisById = async (req, res) => {
    try {
        const { id } = req.params;
        const thesis = await Thesis.findById(id);

        if (!thesis) {
            return res.status(404).json({ message: 'Thesis not found' });
        }

        res.status(200).json(thesis);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching thesis', error: error.message });
    }
};

// Create a new thesis
exports.createThesis = async (req, res) => {
    try {
        const newThesis = new Thesis(req.body); // Ensure the request body has the required fields
        await newThesis.save();
        res.status(201).json({ message: 'Thesis created successfully', thesis: newThesis });
    } catch (error) {
        res.status(500).json({ message: 'Error creating thesis', error: error.message });
    }
};

// Update a thesis by ID
exports.updateThesis = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedThesis = await Thesis.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedThesis) {
            return res.status(404).json({ message: 'Thesis not found' });
        }

        res.status(200).json({ message: 'Thesis updated successfully', thesis: updatedThesis });
    } catch (error) {
        res.status(500).json({ message: 'Error updating thesis', error: error.message });
    }
};

// Delete a thesis by ID
exports.deleteThesis = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedThesis = await Thesis.findByIdAndDelete(id);

        if (!deletedThesis) {
            return res.status(404).json({ message: 'Thesis not found' });
        }

        res.status(200).json({ message: 'Thesis deleted successfully', thesis: deletedThesis });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting thesis', error: error.message });
    }
};
