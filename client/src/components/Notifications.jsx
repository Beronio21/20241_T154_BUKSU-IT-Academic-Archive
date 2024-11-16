import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Ensure you import Link
import '../styles/Notification.css';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  // Simulate fetching notifications (can replace with real API call)
  useEffect(() => {
    const fetchedNotifications = [
      { message: 'Your thesis submission has been received.', timestamp: '2024-11-08 10:00 AM' },
      { message: 'Your thesis has been reviewed.', timestamp: '2024-11-08 11:30 AM' },
      { message: 'New comments have been added to your thesis.', timestamp: '2024-11-08 12:15 PM' },
    ];
    setNotifications(fetchedNotifications);
  }, []);

  const handleMarkAsRead = (index) => {
    setNotifications((prevNotifications) => prevNotifications.filter((_, i) => i !== index));
  };

  return (
    <div className="dashboard">
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
              <span>Student Name</span>
            </div>
          </div>
        </div>
        
        {/* Notifications Section */}
        <div className="notifications-container">
          <h3>Notifications</h3>
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <p>No new notifications.</p>
            ) : (
              notifications.map((notification, index) => (
                <div key={index} className="notification-item">
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-timestamp">{notification.timestamp}</span>
                  <button className="mark-read-btn" onClick={() => handleMarkAsRead(index)}>
                    Mark as Read
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
