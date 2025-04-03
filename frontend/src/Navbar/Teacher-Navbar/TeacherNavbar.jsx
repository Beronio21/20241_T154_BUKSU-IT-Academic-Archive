import React from 'react';
import { useNavigate } from 'react-router-dom';
import logobuksu from '../../Images/logobuksu.jpg'; // Import the logo
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome

const TeacherNavbar = ({ activeSection, handleSectionChange, userInfo }) => {
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
        { name: 'Dashboard', section: 'dashboard', icon: 'fas fa-tachometer-alt' },
        { name: 'My Profile', section: 'profile', icon: 'fas fa-user' },
        { name: 'Submit Capstone', section: 'submit-thesis', icon: 'fas fa-upload' },
        // { name: 'Review Capstone', section: 'review-submissions' }
    ];

    const additionalNavItems = [];

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
                    <img 
                      src={logobuksu} 
                      alt="Logo" 
                      style={{ 
                        width: '80px', // Set width
                        height: '80px', // Set height
                        borderRadius: '50%', // Make it circular
                        marginBottom: '10px' 
                      }} 
                    />
                    <h5 className="text-black text-start fw-bold mb-0">Teacher Portal</h5>
                </div>

                {/* Navigation Items */}
                <div className="px-3">
                    <ul className="nav flex-column gap-1">
                        {mainNavItems.map(renderNavItem)}
                        {additionalNavItems.map(renderNavItem)}
                    </ul>
                </div>

                {/* User Info Section */}
                <div className="p-4 mt-auto text-center border-top" style={{ marginTop: 'auto', paddingTop: '20px' }}>
                    <p className="mb-0" style={{ fontSize: '15px', color: '#333' }}>
                        {userInfo?.name || 'Teacher'}
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

export default TeacherNavbar;