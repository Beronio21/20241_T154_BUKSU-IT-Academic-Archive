import React from 'react';
<<<<<<< HEAD

const AdminNavbar = ({ activeSection, handleSectionChange }) => {
  // Style related functions
  const getNavButtonStyle = (isActive) => ({
    transition: 'all 0.2s ease',
    padding: '12px 16px',
    border: 'none',
    backgroundColor: isActive ? '#0d6efd' : 'transparent', // Active: Blue, Inactive: Transparent
    color: isActive ? '#fff' : '#333', // Active: White, Inactive: Dark Gray
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  });

  const handleMouseEnter = (e, isActive) => {
    if (!isActive) {
      e.target.style.backgroundColor = '#0d6efd'; // Blue on hover
      e.target.style.color = '#fff'; // White text
    }
  };

  const handleMouseLeave = (e, isActive) => {
    if (!isActive) {
      e.target.style.backgroundColor = 'transparent'; // Reset to transparent
      e.target.style.color = '#333'; // Reset to dark gray
    }
  };

  // Navigation items configuration
  const navItems = [
    { name: 'Dashboard', section: 'dashboard' },
    { name: 'User Management', section: 'user-management' },
    { name: 'Student Records', section: 'student-records' },
    { name: 'Teacher Records', section: 'teacher-records' },
    { name: 'Admin Register', section: 'admin-register' },
=======
import { LayoutDashboard, Users, GraduationCap, UserCheck, UserPlus } from 'lucide-react'; // Import Icons
import './AdminNavbar.css'; // Import the CSS file

const AdminNavbar = ({ activeSection, handleSectionChange }) => {
  // Navigation items configuration with icons
  const navItems = [
    { name: 'Dashboard', section: 'dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'User Management', section: 'user-management', icon: <Users size={18} /> },
    { name: 'Student Records', section: 'student-records', icon: <GraduationCap size={18} /> },
    { name: 'Teacher Records', section: 'teacher-records', icon: <UserCheck size={18} /> },
    { name: 'Admin Register', section: 'admin-register', icon: <UserPlus size={18} /> },
>>>>>>> 0bd4427c7055338431092cdd4fd9689cfd1a57a9
  ];

  const renderNavItem = (item) => (
    <li className="nav-item" key={item.section}>
      <button
<<<<<<< HEAD
        className="nav-link w-100 text-start rounded"
        onClick={() => handleSectionChange(item.section)}
        style={getNavButtonStyle(activeSection === item.section)}
        onMouseEnter={(e) => handleMouseEnter(e, activeSection === item.section)}
        onMouseLeave={(e) => handleMouseLeave(e, activeSection === item.section)}
      >
        {item.name}
=======
        className={`nav-link ${activeSection === item.section ? 'active' : ''}`}
        onClick={() => handleSectionChange(item.section)}
      >
        <span className="nav-icon">{item.icon}</span>
        <span className="nav-text">{item.name}</span>
>>>>>>> 0bd4427c7055338431092cdd4fd9689cfd1a57a9
      </button>
    </li>
  );

  return (
<<<<<<< HEAD
    <div
      className="sidebar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '250px',
        backgroundColor: '#f5f5f5', // Light gray background
        overflowY: 'auto',
        zIndex: 1000,
      }}
    >
      <div className="d-flex flex-column h-100">
        {/* Header */}
        <div className="p-4 text-center border-bottom">
          <h5 className="text-black text-start fw-bold mb-0">Admin Panel</h5>
        </div>

        {/* Navigation Items */}
        <div className="px-3">
          <ul className="nav flex-column gap-1">
            {navItems.map(renderNavItem)}
          </ul>
        </div>
      </div>
=======
    <div className="admin-sidebar">
      <div className="admin-header">
        <h5 className="admin-title">Admin Panel</h5>
      </div>
      <ul className="admin-nav">
        {navItems.map(renderNavItem)}
      </ul>
>>>>>>> 0bd4427c7055338431092cdd4fd9689cfd1a57a9
    </div>
  );
};

export default AdminNavbar;
