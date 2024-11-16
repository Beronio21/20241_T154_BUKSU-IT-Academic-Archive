import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ProfileSettings.css';

const ProfileSettings = () => {
  const [profile, setProfile] = useState({
    name: 'Student Name',
    email: 'student@example.com',
    password: '',
    profilePic: 'profile-pic.jpg',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prevProfile) => ({
        ...prevProfile,
        profilePic: URL.createObjectURL(file),
      }));
    }
  };

  const handleSaveProfile = () => {
    // Save the updated profile data (this could be an API call)
    console.log('Profile saved:', profile);
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <ul>
          <li><Link to="/student-dashboard">Dashboard Home</Link></li>
          <li><Link to="/thesis-submission">Thesis Submission</Link></li>
          <li><Link to="/notifications">Notifications</Link></li>
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
              <img src={profile.profilePic} alt="Profile" />
              <span>{profile.name}</span>
            </div>
          </div>
        </div>
        
        {/* Profile Settings Section */}
        <div className="profile-settings-container">
          <h3>Profile Settings</h3>
          <form className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={profile.password}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="profilePic">Profile Picture</label>
              <input
                type="file"
                id="profilePic"
                accept="image/*"
                onChange={handleProfilePicChange}
              />
            </div>

            <button type="button" onClick={handleSaveProfile}>Save Profile</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
