import React from 'react';
import { useNavigate } from 'react-router-dom';
import StudentProfile from '../../Profile/Student-Profile/StudentProfile';

const StudentNavbar = ({ activeSection, handleSectionChange }) => {
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', section: 'dashboard', icon: 'bi bi-house-door' },
        { name: 'My Profile', section: 'profile', icon: 'bi bi-person' },
        { name: 'Submit Thesis', section: 'submit-thesis', icon: 'bi bi-file-earmark-plus' },
        { name: 'View Thesis', section: 'docs', icon: 'bi bi-file-earmark-text' },
        { name: 'Schedule', section: 'schedule', icon: 'bi bi-calendar' },
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

    return (
        <nav
            className="sidebar shadow-sm"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '250px',
                backgroundColor: '#f5f5f5', // Light gray background
                overflowY: 'auto',
                zIndex: 1000,
                padding: '1rem',
                marginTop: '50px', // Adjust to match the top bar height
                borderRadius: '8px',
            }}
        >
            <div className="d-flex flex-column h-100">
                {/* Header */}
                <div className="p-3 border-bottom">
                    <h5 className="text-black fw-bold mb-0">Student Portal</h5>
                </div>

                {/* Navigation Items */}
                <div className="py-3">
                    <ul className="nav flex-column">
                        {navItems.map(renderNavItem)}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default StudentNavbar;