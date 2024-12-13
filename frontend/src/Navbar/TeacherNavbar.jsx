import React from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherNavbar = ({ activeSection, handleSectionChange }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/', { replace: true });
        }
    };

    return (
        <div className="bg-dark position-fixed start-0 top-0" 
             style={{
                 width: '250px', 
                 height: '100vh', 
                 overflowY: 'auto',
                 boxShadow: '2px 0 5px rgba(0,0,0,0.2)'
             }}>
            <div className="d-flex flex-column h-100">
                {/* Header */}
                <div className="p-4 text-center">
                    <h5 className="text-white text-start fw-bold mb-0 ">Teacher Portal</h5>
                </div>

                {/* Navigation Items */}
                <div className="px-3">
                    <ul className="nav flex-column gap-1">
                        {[
                            { name: 'Dashboard', section: 'dashboard' },
                            { name: 'My Profile', section: 'profile' },
                        ].map((item) => (
                            <li className="nav-item" key={item.section}>
                                <button 
                                    className={`nav-link w-100 text-start rounded ${
                                        activeSection === item.section 
                                        ? 'active bg-primary text-white' 
                                        : 'text-white-50'
                                    }`}
                                    onClick={() => handleSectionChange(item.section)}
                                    style={{
                                        transition: 'all 0.2s ease',
                                        padding: '12px 16px',
                                        border: 'none',
                                        backgroundColor: activeSection === item.section ? '#0d6efd' : 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                    }}
                                >
                                    {item.name}
                                </button>
                            </li>
                        ))}

                        {/* Thesis Management Dropdown */}
                        <li className="nav-item">
                            <div className="dropdown w-100">
                                <button 
                                    className="nav-link w-100 text-start rounded text-white-50 dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    style={{
                                        transition: 'all 0.2s ease',
                                        padding: '12px 16px',
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                    }}
                                >
                                    Thesis Management
                                </button>
                                <ul className="dropdown-menu dropdown-menu-dark">
                                    {[
                                        { name: 'Defense Schedule', section: 'defenseschedule' },
                                        { name: 'Review Submissions', section: 'review-submissions' },
                                        { name: 'Comment Docs', section: 'comment-docs' },
                                    ].map((item) => (
                                        <li key={item.section}>
                                            <button 
                                                className="dropdown-item text-white-50"
                                                onClick={() => handleSectionChange(item.section)}
                                                style={{
                                                    fontSize: '14px',
                                                    padding: '8px 16px',
                                                }}
                                            >
                                                {item.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </li>

                        {/* Calendar and Schedule */}
                        {[
                            { name: 'Calendar', section: 'calendar' },
                            { name: 'Schedule', section: 'schedule' },
                        ].map((item) => (
                            <li className="nav-item" key={item.section}>
                                <button 
                                    className={`nav-link w-100 text-start rounded ${
                                        activeSection === item.section 
                                        ? 'active bg-primary text-white' 
                                        : 'text-white-50'
                                    }`}
                                    onClick={() => handleSectionChange(item.section)}
                                    style={{
                                        transition: 'all 0.2s ease',
                                        padding: '12px 16px',
                                        border: 'none',
                                        backgroundColor: activeSection === item.section ? '#0d6efd' : 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                    }}
                                >
                                    {item.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TeacherNavbar; 