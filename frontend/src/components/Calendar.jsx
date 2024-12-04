import React, { useState, useEffect } from "react";
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import '../Styles/Calendar.css';
import axios from 'axios';
import { gapi } from 'gapi-script';

function Calendar() {
  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/calendar');
        setEvents(response.data.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    const initClient = () => {
      gapi.load('client:auth2', () => {
        gapi.client.init({
          clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/calendar.events'
        });
      });
    };

    initClient();
    fetchEvents();
  }, []);

  const handleSelect = (selectInfo) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // Clear the selection
  };

  const handleCreateEvent = async () => {
    if (eventTitle && startDate && endDate && startTime && endTime) {
      const newEvent = {
        title: eventTitle,
        start: new Date(`${startDate}T${startTime}`),
        end: new Date(`${endDate}T${endTime}`),
        allDay: false,
        userEmail: "user@example.com"
      };

      try {
        const response = await axios.post('http://localhost:8080/api/calendar', newEvent);
        setEvents([...events, response.data.data]);
        setEventTitle("");
        setStartTime("");
        setEndTime("");
      } catch (error) {
        console.error('Error creating event:', error);
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(`http://localhost:8080/api/calendar/${eventId}`);
      setEvents(events.filter(event => event._id !== eventId)); // Update the events state
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleEditEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to edit this event?")) {
      const updatedEvent = {
        title: eventTitle,
        start: new Date(`${startDate}T${startTime}`),
        end: new Date(`${endDate}T${endTime}`),
        allDay: false,
        userEmail: "user@example.com"
      };

      try {
        const response = await axios.put(`http://localhost:8080/api/calendar/${eventId}`, updatedEvent);
        setEvents(events.map(event => event._id === eventId ? response.data.data : event)); // Update the events state
        setEventTitle("");
        setStartTime("");
        setEndTime("");
      } catch (error) {
        console.error('Error updating event:', error);
      }
    }
  };

  const saveToGoogleCalendar = (event) => {
    const { title, start, end } = event;
    const eventData = {
      summary: title,
      start: {
        dateTime: start.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
    };

    const request = gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: eventData,
    });

    request.execute((event) => {
      if (event.htmlLink) {
        window.open(event.htmlLink);
      } else {
        console.error('Error saving event to Google Calendar:', event);
      }
    });
  };

  return (
    <div>
      <Fullcalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={"dayGridMonth"}
        headerToolbar={{
          start: "today prev,next",
          center: "title",
          end: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        height={"90vh"}
        events={events}
        selectable={true} // Enable date selection
        select={handleSelect} // Handle date selection
      />
      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          placeholder="Event Title"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start Date"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="End Date"
        />
        <input
          type="time"
          value={startTime} 
          onChange={(e) => setStartTime(e.target.value)}
          placeholder="Start Time"
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          placeholder="End Time"
        />
        <button onClick={handleCreateEvent}>Create Event</button>
      </div>
      
      <div style={{ marginTop: "20px" }}>
        <h3>Event List</h3>
        <ul>
          {events.map(event => (
            <li key={event._id}>
              {event.title} - {new Date(event.start).toLocaleString()} to {new Date(event.end).toLocaleString()}
              <div className="calendar-button-container">
                <button className="calendar-button" onClick={() => handleDeleteEvent(event._id)}>Delete</button>
                <button className="calendar-button" onClick={() => {
                  setEventTitle(event.title);
                  setStartDate(new Date(event.start).toISOString().split('T')[0]);
                  setEndDate(new Date(event.end).toISOString().split('T')[0]);
                  setStartTime(new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                  setEndTime(new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                }}>Edit</button>
                <button className="calendar-button" onClick={() => saveToGoogleCalendar({
                  title: event.title,
                  start: new Date(event.start),
                  end: new Date(event.end),
                })}>Save to Google Calendar</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Calendar;