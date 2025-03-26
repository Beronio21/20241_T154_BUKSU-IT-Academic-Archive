import React from 'react';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
=======
import { useNavigate, Link } from 'react-router-dom';
import './StudentNavbar.css'; // Import CSS file
>>>>>>> 0bd4427c7055338431092cdd4fd9689cfd1a57a9

const StudentNavbar = ({ activeSection, handleSectionChange }) => {
    const navigate = useNavigate();

<<<<<<< HEAD
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
    const mainNavItems = [
        { name: 'Dashboard', section: 'dashboard' },
        { name: 'My Profile', section: 'profile' },
    ];

    const thesisManagementItems = [
        { name: 'Submit Capstone', section: 'submit-thesis' },
        { name: 'View Capstone', section: 'docs' },
    ];

    const additionalNavItems = [
        
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
                                    backgroundColor: activeSection === item.section ? '#0d6efd' : 'transparent', // Active: Blue
                                    color: activeSection === item.section ? '#fff' : '#333', // Active: White
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) =>
                                    handleMouseEnter(e, activeSection === item.section)
                                }
                                onMouseLeave={(e) =>
                                    handleMouseLeave(e, activeSection === item.section)
                                }
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
                backgroundColor: '#f5f5f5', // Light gray background
                overflowY: 'auto',
                zIndex: 1000,
            }}
        >
            <div className="d-flex flex-column h-100">
                {/* Header */}
                <div className="p-4 text-center border-bottom">
                    <h5 className="text-black text-start fw-bold mb-0">Student Portal</h5>
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
=======
    const navItems = [
        { name: 'Dashboard', section: 'dashboard', icon: 'bi bi-house-door', path: '/student-dashboard' },
        { name: 'My Profile', section: 'profile', icon: 'bi bi-person', path: '/student-profile' },
        { name: 'Submit Thesis', section: 'submit-thesis', icon: 'bi bi-file-earmark-plus', path: '/submit-thesis' },
        { name: 'View Thesis', section: 'docs', icon: 'bi bi-file-earmark-text', path: '/view-thesis' },
    ];

    return (
        <nav className="student-sidebar">
            <div className="sidebar-header">
                <h5>Student Portal</h5>
            </div>

            <ul className="nav-list">
                {navItems.map((item) => (
                    <li key={item.section} className="nav-item">
                        <Link
                            to={item.path}
                            className={`nav-link ${activeSection === item.section ? 'active' : ''}`}
                            onClick={() => handleSectionChange(item.section)}
                        >
                            <i className={item.icon}></i>
                            <span>{item.name}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
>>>>>>> 0bd4427c7055338431092cdd4fd9689cfd1a57a9
    );
};

export default StudentNavbar;
