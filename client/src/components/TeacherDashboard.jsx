import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/TeacherDashboard.css';

const TeacherDashboard = () => {
  const [user, setUser] = useState({ name: 'Teacher Name' });

  // Simulate fetching user data (e.g., profile info)
  useEffect(() => {
    // Fetch teacher data from API or local storage here
    setUser({ name: 'Dr. Jane Doe' });
  }, []);

  return (
    <div className="teacher-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <ul>
          <li><Link to="/teacher-dashboard/home">Dashboard Home</Link></li>
          <li><Link to="/teacher-dashboard/thesis-submissions">Thesis Submissions</Link></li>
          <li><Link to="/teacher-dashboard/notifications">Notifications</Link></li>
          <li><Link to="/teacher-dashboard/messages">Messages</Link></li>
          <li><Link to="/teacher-dashboard/profile-settings">Profile Settings</Link></li>
          <li><Link to="/logout">Log Out</Link></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Navigation Bar */}
        <div className="top-nav">
          <div className="logo">University Logo</div>
          <div className="nav-icons">
            <div className="notifications">🔔</div>
            <div className="settings">⚙️</div>
            <div className="profile">
              <img src="profile-pic.jpg" alt="Profile" />
              <span>{user.name}</span>
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="content">
          <h1>Welcome, {user.name}</h1>
          <p>Select a section from the sidebar to get started.</p>
          {/* Render different sections (e.g., Dashboard Home, Thesis Submissions) based on the route */}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
