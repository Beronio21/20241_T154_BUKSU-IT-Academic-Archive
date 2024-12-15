import React from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherTopbar = ({ userInfo, unreadCount, setShowNotifications, showNotifications, notifications, markAsRead }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/', { replace: true });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const notificationStyles = {
        dropdownMenu: {
            width: '300px',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '0'
        },
        notificationItem: {
            padding: '10px 15px',
            borderBottom: '1px solid #eee',
            cursor: 'pointer'
        },
        unreadItem: {
            backgroundColor: '#f8f9fa'
        },
        notificationText: {
            marginBottom: '5px'
        },
        timeText: {
            fontSize: '0.8rem',
            color: '#6c757d'
        }
    };

    return (
        <nav className="navbar fixed-top navbar-expand-lg">
            <div className="container-fluid">
                <div className="d-flex align-items-center ms-auto">
                <img 
                        src="/path/to/logo.png"
                        alt="Logo"
                        style={{ height: '40px', marginRight: '60rem' }}
                    />
                    <button 
                        className="btn p-0 me-6 text-black fs-4" 
                        title="Messages"
                        onClick={() => navigate('/teacher-dashboard/send-gmail')}
                        style={{ background: 'none', border: 'none' }}
                    >
                        <i className="bi bi-envelope"></i>
                    </button>
                    
                    {/* Notifications Dropdown */}
                    <div className="dropdown">
                        <button 
                            className="btn p-0 me-5 text-black fs-5 position-relative" 
                            title="Notifications"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            style={{ background: 'none', border: 'none' }}
                        >
                            <i className="bi bi-bell"></i>
                            {unreadCount > 0 && (
                                <span className="position-absolute top-0 fs-10 start-100 translate-middle badge rounded-pill bg-danger">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                    <span className="visually-hidden">unread notifications</span>
                                </span>
                            )}
                        </button>
                        
                        {/* Notifications Menu */}
                        <div className="dropdown-menu dropdown-menu-end shadow" 
                             style={notificationStyles.dropdownMenu}>
                            <h6 className="dropdown-header">Notifications</h6>
                            {notifications && notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <div 
                                        key={notification._id} 
                                        className="dropdown-item"
                                        onClick={() => markAsRead(notification._id)}
                                        style={{
                                            ...notificationStyles.notificationItem,
                                            ...(notification.read ? {} : notificationStyles.unreadItem)
                                        }}
                                    >
                                        <div className="d-flex flex-column">
                                            <div style={notificationStyles.notificationText}>
                                                {notification.message}
                                            </div>
                                            <small style={notificationStyles.timeText}>
                                                {formatDate(notification.createdAt)}
                                            </small>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="dropdown-item" style={notificationStyles.notificationItem}>
                                    No notifications
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Profile Dropdown */}
                    <div className="dropdown">
                        <button 
                            className="btn p-0 dropdown-toggle d-flex align-items-center text-black"
                            type="button"
                            id="teacherDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            style={{ background: 'none', border: 'none' }}
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
