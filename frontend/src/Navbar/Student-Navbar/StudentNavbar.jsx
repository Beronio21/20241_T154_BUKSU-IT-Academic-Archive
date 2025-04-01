import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './StudentNavbar.css';
import logo from '../../Images/buksulogov2.png';

const StudentNavbar = ({ activeSection, handleSectionChange }) => {
    const navigate = useNavigate();

    const mainNavItems = [
        { name: 'Dashboard', section: 'dashboard', path: '/student-dashboard/dashboard', icon: 'bi bi-house' },
        { name: 'My Profile', section: 'profile', path: '/student-dashboard/profile', icon: 'bi bi-person' },
    ];

    const handleNavigation = (section, path) => {
        if (typeof handleSectionChange === 'function') {
            handleSectionChange(section);
        }
        navigate(path);
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.clear();
            sessionStorage.clear();
            navigate("/login", { replace: true });
        }
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
                                <i className={item.icon}></i>
                                {item.name}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Logout Button */}
                <div className="logout-container">
                    <button className="btn btn-danger logout-btn" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right"></i> Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentNavbar;
