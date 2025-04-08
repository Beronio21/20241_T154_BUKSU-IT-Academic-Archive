import React from 'react';
import { useNavigate } from 'react-router-dom';
import logobuksu from '../../Images/logobuksu.jpg'; // Import the logo
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome

const StudentNavbar = ({ activeSection, handleSectionChange, userInfo }) => {
    const navigate = useNavigate();

    // Style related functions
    const getNavButtonStyle = (isActive) => ({
        transition: 'all 0.2s ease',
        padding: '10px 16px', // Slightly reduced padding for better comfort
        border: 'none',
        backgroundColor: isActive ? '#0d6efd' : 'transparent', // Active: Blue, Inactive: Transparent
        color: isActive ? '#fff' : '#333', // Active: White, Inactive: Dark Gray
        cursor: 'pointer',
        fontSize: '14px', // Consistent font size
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
                width: '220px', // Adjusted width for better comfort
                backgroundColor: '#f5f5f5', // Light gray background
                overflowY: 'auto',
                zIndex: 1000,
            }}
        >
            <div className="d-flex flex-column h-100">
                {/* Header */}
                <div className="p-3 d-flex align-items-center border-bottom"> {/* Reduced padding */}
                    <img 
                        src={logobuksu} 
                        alt="Logo" 
                        style={{ 
                            width: '30px', // Slightly smaller logo
                            height: '30px', // Slightly smaller logo
                            borderRadius: '50%', // Make it circular
                            marginRight: '8px' // Reduced margin
                        }} 
                    />
                    <h5 className="text-black fw-bold mb-0" style={{ fontSize: '16px' }}>Student Portal</h5> {/* Adjusted font size */}
                </div>

                {/* Navigation Items */}
                <div className="px-2"> {/* Reduced padding */}
                    <ul className="nav flex-column gap-1">
                        {mainNavItems.map(renderNavItem)}
                        {renderThesisManagementDropdown()}
                        {additionalNavItems.map(renderNavItem)}
                    </ul>
                </div>
                      
                {/* User Info Section */}
                <div className="p-3 mt-auto text-center border-top" style={{ marginTop: 'auto', paddingTop: '15px' }}> {/* Reduced padding */}
                    <p className="mb-0" style={{ fontSize: '14px', color: '#333' }}>
                        {userInfo?.name || 'Student'}
                    </p>
                    <p className="mb-0" style={{ fontSize: '14px', color: '#333' }}>
                        {userInfo?.email || 'Email not available'}
                    </p>
                    <p className="mb-0" style={{ fontSize: '14px', color: '#333' }}>
                        {userInfo?.role || 'User Type not available'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StudentNavbar;
