//components/DashboardStudent.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { useAuth } from '../AuthContext'; // Import the auth context for logout handling
import '../styles/DashboardStudent.css'; // Assuming the styles are in this file


const DashboardStudent = () => {
  const { logout } = useAuth(); // Get logout function from the AuthContext
  const navigate = useNavigate(); // Hook for navigation

  // Handle Logout
  const handleLogout = () => {
    logout(); // Clear the token and authentication state
    navigate('/'); // Redirect to login page
  };

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
          <li><Link to="/student/thesis-submission">Thesis Submission</Link></li>
          <li><Link to="/notifications">Notifications</Link></li> {/* Link to Notifications */}
          <li><Link to="/messages">Messages</Link></li>
          <li><Link to="/profile-settings">Profile Settings</Link></li>
          <li onClick={handleLogout}>Log Out</li>  {/* Logout functionality */}
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <h2>Welcome to Your Dashboard</h2>
        {/* You can add dynamic content for the student's dashboard here */}
      </div>
    </div>
  );
};

export default DashboardStudent;
