<<<<<<< HEAD
import React from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherNavbar = ({ activeSection, handleSectionChange }) => {
    const navigate = useNavigate();

    // Style related functions
    const getNavButtonStyle = (isActive) => ({
        transition: 'all 0.2s ease',
        padding: '12px 16px',
        border: 'none',
        backgroundColor: isActive ? '#0d6efd' : 'transparent',
        color: isActive ? '#fff' : '#333',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    });

    const handleMouseEnter = (e, isActive) => {
        if (!isActive) {
            e.target.style.backgroundColor = '#0d6efd';
            e.target.style.color = '#fff';
        }
    };

    const handleMouseLeave = (e, isActive) => {
        if (!isActive) {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#333';
        }
    };

    // Navigation items configuration
    const mainNavItems = [
        { name: 'Dashboard', section: 'dashboard' },
        { name: 'My Profile', section: 'profile' },
    ];

    const thesisManagementItems = [
        { name: 'Defense Schedule', section: 'defenseschedule' },
        { name: 'Review Capstone', section: 'review-submissions' },
        { name: 'Comment Docs', section: 'comment-docs' },
    ];

    const additionalNavItems = [
        { name: 'Calendar', section: 'calendar' },
        { name: 'Schedule', section: 'schedule' },
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

    const renderThesisManagementDropdown = () => (
        <li className="nav-item">
            <div className="dropdown w-100">
                <button
                    className="nav-link w-100 text-start rounded dropdown-toggle"
                    data-bs-toggle="dropdown"
                    style={getNavButtonStyle(false)}
                    onMouseEnter={(e) => handleMouseEnter(e, false)}
                    onMouseLeave={(e) => handleMouseLeave(e, false)}
                >
                    Capstone Management
                </button>
                <ul className="dropdown-menu">
                    {thesisManagementItems.map((item) => (
                        <li key={item.section}>
                            <button
                                className={`dropdown-item ${
                                    activeSection === item.section ? 'bg-primary text-white' : ''
                                }`}
                                onClick={() => handleSectionChange(item.section)}
                                style={{
                                    fontSize: '14px',
                                    padding: '8px 16px',
                                    backgroundColor: activeSection === item.section ? '#0d6efd' : 'transparent',
                                    color: activeSection === item.section ? '#fff' : '#333',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => handleMouseEnter(e, activeSection === item.section)}
                                onMouseLeave={(e) => handleMouseLeave(e, activeSection === item.section)}
                            >
                                {item.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
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
                backgroundColor: '#f5f5f5',
                overflowY: 'auto',
                zIndex: 1000,
            }}
        >
            <div className="d-flex flex-column h-100">
                {/* Header */}
                <div className="p-4 text-center border-bottom">
                    <h5 className="text-black text-start fw-bold mb-0">Teacher Portal</h5>
                </div>

                {/* Navigation Items */}
                <div className="px-3">
                    <ul className="nav flex-column gap-1">
                        {mainNavItems.map(renderNavItem)}
                        {renderThesisManagementDropdown()}
                        {additionalNavItems.map(renderNavItem)}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TeacherNavbar;
=======
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherNavbar.css';

const TeacherNavbar = ({ activeSection, setActiveSection }) => {
    const navigate = useNavigate();
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    const handleSectionChange = (section, path) => {
        setActiveSection(section);
        navigate(path);
    };

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const mainNavItems = [
        { name: 'Dashboard', section: 'dashboard', icon: 'bi bi-house-door', path: '/teacher-dashboard' },
        { name: 'My Profile', section: 'profile', icon: 'bi bi-person', path: '/teacher-profile' },
    ];

    const thesisManagementItems = [
        { name: 'Defense Schedule', section: 'defenseschedule', icon: 'bi bi-calendar-event', path: '/teacher-dashboard/defense-schedule' },
        { name: 'Review Submissions', section: 'review-submissions', icon: 'bi bi-file-earmark-text', path: '/teacher-dashboard/view-submitted-thesis' },
        { name: 'Comment Docs', section: 'comment-docs', icon: 'bi bi-chat-square-text', path: '/teacher-dashboard/comment-docs' },
    ];

    const additionalNavItems = [
        { name: 'Calendar', section: 'calendar', icon: 'bi bi-calendar3', path: '/teacher-dashboard/calendar' },
        { name: 'Schedule', section: 'schedule', icon: 'bi bi-clock', path: '/teacher-dashboard/schedule' },
    ];

    return (
        <nav className="teacher-sidebar">
            <div className="sidebar-header">
                <h5>Teacher Portal</h5>
            </div>

            <ul className="nav-list">
                {mainNavItems.map((item) => (
                    <li key={item.section} className="nav-item">
                        <button
                            className={`nav-link ${activeSection === item.section ? 'active' : ''}`}
                            onClick={() => handleSectionChange(item.section, item.path)}
                        >
                            <i className={item.icon}></i>
                            <span>{item.name}</span>
                        </button>
                    </li>
                ))}

                <li className="nav-item dropdown">
                    <button className="nav-link dropdown-toggle" onClick={toggleDropdown}>
                        <i className="bi bi-folder"></i>
                        <span>Thesis Management</span>
                    </button>
                    {isDropdownOpen && (
                        <ul className="dropdown-menu">
                            {thesisManagementItems.map((item) => (
                                <li key={item.section}>
                                    <button
                                        className={`dropdown-item ${activeSection === item.section ? 'active' : ''}`}
                                        onClick={() => handleSectionChange(item.section, item.path)}
                                    >
                                        <i className={item.icon}></i>
                                        <span>{item.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </li>

                <li><hr className="sidebar-divider" /></li>
                {additionalNavItems.map((item) => (
                    <li key={item.section} className="nav-item">
                        <button
                            className={`nav-link ${activeSection === item.section ? 'active' : ''}`}
                            onClick={() => handleSectionChange(item.section, item.path)}
                        >
                            <i className={item.icon}></i>
                            <span>{item.name}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default TeacherNavbar;
>>>>>>> 0bd4427c7055338431092cdd4fd9689cfd1a57a9
