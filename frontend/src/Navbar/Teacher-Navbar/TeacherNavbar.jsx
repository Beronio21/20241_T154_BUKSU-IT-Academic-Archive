import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherNavbar.css';
import logo from '../../Images/buksulogov2.png';

const TeacherNavbar = ({ activeSection, handleSectionChange, user }) => {
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', section: 'dashboard', path: '/teacher-dashboard/dashboard', icon: 'bi bi-house' },
        { name: 'My Profile', section: 'profile', path: '/teacher-dashboard/profile', icon: 'bi bi-person' },
        { name: 'Submit Capstone', section: 'submit-thesis', path: '/teacher-dashboard/submit-thesis', icon: 'bi bi-upload' },
        { name: 'Review Capstone', section: 'review-submissions', path: '/teacher-dashboard/review-submissions', icon: 'bi bi-eye' },
        { name: 'Capstone Management', section: 'capstone-management', path: '/teacher-dashboard/capstone-management', icon: 'bi bi-folder' }
    ];

    const handleNavigation = (section, path) => {
        if (handleSectionChange && typeof handleSectionChange === 'function') {
            handleSectionChange(section);
        }
        navigate(path);
    };

    return (
        <div className="sidebar">
            <div className="sidebar-content">
                <div className="sidebar-header">
                    <img src={logo} alt="BukSU Logo" className="sidebar-logo" />
                    <h5 className="sidebar-title">Teacher Portal</h5>
                </div>
                <ul className="nav flex-column">
                    {navItems.map((item) => (
                        <li className="nav-item" key={item.section}>
                            <button
                                className={`nav-link ${activeSection === item.section ? 'active' : ''}`}
                                onClick={() => handleNavigation(item.section, item.path)}
                            >
                                <i className={item.icon}></i>
                                {item.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            {user && (
                <div className="sidebar-footer">
                    <div className="user-info">
                        <p className="user-name">{user.name}</p>
                        <p className="user-email">{user.email}</p>
                        <p className="user-role">Teacher</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherNavbar;
