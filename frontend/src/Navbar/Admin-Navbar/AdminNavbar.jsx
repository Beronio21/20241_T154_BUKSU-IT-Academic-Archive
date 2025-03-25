import React from 'react';
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
  ];

  const renderNavItem = (item) => (
    <li className="nav-item" key={item.section}>
      <button
        className={`nav-link ${activeSection === item.section ? 'active' : ''}`}
        onClick={() => handleSectionChange(item.section)}
      >
        <span className="nav-icon">{item.icon}</span>
        <span className="nav-text">{item.name}</span>
      </button>
    </li>
  );

  return (
    <div className="admin-sidebar">
      <div className="admin-header">
        <h5 className="admin-title">Admin Panel</h5>
      </div>
      <ul className="admin-nav">
        {navItems.map(renderNavItem)}
      </ul>
    </div>
  );
};

export default AdminNavbar;
