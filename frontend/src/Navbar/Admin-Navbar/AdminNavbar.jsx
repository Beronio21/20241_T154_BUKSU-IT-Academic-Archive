import React from 'react';
import './AdminNavbar.css';  // Import the corresponding CSS file

const AdminNavbar = ({ activeSection, handleSectionChange }) => {
  // Navigation items configuration for Admin
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
        className={`nav-link w-100 text-start rounded ${activeSection === item.section ? 'active' : ''}`}
        onClick={() => handleSectionChange(item.section)}
      >
        {item.name}
      </button>
    </li>
  );

  return (
    <div className="sidebar">
      <div className="d-flex flex-column h-100">
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <h5 className="sidebar-title mb-0">Admin Panel</h5>
        </div>

        {/* Navigation Items */}
        <div className="px-3">
          <ul className="nav flex-column gap-1">
            {navItems.map(renderNavItem)}
          </ul>
        </div>

        {/* Footer */}
        <div className="sidebar-footer ">
          {/* You can add user info here if needed */}
          <div className="user-info">
            <div className="user-name">Admin Name</div>
            <div className="user-email">admin@example.com</div>
            <div className="user-role">Administrator</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
