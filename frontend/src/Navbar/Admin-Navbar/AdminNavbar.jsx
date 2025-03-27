import React from 'react';
import CapstoneManagement from '../../components/Capstone-Management/CapstoneManagement';

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
    { name: 'Review Capstone', section: 'review-submissions' },
    { name: 'Capstone Management', section: 'capstone-management' },
    { name: 'Admin Register', section: 'admin-register' },
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
    </div>
  );
};

export default AdminNavbar;
