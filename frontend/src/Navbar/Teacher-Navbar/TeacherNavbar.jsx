import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherNavbar.css';
import logo from '../../Images/buksulogov2.png';

const TeacherNavbar = ({ activeSection, handleSectionChange, user }) => {
    const navigate = useNavigate();

    // Define the navigation items for the sidebar
    const navItems = [
        { name: 'Dashboard', section: 'dashboard', path: '/teacher-dashboard/dashboard' },
        { name: 'My Profile', section: 'profile', path: '/teacher-dashboard/profile' },
        { name: 'Submit Capstone', section: 'submit-thesis', path: '/teacher-dashboard/submit-thesis' },
        { name: 'Review Capstone', section: 'review-submissions', path: '/teacher-dashboard/review-submissions' }
    ];

    // Handle navigation and section change
    const handleNavigation = (section, path) => {
        handleSectionChange(section); // Update the active section in the parent component
        navigate(path); // Navigate to the target path
    };

    return (
        <div className="sidebar">
            <div className="sidebar-content">
                {/* Sidebar Header */}
                <div className="sidebar-header">
                    <img src={logo} alt="BukSU Logo" className="sidebar-logo" />
                    <h5 className="sidebar-title">Teacher Portal</h5>
                </div>

                {/* Navigation Menu */}
                <ul className="nav flex-column">
                    {navItems.map((item) => (
                        <li className="nav-item" key={item.section}>
                            <button
                                className={`nav-link ${activeSection === item.section ? 'active' : ''}`}
                                onClick={() => handleNavigation(item.section, item.path)}
                            >
                                {item.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* User Info Section */}
            {user && (
                <div className="sidebar-footer">
                    <div className="user-info">
                        <p className="user-name">{user.name}</p>
                        <p className="user-email">{user.email}</p>
                        <p className="user-role">Teacher</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherNavbar;
