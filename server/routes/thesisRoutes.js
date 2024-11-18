const express = require('express');
const router = express.Router();
const ThesisController = require('../controllers/ThesisController');
const multer = require('multer');
const path = require('path'); // Import the 'path' module

// Configure file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp and file extension
    },
});

const upload = multer({ storage });

// Route for thesis submission
router.post('/', upload.single('file'), ThesisController.submitThesis);

// Route to fetch all theses
router.get('/', ThesisController.getAllTheses);

// Route to fetch a single thesis by ID
router.get('/:id', ThesisController.getThesisById);

// Route to create a new thesis
router.post('/', ThesisController.createThesis);

// Route to update a thesis by ID
router.put('/:id', ThesisController.updateThesis);

// Route to delete a thesis by ID
router.delete('/:id', ThesisController.deleteThesis);

module.exports = router;
