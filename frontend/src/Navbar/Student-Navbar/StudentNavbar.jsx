import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './StudentNavbar.css'; // Import CSS file

const StudentNavbar = ({ activeSection, handleSectionChange }) => {
    const navigate = useNavigate();

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
    );
};

export default StudentNavbar;
