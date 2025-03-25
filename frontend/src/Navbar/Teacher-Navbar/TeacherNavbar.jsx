import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherNavbar.css';

const TeacherNavbar = ({ activeSection, setActiveSection }) => {
    const navigate = useNavigate();
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    const handleSectionChange = (section) => {
        setActiveSection(section);
        navigate(`/${section}`);
    };

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const mainNavItems = [
        { name: 'Dashboard', section: 'dashboard', icon: 'bi bi-house-door' },
        { name: 'All Thesis', section: 'thesis', icon: 'bi bi-journal-text' },
        { name: 'Students', section: 'students', icon: 'bi bi-people' },
    ];

    const thesisManagementItems = [
        { name: 'Defense Schedule', section: 'defenseschedule', icon: 'bi bi-calendar-event' },
        { name: 'Review Submissions', section: 'review-submissions', icon: 'bi bi-file-earmark-text' },
        { name: 'Comment Docs', section: 'comment-docs', icon: 'bi bi-chat-square-text' },
    ];

    const additionalNavItems = [
        { name: 'Calendar', section: 'calendar', icon: 'bi bi-calendar3' },
        { name: 'Schedule', section: 'schedule', icon: 'bi bi-clock' },
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
                            onClick={() => handleSectionChange(item.section)}
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
                                        onClick={() => handleSectionChange(item.section)}
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
                            onClick={() => handleSectionChange(item.section)}
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
