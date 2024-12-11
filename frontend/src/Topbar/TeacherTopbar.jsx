import React from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherTopbar = ({ userInfo, unreadCount, setShowNotifications, showNotifications }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/', { replace: true });
        }
    };

    return (
        <nav className="navbar fixed-top navbar-expand-lg">
            <div className="container-fluid">
                <div className="d-flex align-items-center ms-auto">
                    <button 
                        className="btn p-0 me-4 text-black fs-4" 
                        title="Messages"
                        onClick={() => navigate('/teacher-dashboard/send-gmail')}
                    >
                        <i className="bi bi-envelope"></i>
                    </button>
                    <button 
                        className="btn p-0 me-4 text-black fs-4" 
                        title="Notifications"
                    >
                        <i className="bi bi-bell"></i>
                    </button>
                    <div className="dropdown">
                        <button 
                            className="btn p-0 dropdown-toggle d-flex align-items-center text-black"
                            type="button"
                            id="teacherDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <img
                                src={userInfo?.image || 'https://via.placeholder.com/32'}
                                alt="Profile"
                                className="rounded-circle me-2"
                                width="32"
                                height="32"
                            />
                            <span className="d-none d-md-inline">{userInfo?.name || 'Teacher'}</span>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="teacherDropdown">
                            <li>
                                <button 
                                    className="dropdown-item" 
                                    onClick={() => navigate('/teacher-dashboard/profile')}
                                >
                                    <i className="bi bi-person me-2 fs-5"></i>
                                    Profile
                                </button>
                            </li>
                            <li>
                                <button 
                                    className="dropdown-item" 
                                    onClick={() => navigate('/teacher-dashboard/settings')}
                                >
                                    <i className="bi bi-gear me-2 fs-5"></i>
                                    Settings
                                </button>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <button className="dropdown-item text-danger" onClick={handleLogout}>
                                    <i className="bi bi-box-arrow-right me-2 fs-5"></i>
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default TeacherTopbar;
