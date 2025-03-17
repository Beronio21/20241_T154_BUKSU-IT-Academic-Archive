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
        width: '100%',
        textAlign: 'left',
        borderRadius: '8px',
    });

    const handleMouseEnter = (e, isActive) => {
        if (!isActive) {
            e.target.style.backgroundColor = '#e9ecef';
            e.target.style.color = '#0d6efd';
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
                className="nav-link w-100 text-start rounded d-flex align-items-center gap-2"
                onClick={() => handleSectionChange(item.section)}
                style={getNavButtonStyle(activeSection === item.section)}
                onMouseEnter={(e) => handleMouseEnter(e, activeSection === item.section)}
                onMouseLeave={(e) => handleMouseLeave(e, activeSection === item.section)}
            >
                <i className={item.icon}></i>
                {item.name}
            </button>
        </li>
    );

    const renderThesisManagementDropdown = () => (
        <li className="nav-item mb-3">
            <div className="dropdown w-100">
                <button
                    className="nav-link w-100 text-start rounded d-flex align-items-center gap-2 dropdown-toggle"
                    data-bs-toggle="dropdown"
                    style={getNavButtonStyle(thesisManagementItems.some(item => activeSection === item.section))}
                    onMouseEnter={(e) => handleMouseEnter(e, false)}
                    onMouseLeave={(e) => handleMouseLeave(e, false)}
                >
                    <i className="bi bi-folder"></i>
                    Thesis Management
                </button>
                <ul className="dropdown-menu w-100 shadow-sm border-0 p-2">
                    {thesisManagementItems.map((item) => (
                        <li key={item.section}>
                            <button
                                className="dropdown-item rounded d-flex align-items-center gap-2"
                                onClick={() => handleSectionChange(item.section)}
                                style={{
                                    fontSize: '14px',
                                    padding: '8px 16px',
                                    backgroundColor: activeSection === item.section ? '#0d6efd' : 'transparent',
                                    color: activeSection === item.section ? '#fff' : '#333',
                                }}
                            >
                                <i className={item.icon}></i>
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