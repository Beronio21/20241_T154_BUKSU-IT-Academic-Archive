import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentNavbar = ({ activeSection, handleSectionChange }) => {
    const navigate = useNavigate();

    // Navigation related functions
    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/', { replace: true });
        }
    };

    // Style related functions
    const getNavButtonStyle = (isActive) => ({
        transition: 'all 0.2s ease',
        padding: '12px 16px',
        border: 'none',
        backgroundColor: isActive ? '#0d6efd' : 'transparent',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    });

    const handleMouseEnter = (e, isActive) => {
        if (!isActive) {
            e.target.style.backgroundColor = '#2c3034';
            e.target.classList.remove('text-white-50');
            e.target.classList.add('text-white');
        }
    };

    const handleMouseLeave = (e, isActive) => {
        if (!isActive) {
            e.target.style.backgroundColor = 'transparent';
            e.target.classList.add('text-white-50');
            e.target.classList.remove('text-white');
        }
    };

    // Navigation items configuration
    const mainNavItems = [
        { name: 'Dashboard', section: 'dashboard' },
        { name: 'My Profile', section: 'profile' },
        { name: 'Send Gmail', section: 'send-gmail' },
    ];

    const thesisManagementItems = [
        { name: 'Submit Thesis', section: 'submit-thesis' },
        { name: 'View Thesis', section: 'view-thesis' },
        { name: 'Edit Thesis', section: 'edit-thesis' },
    ];

    const additionalNavItems = [
        { name: 'Calendar', section: 'calendar' },
        { name: 'Schedule', section: 'schedule' },
    ];

    const renderNavItem = (item) => (
        <li className="nav-item" key={item.section}>
            <button 
                className={`nav-link w-100 text-start rounded ${
                    activeSection === item.section 
                    ? 'active bg-primary text-white' 
                    : 'text-white-50'
                }`}
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
                    className="nav-link w-100 text-start rounded text-white-50 dropdown-toggle"
                    data-bs-toggle="dropdown"
                    style={getNavButtonStyle(false)}
                    onMouseEnter={(e) => handleMouseEnter(e, false)}
                    onMouseLeave={(e) => handleMouseLeave(e, false)}
                >
                    Thesis Management
                </button>
                <ul className="dropdown-menu dropdown-menu-dark">
                    {thesisManagementItems.map(item => (
                        <li key={item.section}>
                            <button 
                                className="dropdown-item text-white-50"
                                onClick={() => handleSectionChange(item.section)}
                                style={{
                                    fontSize: '14px',
                                    padding: '8px 16px',
                                }}
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
        <div className="bg-dark sidebar" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: '250px',
            overflowY: 'auto',
            zIndex: 1000
        }}>
            <div className="d-flex flex-column h-100">
                {/* Header */}
                <div className="p-4 text-center">
                    <h5 className="text-white fw-bold mb-0">Student Portal</h5>
                </div>

                {/* Navigation Items */}
                <div className="px-3">
                    <ul className="nav flex-column gap-1">
                        {mainNavItems.map(renderNavItem)}
                        {renderThesisManagementDropdown()}
                        {additionalNavItems.map(renderNavItem)}
                    </ul>
                </div>

                {/* Logout Button */}
                <div className="mt-auto p-3">
                    <button 
                        className="btn btn-link text-white w-100"
                        onClick={handleLogout}
                        style={{
                            border: 'none',
                            background: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            textDecoration: 'none'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentNavbar;
