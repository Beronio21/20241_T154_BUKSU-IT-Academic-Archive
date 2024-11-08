import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import '../styles/DashboardStudent.css'; // Assuming the styles are in this file

const DashboardStudent = () => {
  return (
    <div className="dashboard-student">
      {/* Top Navigation Bar */}
      <div className="top-nav">
        <div className="logo">University Logo</div>
        <div className="nav-icons">
          <div className="notifications">🔔</div>
          <div className="settings">⚙️</div>
          <div className="profile">
            <img src="profile-pic.jpg" alt="Profile" />
            <span>Student Name</span>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        <ul>
          <li><Link to="/student-dashboard">Dashboard Home</Link></li>
          <li><Link to="/thesis-submission">Thesis Submission</Link></li> {/* Add this link */}
          <li><Link to="/notifications">Notifications</Link></li> {/* Link to Notifications */}
          <li><Link to="/messages">Messages</Link></li>
          <li><Link to="/profile-settings">Profile Settings</Link></li>
          <li>Log Out</li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <h2>Welcome to Your Dashboard</h2>
        {/* Add specific content for each section here */}
      </div>
    </div>
  );
};

export default DashboardStudent;
