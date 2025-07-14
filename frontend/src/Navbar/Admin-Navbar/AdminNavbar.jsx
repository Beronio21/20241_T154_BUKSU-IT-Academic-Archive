import React from 'react';
import logobuksu from '../../Images/logobuksu.jpg'; // Import the logo
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome
import CapstoneManagement from '../../components/CapstoneManagement';

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
    { name: 'Dashboard', section: 'dashboard', icon: 'fas fa-tachometer-alt' },
    { name: 'User Management', section: 'user-management-2', icon: 'fas fa-users' },
    { name: 'Teacher Records', section: 'teacher-records-2', icon: 'fas fa-chalkboard-teacher' },
    { name: 'Teacher Approval', section: 'teacher-approval', icon: 'fas fa-user-check' },
    { name: 'Capstone Management', section: 'capstone-management-2', icon: 'fas fa-cogs' },
    { name: 'Archived Capstones', section: 'archived-capstones', icon: 'fas fa-archive' },
    { name: 'Admin Register', section: 'admin-register-2', icon: 'fas fa-user-plus' },
  ];

  const renderNavItem = (item) => (
    <li className="nav-item" key={item.section}>
      <button
        className="nav-link w-100 text-start rounded"
        onClick={() => handleSectionChange(item.section)}
        style={getNavButtonStyle(activeSection === item.section)}
        onMouseEnter={(e) => handleMouseEnter(e, activeSection === item.section)}
        onMouseLeave={(e) => handleMouseLeave(e, activeSection === item.section)}
      >
        <i className={item.icon} style={{ marginRight: '8px' }}></i>
        {item.name}
      </button>
    </li>
  );

  return (
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
        <div className="p-4 d-flex align-items-center border-bottom">
          <img 
            src={logobuksu} 
            alt="Logo" 
            style={{ 
              width: '35px', // Set smaller width
              height: '35px', // Set smaller height
              borderRadius: '50%', // Make it circular
              marginRight: '10px' // Space between logo and title
            }} 
          />
          <h5 className="text-black fw-bold mb-0">Admin Panel</h5> {/* Smaller font size */}
        </div>

        {/* Navigation Items */}
        <div className="px-3">
          <ul className="nav flex-column gap-1">
            {navItems.map(renderNavItem)}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
