const express = require('express');
const router = express.Router();
const CalendarEvent = require('../models/calendar');

// Create a new calendar event
router.post('/', async (req, res) => {
    try {
        const { title, start, end, allDay, userEmail } = req.body;

        const event = new CalendarEvent({ title, start, end, allDay, userEmail });
        await event.save();

        res.status(201).json({
            status: 'success',
            message: 'Event created successfully',
            data: event
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create event'
        });
    }
});

// Get all calendar events
router.get('/', async (req, res) => {
    try {
        const events = await CalendarEvent.find().sort({ createdAt: -1 });
        res.json({
            status: 'success',
            data: events
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch events'
        });
    }
});

// Update a calendar event
router.put('/:id', async (req, res) => {
    try {
        const event = await CalendarEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }
        res.json({
            status: 'success',
            data: event
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update event'
        });
    }
});

// Delete a calendar event
router.delete('/:id', async (req, res) => {
    try {
        const event = await CalendarEvent.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }
        res.json({
            status: 'success',
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete event'
        });
    }
});

module.exports = router;