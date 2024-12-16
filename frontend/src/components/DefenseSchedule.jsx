import React, { useEffect, useState } from 'react';
import '../Styles/DefenseSchedule.css';

const DefenseSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    student_id: '',
    Title: '',
    Name: '',
    Date: '',
  });
  const [editingSchedule, setEditingSchedule] = useState(null);

  useEffect(() => {
    readGoogleSheet();
  }, []);

  const readGoogleSheet = () => {
    fetch("https://sheetdb.io/api/v1/bchqlswcgjp3m")
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
      .then(() => {
        readGoogleSheet();
        setEditingSchedule(null);
      })
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

  const createGoogleSheet = () => {
    fetch("https://sheetdb.io/api/v1/59dowe84yclm3", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: [newSchedule] }),
    })
      .then((response) => response.json())
      .then(() => {
        readGoogleSheet();
        setNewSchedule({ student_id: '', Title: '', Name: '', Date: '' });
      })
      .catch((error) => console.error('Error creating schedule:', error));
  };

  const handleEditChange = (field, value) => {
    setEditingSchedule({ ...editingSchedule, [field]: value });
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
              {editingSchedule && editingSchedule.student_id === schedule.student_id ? (
                <div>
                  <input
                    type="text"
                    value={editingSchedule.student_id}
                    onChange={(e) => handleEditChange('student_id', e.target.value)}
                  />
                  <input
                    type="text"
                    value={editingSchedule.Title}
                    onChange={(e) => handleEditChange('Title', e.target.value)}
                  />
                  <input
                    type="text"
                    value={editingSchedule.Name}
                    onChange={(e) => handleEditChange('Name', e.target.value)}
                  />
                  <input
                    type="date"
                    value={editingSchedule.Date}
                    onChange={(e) => handleEditChange('Date', e.target.value)}
                  />
                  <div className="button-container">
                    <button onClick={() => updateGoogleSheet(schedule.student_id, editingSchedule)}>Save</button>
                    <button onClick={() => setEditingSchedule(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  {schedule.Title} - {schedule.Date} - {schedule.Name}
                  <div className="button-container">
                    <button onClick={() => setEditingSchedule(schedule)}>Update</button>
                    <button onClick={() => deleteGoogleSheet(schedule.student_id)}>Delete</button>
                  </div>
                </>
              )}
            </li>
          ))
        )}
      </ul>
      <div>
        <input
          type="text"
          placeholder="Student ID"
          value={newSchedule.student_id}
          onChange={(e) => setNewSchedule({ ...newSchedule, student_id: e.target.value })}
        />
        <input
          type="text"
          placeholder="Title"
          value={newSchedule.Title}
          onChange={(e) => setNewSchedule({ ...newSchedule, Title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Name"
          value={newSchedule.Name}
          onChange={(e) => setNewSchedule({ ...newSchedule, Name: e.target.value })}
        />
        <input
          type="date"
          value={newSchedule.Date}
          onChange={(e) => setNewSchedule({ ...newSchedule, Date: e.target.value })}
        />
        <div className="button-container">
          <button onClick={createGoogleSheet}>
            Add New Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default DefenseSchedule;