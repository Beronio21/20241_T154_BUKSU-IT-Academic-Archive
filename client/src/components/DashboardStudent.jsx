//components/DashboardStudent.jsx
import React from 'react';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Import the auth context for logout handling
import '../styles/DashboardStudent.css'; // Assuming the styles are in this file
import { useNavigate } from 'react-router-dom';
=======
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { useAuth } from '../AuthContext'; // Import the auth context for logout handling
import '../styles/DashboardStudent.css'; // Assuming the styles are in this file
>>>>>>> DEVELOPER2


const DashboardStudent = () => {
  const { logout } = useAuth(); // Get logout function from the AuthContext
  const navigate = useNavigate(); // Hook for navigation

  // Handle Logout
  const handleLogout = () => {
    logout(); // Clear the token and authentication state
<<<<<<< HEAD
    navigate('/'); // Redirect to login page after logout
=======
    navigate('/'); // Redirect to login page
>>>>>>> DEVELOPER2
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
<<<<<<< HEAD
<<<<<<< HEAD
          <li><Link to="/student">Thesis Submission</Link></li>
          <li><Link to="/notifications">Notifications</Link></li>
=======
          <li><Link to="/student/thesis-submission">Thesis Submission</Link></li>
          <li><Link to="/notifications">Notifications</Link></li> {/* Link to Notifications */}
>>>>>>> DEVELOPER
          <li><Link to="/messages">Messages</Link></li>
          <li><Link to="/profile-settings">Profile Settings</Link></li>
          <li><button onClick={handleLogout}>Logout</button></li> {/* Updated logout button */}
=======
          <li><Link to="/student/thesis-submission">Thesis Submission</Link></li>
          <li><Link to="/notifications">Notifications</Link></li> {/* Link to Notifications */}
          <li><Link to="/messages">Messages</Link></li>
          <li><Link to="/profile-settings">Profile Settings</Link></li>
          <li onClick={handleLogout}>Log Out</li>  {/* Logout functionality */}
>>>>>>> DEVELOPER2
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
