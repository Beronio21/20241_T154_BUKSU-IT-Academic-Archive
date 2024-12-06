// routes/eventRoutes.js
const express = require('express');
const { createEvent } = require('../controllers/eventController');

const router = express.Router();

router.post('/events', createEvent);

module.exports = router;