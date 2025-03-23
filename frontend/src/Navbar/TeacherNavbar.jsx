import React from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherNavbar = ({ activeSection, handleSectionChange }) => {
    const navigate = useNavigate();

    // Navigation items configuration
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

    const renderNavItem = (item) => (
        <li className="nav-item mb-2" key={item.section}>
            <button
                className={`nav-link w-100 text-start rounded d-flex align-items-center gap-2 ${activeSection === item.section ? 'active' : ''}`}
                onClick={() => handleSectionChange(item.section)}
                aria-current={activeSection === item.section ? 'page' : undefined}
            >
                <i className={item.icon}></i>
                {item.name}
            </button>
        </li>
    );

    const renderThesisManagementDropdown = () => (
        <li className="nav-item dropdown mb-3">
            <button
                className="nav-link w-100 text-start rounded d-flex align-items-center gap-2 dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                <i className="bi bi-folder"></i>
                Thesis Management
            </button>
            <ul className="dropdown-menu w-100 shadow-sm border-0 p-2">
                {thesisManagementItems.map((item) => (
                    <li key={item.section}>
                        <button
                            className={`dropdown-item rounded d-flex align-items-center gap-2 ${activeSection === item.section ? 'active' : ''}`}
                            onClick={() => handleSectionChange(item.section)}
                        >
                            <i className={item.icon}></i>
                            {item.name}
                        </button>
                    </li>
                ))}
            </ul>
        </li>
    );

    return (
        <div
            className="sidebar shadow-sm"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '250px',
                backgroundColor: '#fff',
                overflowY: 'auto',
                zIndex: 1000,
                padding: '1rem',
            }}
        >
            <div className="d-flex flex-column h-100">
                {/* Header */}
                <div className="p-3 border-bottom">
                    <h5 className="text-black fw-bold mb-0">Teacher Portal</h5>
                </div>

                {/* Navigation Items */}
                <div className="py-3">
                    <ul className="nav flex-column">
                        {mainNavItems.map(renderNavItem)}
                        {renderThesisManagementDropdown()}
                        <li><hr className="my-3" /></li>
                        {additionalNavItems.map(renderNavItem)}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TeacherNavbar;