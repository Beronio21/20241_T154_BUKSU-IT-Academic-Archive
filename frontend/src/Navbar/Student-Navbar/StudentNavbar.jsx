import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentNavbar.css';
import logo from '../../Images/buksulogov2.png';

const StudentNavbar = ({ activeSection, handleSectionChange }) => {
    const navigate = useNavigate();

    const mainNavItems = [
        { name: 'Dashboard', section: 'dashboard', path: '/student-dashboard/dashboard' },
        { name: 'My Profile', section: 'profile', path: '/student-dashboard/profile' },
        { name: 'Submit Capstone', section: 'submit-capstone', path: '/student-dashboard/submit-capstone' },
        { name: 'View Capstone', section: 'view-capstone', path: '/student-dashboard/view-capstone' }
    ];

    const handleNavigation = (section, path) => {
        handleSectionChange(section);
        navigate(path);
    };

    return (
        <div className="sidebar">
            <div className="sidebar-content">
                <div className="sidebar-header">
                    <img src={logo} alt="BukSU Logo" className="sidebar-logo" />
                    <h5 className="sidebar-title">Student Portal</h5>
                </div>
                <ul className="nav flex-column">
                    {mainNavItems.map((item) => (
                        <li className="nav-item" key={item.section}>
                            <button
                                className={`nav-link ${activeSection === item.section ? 'active' : ''}`}
                                onClick={() => handleNavigation(item.section, item.path)}
                            >
                                {item.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default StudentNavbar;
