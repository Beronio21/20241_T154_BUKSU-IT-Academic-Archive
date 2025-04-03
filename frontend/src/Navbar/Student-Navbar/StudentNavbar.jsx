import React from 'react';
import { useNavigate } from 'react-router-dom';
import logobuksu from '../../Images/logobuksu.jpg'; // Import the logo
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome

const StudentNavbar = ({ activeSection, handleSectionChange, userInfo }) => {
    const navigate = useNavigate();

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

    // Navigation items configuration based on user type
    const mainNavItems = [
        { name: 'Dashboard', section: 'statistics', icon: 'fas fa-tachometer-alt' },
        { name: 'Capstone Archives', section: 'dashboard', icon: 'fas fa-book' },
    ];

    // Add additional navigation items based on user type
    const additionalNavItems = userInfo?.role === 'admin' ? [
        { name: 'Manage Users', section: 'manage-users', icon: 'fas fa-users-cog' },
        { name: 'Reports', section: 'reports', icon: 'fas fa-chart-line' },
    ] : userInfo?.role === 'teacher' ? [
        { name: 'Manage Submissions', section: 'manage-submissions', icon: 'fas fa-tasks' },
    ] : [];

    const renderNavItem = (item) => (
        <li className="nav-item" key={item.section}>
            <button
                className="nav-link w-100 text-start rounded"
                onClick={() => handleSectionChange(item.section)}
                style={getNavButtonStyle(activeSection === item.section)}
                onMouseEnter={(e) => handleMouseEnter(e, activeSection === item.section)}
                onMouseLeave={(e) => handleMouseLeave(e, activeSection === item.section)}
            >
                <i className={item.icon} style={{ marginRight: '8px' }}></i>
                {item.name}
            </button>
        </li>
    );

    const renderThesisManagementDropdown = () => (
        <li className="nav-item">
            <div className="dropdown w-100">
                {/* Add dropdown content here if needed */}
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
                <div className="p-4 d-flex align-items-center border-bottom">
                    <img 
                      src={logobuksu} 
                      alt="Logo" 
                      style={{ 
                        width: '35px', // Set smaller width
                        height: '35px', // Set smaller height
                        borderRadius: '50%', // Make it circular
                        marginRight: '10px' // Space between logo and title
                      }} 
                    />
                    <h5 className="text-black fw-bold mb-0">Student Portal</h5>{/* Smaller font size */}
                </div>

                {/* Navigation Items */}
                <div className="px-3">
                    <ul className="nav flex-column gap-1">
                        {mainNavItems.map(renderNavItem)}
                        {renderThesisManagementDropdown()}
                        {additionalNavItems.map(renderNavItem)}
                    </ul>
                </div>
                      
                {/* User Info Section */}
                <div className="p-4 mt-auto text-center border-top" style={{ marginTop: 'auto', paddingTop: '20px' }}>
                    <p className="mb-0" style={{ fontSize: '14px', color: '#333' }}>
                        {userInfo?.name || 'Student'}
                    </p>
                    <p className="mb-0" style={{ fontSize: '14px', color: '#333' }}>
                        {userInfo?.email || 'Email not available'}
                    </p>
                    <p className="mb-0" style={{ fontSize: '15px', color: '#333' }}>
                        {userInfo?.role || 'User Type not available'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StudentNavbar;
