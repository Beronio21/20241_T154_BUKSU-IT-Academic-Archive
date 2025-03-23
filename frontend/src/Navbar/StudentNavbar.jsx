import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentNavbar = ({ activeSection, handleSectionChange }) => {
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', section: 'dashboard' },
        { name: 'My Profile', section: 'profile' },
        { name: 'Submit Thesis', section: 'submit-thesis' },
        { name: 'View Thesis', section: 'docs' },
        { name: 'Schedule', section: 'schedule' },
    ];

    return (
        <nav className="d-flex flex-column p-3 bg-light" style={{ minWidth: '220px',marginTop: '50px', marginRight: '10px', borderRadius: '8px', marginLeft: '10px' }}>
            <h5 className="fw-bold">Student Portal</h5>
            <ul className="nav flex-column">
                {navItems.map((item) => (
                    <li key={item.section} className="nav-item">
                        <button
                            className={`nav-link w-100 text-start rounded ${activeSection === item.section ? 'bg-primary text-white' : ''}`}
                            onClick={() => handleSectionChange(item.section)}
                        >
                            {item.name}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default StudentNavbar;