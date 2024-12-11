import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentTopbar = ({ userInfo, unreadCount, setShowNotifications, showNotifications, notifications, markAsRead }) => {
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
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const notificationStyles = {
        container: {
            position: 'relative',
            marginRight: '1rem',
            zIndex: 1031
        },
        dropdown: {
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: '-10px',
            width: '300px',
            backgroundColor: 'white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1031,
            border: '1px solid #ddd'
        },
        header: {
            padding: '10px',
            borderBottom: '1px solid #eee',
            backgroundColor: '#f8f9fa',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
        },
        list: {
            maxHeight: '350px',
            overflowY: 'auto',
            scrollbarWidth: 'thin'
        },
        item: (read) => ({
            padding: '12px',
            borderBottom: '1px solid #eee',
            backgroundColor: read ? '#fff' : '#f0f7ff',
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
                    <button className="btn p-0 me-4 text-black fs-4" title="Messages">
                        <i className="bi bi-envelope"></i>
                    </button>
                    <div style={notificationStyles.container}>
                        <button 
                            className="btn p-0 me-4 text-black fs-4 position-relative" 
                            title="Notifications"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <i className="bi bi-bell"></i>
                            {unreadCount > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={notificationStyles.badge}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div style={notificationStyles.dropdown}>
                                <div style={notificationStyles.header}>
                                    <h6 className="m-0">Notifications</h6>
                                </div>
                                <div style={notificationStyles.list}>
                                    {notifications.length === 0 ? (
                                        <div style={notificationStyles.emptyMessage}>
                                            No notifications
                                        </div>
                                    ) : (
                                        notifications.map(notification => (
                                            <div 
                                                key={notification._id}
                                                style={notificationStyles.item(!notification.read)}
                                                onClick={() => !notification.read && markAsRead(notification._id)}
                                            >
                                                <div className="fw-bold">{notification.title}</div>
                                                <div>{notification.message}</div>
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
                    <div className="dropdown">
                        <button 
                            className="btn p-0 dropdown-toggle d-flex align-items-center text-black"
                            type="button"
                            id="userDropdown"
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
                            <span>{userInfo?.name || 'User'}</span>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                            <li>
                                <a className="dropdown-item" href="/profile">
                                    <i className="bi bi-person me-2 fs-5"></i>
                                    Profile
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" href="/settings">
                                    <i className="bi bi-gear me-2 fs-5"></i>
                                    Settings
                                </a>
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

export default StudentTopbar;
