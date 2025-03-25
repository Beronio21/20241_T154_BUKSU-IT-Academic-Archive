import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import StudentProfile from '../../Profile/Student-Profile/StudentProfile';

const StudentNavbar = ({ activeSection, handleSectionChange }) => {
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', section: 'dashboard', icon: 'bi bi-house-door', path: '/student-dashboard' },
        { name: 'My Profile', section: 'profile', icon: 'bi bi-person', path: '/student-profile' },
        { name: 'Submit Thesis', section: 'submit-thesis', icon: 'bi bi-file-earmark-plus', path: '/submit-thesis' },
        { name: 'View Thesis', section: 'docs', icon: 'bi bi-file-earmark-text', path: '/view-thesis' },
    ];

    const renderNavItem = (item) => (
        <li className="nav-item mb-2" key={item.section}>
            <Link
                to={item.path}
                className={`nav-link w-100 text-start rounded d-flex align-items-center gap-2 ${activeSection === item.section ? 'active' : ''}`}
                onClick={() => handleSectionChange(item.section)}
            >
                <i className={item.icon}></i>
                {item.name}
            </Link>
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