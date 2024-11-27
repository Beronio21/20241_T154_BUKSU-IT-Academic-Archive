import React, { useEffect, useState } from 'react';

const DefenseSchedule = () => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    readGoogleSheet();
  }, []);

  const readGoogleSheet = () => {
    fetch("https://sheetdb.io/api/v1/59dowe84yclm3")
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched data:', data);
        setSchedules(data);
      })
      .catch((error) => console.error('Error fetching schedule:', error));
  };

  const updateGoogleSheet = (id, updatedData) => {
    fetch(`https://sheetdb.io/api/v1/59dowe84yclm3/student_id/${id}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: updatedData }),
    })
      .then((response) => response.json())
      .then(() => readGoogleSheet())
      .catch((error) => console.error('Error updating schedule:', error));
  };

  const deleteGoogleSheet = (id) => {
    fetch(`https://sheetdb.io/api/v1/59dowe84yclm3/student_id/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then(() => readGoogleSheet())
      .catch((error) => console.error('Error deleting schedule:', error));
  };

  const createGoogleSheet = (newData) => {
    fetch("https://sheetdb.io/api/v1/59dowe84yclm3", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: [newData] }),
    })
      .then((response) => response.json())
      .then(() => readGoogleSheet())
      .catch((error) => console.error('Error creating schedule:', error));
  };

  return (
    <div className="defense-schedule">
      <h1>Defense Schedule</h1>
      <ul>
        {schedules.length === 0 ? (
          <p>No schedules available</p>
        ) : (
          schedules.map((schedule) => (
            <li key={schedule.student_id}>
              {schedule.Title} - {schedule.Date} - {schedule.Name}
              <button onClick={() => updateGoogleSheet(schedule.student_id, { Title: 'Updated Title' })}>Update</button>
              <button onClick={() => deleteGoogleSheet(schedule.student_id)}>Delete</button>
            </li>
          ))
        )}
      </ul>
      <button onClick={() => createGoogleSheet({ student_id: 'new', Title: 'New Defense', Name: 'New Name', Date: '2023-12-01' })}>
        Add New Schedule
      </button>
    </div>
  );
};

export default DefenseSchedule;