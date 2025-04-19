import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import axios from 'axios';

const AdminTopbar = ({ userInfo }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/notifications', {
                    params: { recipientEmail: userInfo.email },
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                
                const notifications = response.data.data || [];
                setNotifications(notifications);
                setUnreadCount(notifications.filter(n => !n.read).length);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [userInfo]);

    const markAsRead = async (id) => {
        try {
            await axios.patch(`http://localhost:8080/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setNotifications(notifications.map(n => 
                n._id === id ? {...n, read: true} : n
            ));
            setUnreadCount(prev => prev - 1);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/', { replace: true });
        }
    };

    return (
        <nav className="navbar fixed-top navbar-expand-lg bg-light">
            <div className="container-fluid">
                <div className="d-flex align-items-center ms-auto gap-3">
                    {/* Notification Dropdown */}
                    <div className="dropdown">
                        <button 
                            className="btn position-relative p-2"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <FaBell size={20} />
                            {unreadCount > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        
                        {showNotifications && (
                            <div className="dropdown-menu show" style={{ width: '300px', right: 0, left: 'auto' }}>
                                <div className="dropdown-header">Notifications</div>
                                {notifications.length === 0 ? (
                                    <div className="dropdown-item text-muted">No notifications</div>
                                ) : (
                                    notifications.map(notification => (
                                        <div 
                                            key={notification._id}
                                            className={`dropdown-item ${!notification.read ? 'bg-light' : ''}`}
                                            onClick={() => markAsRead(notification._id)}
                                        >
                                            <div className="fw-bold">{notification.title}</div>
                                            <small>{notification.message}</small>
                                            <div className="text-muted small">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                
                    {/* User Profile Dropdown */}
                    <div className="dropdown">
                        <button 
                            className="p-0 dropdown-toggle d-flex align-items-center text-black"
                            type="button"
                            id="adminDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            style={{ background: 'none', border: 'none' }}
                        >
                            <img
                                src={userInfo?.image || '/path/to/local/image.png'}
                                alt="Profile"
                                className="rounded-circle me-2"
                                width="32"
                                height="32"
                            />
                            <span className="d-none d-md-inline">{userInfo?.name || 'Administrator'}</span>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="adminDropdown">
                            <li>
                                <button 
                                    className="dropdown-item" 
                                    onClick={() => navigate('/admin-dashboard/profile')}
                                >
                                    <i className="bi bi-person me-2 fs-5"></i>
                                    Profile
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

export default AdminTopbar;
