const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    allDay: {
        type: Boolean,
        default: false
    },
    userEmail: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);