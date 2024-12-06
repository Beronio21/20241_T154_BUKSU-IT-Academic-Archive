// controllers/eventController.js
const Event = require('../models/Event');

const createEvent = async (req, res) => {
  console.log('Request body:', req.body);
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createEvent };