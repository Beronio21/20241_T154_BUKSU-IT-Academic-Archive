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
        list: {
            maxHeight: '350px',
            overflowY: 'auto',
            scrollbarWidth: 'thin'
        },
        item: (read) => ({
            padding: '12px',
            borderBottom: '1px solid #eee',
            backgroundColor: '#fff',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        }),
        timestamp: {
            fontSize: '0.8rem',
            color: '#666',
            marginTop: '4px'
        },
        emptyMessage: {
            padding: '20px',
            textAlign: 'center',
            color: '#666'
        },
        badge: {
            fontSize: '0.65rem'
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
                        className="p-0 me-3 position-relative" 
                        title="Messages"
                        onClick={() => navigate('/teacher-dashboard/send-gmail')}
                        style={{ background: 'none', border: 'none', color: 'inherit' }}
                    >
                        <i className="bi bi-envelope" style={{ fontSize: '1.6rem', color: 'inherit' }}></i>
                    </button>
                    
                    {/* Notifications Dropdown */}
                    <div style={notificationStyles.container}>
                        <button 
                            className="p-0 me-4 position-relative" 
                            title="Notifications"
                            style={{ background: 'none', border: 'none', color: 'inherit' }}
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <i className="bi bi-bell" style={{ fontSize: '1.5rem', color: 'inherit' }}></i>
                            {unreadCount > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={notificationStyles.badge}>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="dropdown-menu show" style={notificationStyles.dropdown}>
                                <div className="dropdown-header" style={notificationStyles.header}>
                                    <h6 className="m-0">Notifications</h6>
                                </div>
                                <div className="dropdown-list" style={notificationStyles.list}>
                                    {notifications.length === 0 ? (
                                        <div style={notificationStyles.emptyMessage}>
                                            No notifications
                                        </div>
                                    ) : (
                                        notifications.map(notification => (
                                            <div 
                                                key={notification._id}
                                                className="dropdown-item"
                                                style={notificationStyles.item(!notification.read)}
                                                onClick={() => !notification.read && markAsRead(notification._id)}
                                            >
                                                <div className="fw-bold">{notification.message}</div>
                                                <div style={notificationStyles.timestamp}>
                                                    {formatDate(notification.createdAt)}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Profile Dropdown */}
                    <div className="dropdown">
                        <button 
                            className="p-0 dropdown-toggle d-flex align-items-center"
                            type="button"
                            id="teacherDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            style={{ background: 'none', border: 'none', color: 'inherit' }}
                        >
                            <img
                                src={userInfo?.image || 'https://via.placeholder.com/32'}
                                alt="Profile"
                                className="rounded-circle me-2"
                                width="32"
                                height="32"
                            />
                            <span>{userInfo?.name || 'Teacher'}</span>
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
