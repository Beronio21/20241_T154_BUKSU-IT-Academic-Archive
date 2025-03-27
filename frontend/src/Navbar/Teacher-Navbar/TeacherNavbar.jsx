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

