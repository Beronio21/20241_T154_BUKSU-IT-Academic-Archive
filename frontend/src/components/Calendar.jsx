import React, { useState } from "react";
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import '../Styles/Calendar.css';

function Calendar() {
  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSelect = (selectInfo) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // Clear the selection
  };

  const handleCreateEvent = () => {
    if (eventTitle && startDate && endDate && startTime && endTime) {
      setEvents([
        ...events,
        {
          title: eventTitle,
          start: new Date(`${startDate}T${startTime}`),
          end: new Date(`${endDate}T${endTime}`),
          allDay: false,
        },
      ]);
      setEventTitle("");
      setStartTime("");
      setEndTime("");
    }
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
    </div>
  );
}

export default Calendar;