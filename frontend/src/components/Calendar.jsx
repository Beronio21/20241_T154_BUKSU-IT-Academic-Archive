import React, { useState, useEffect } from "react";
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";


function Calendar() {
  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    // Fetch events from the backend
    fetch("http://localhost:8080/api/calendar")
      .then((response) => response.json())
      .then((data) => {
        setEvents(data.data);
      })
      .catch((error) => console.error('Error fetching events:', error));
  }, []);

  const handleSelect = (selectInfo) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // Clear the selection
  };

  const handleCreateEvent = () => {
    if (eventTitle && startDate && endDate && startTime && endTime) {
      const newEvent = {
        title: eventTitle,
        start: new Date(`${startDate}T${startTime}`),
        end: new Date(`${endDate}T${endTime}`),
        allDay: false,
        userEmail: "user@example.com" // Replace with actual user email
      };

      // Send POST request to create event
      fetch("http://localhost:8080/api/calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      })
        .then((response) => response.json())
        .then((data) => {
          setEvents([...events, data.data]); // Update local state with new event
          // Clear input fields
          setEventTitle("");
          setStartTime("");
          setEndTime("");
        })
        .catch((error) => console.error('Error creating event:', error));
    }
  };

  const handleDeleteEvent = (eventId) => {
    // Ask for confirmation before deleting the event
    if (window.confirm("Are you sure you want to delete this event?")) {
        // Send DELETE request to remove event
        fetch(`http://localhost:8080/api/calendar/${eventId}`, {
            method: "DELETE",
        })
            .then((response) => {
                if (response.ok) {
                    setEvents(events.filter(event => event._id !== eventId)); // Update local state
                }
            })
            .catch((error) => console.error('Error deleting event:', error));
    }
  };

  return (
    <div style={{padding: "10px", marginTop: "20px"}}>
      <Fullcalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={"dayGridMonth"}
        headerToolbar={{
          start: "today prev,next",
          center: "title",
          end: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        height={"75vh"}
        events={events.map(event => ({
          id: event._id, // Add id for deletion
          title: event.title,
          start: event.start,
          end: event.end,
          allDay: event.allDay,
        }))}
        selectable={true} // Enable date selection
        select={handleSelect} // Handle date selection
        eventClick={(info) => handleDeleteEvent(info.event.id)} // Handle event click to delete
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
    </div>
  );
}

export default Calendar;