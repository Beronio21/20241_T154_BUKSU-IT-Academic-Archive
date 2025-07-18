import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import axios from 'axios';
import LogoutModal from '../../components/LogoutModal';
import NotificationCard from '../../components/NotificationCard';
import './AdminTopbar.css';
import { useToast } from '../../components/NotificationToast';
import { io } from 'socket.io-client';

const AdminTopbar = () => {
    const navigate = useNavigate();
    const [notificationCount, setNotificationCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [fadeAll, setFadeAll] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { showToast } = useToast();
    const userInfo = JSON.parse(localStorage.getItem('user-info'));
    const socketRef = useRef(null);
    const [markAllLoading, setMarkAllLoading] = useState(false);

    // Fetch notifications and unread count on mount
    useEffect(() => {
        async function fetchNotifications() {
            const res = await axios.get('http://localhost:8080/api/notifications', {
                params: { recipientEmail: userInfo.email }
            });
            setNotifications(res.data.data);
            // Count unread (admin: not in readBy)
            const unread = res.data.data.filter(n => (n.forAdmins ? !n.readBy?.includes(userInfo.email) : !n.read)).length;
            setNotificationCount(unread);
        }
        fetchNotifications();
        // Socket.IO for real-time
        socketRef.current = io('http://localhost:8080');
        socketRef.current.on('admin_notification', (notif) => {
            if (notif.type === 'toast') {
                showToast(notif); // Show visually distinct toast for admin
            } else {
                showToast(notif.message || 'A teacher updated their profile!');
                setNotifications(prev => [notif, ...prev]);
                setNotificationCount(prev => prev + 1);
            }
        });
        return () => socketRef.current.disconnect();
    }, []);

    // Mark all as read when dropdown opens
    const handleDropdownToggle = (isOpen) => {
        setDropdownOpen(isOpen);
        if (isOpen && notificationCount > 0) {
            axios.post('http://localhost:8080/api/notifications/mark-all-read', { recipientEmail: userInfo.email })
                .then(res => {
                    setNotificationCount(0);
                    setFadeAll(true);
                    setTimeout(() => setFadeAll(false), 600);
                    // Optionally update notifications state to mark all as read
                    setNotifications(prev => prev.map(n => n.forAdmins ? { ...n, readBy: [...(n.readBy || []), userInfo.email] } : { ...n, read: true }));
                });
        }
    };

    // Only show admin-relevant notifications
    const adminRelevantTypes = ['submission', 'admin_event', 'status_update'];
    // Exclude notifications that are 'approved' by admin (status_update type, status 'approved', and message contains 'by Admin')
    const filteredNotifications = notifications.filter(
      notif => adminRelevantTypes.includes(notif.type)
        && (!notif.forAdmins || !(notif.deletedBy || []).includes(userInfo.email))
        && !(notif.type === 'status_update' && notif.status === 'approved' && notif.message && notif.message.toLowerCase().includes('by admin'))
    );

    // Unread count: admin notifications not in readBy, regular notifications not read
    const filteredUnreadCount = filteredNotifications.filter(n => {
      if (n.forAdmins) {
        return !(n.readBy || []).includes(userInfo.email);
      }
      return !n.read;
    }).length;

    const markAsRead = async (id) => {
        if (!userInfo || !userInfo.email) {
            alert('User info missing. Please log in again.');
            return;
        }
        try {
            await axios.put(`http://localhost:8080/api/notifications/${id}/read`, { recipientEmail: userInfo.email }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setNotifications(notifications.map(n => 
                n._id === id
                  ? n.forAdmins
                    ? { ...n, readBy: [...(n.readBy || []), userInfo.email] }
                    : { ...n, read: true }
                  : n
            ));
            setNotificationCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setNotifications(notifications.filter(n => n._id !== id));
            } else {
                alert('Error marking notification as read. Please try again.');
                console.error('Error marking notification as read:', error);
            }
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/notifications/${id}`, {
                data: { recipientEmail: userInfo.email },
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setNotifications(notifications.filter(n => n._id !== id || (n.forAdmins && !(n.deletedBy || []).includes(userInfo.email))));
            setNotificationCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleViewMore = (notification) => {
        // Implement navigation or modal for more details
        console.log('View more for notification:', notification);
        // Example: navigate(`/admin-dashboard/notification/${notification._id}`);
    };

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/', { replace: true });
    };

    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const seconds = Math.floor((now - date) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 7) {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } else if (days > 0) {
            return `${days}d ago`;
        } else if (hours > 0) {
            return `${hours}h ago`;
        } else if (minutes > 0) {
            return `${minutes}m ago`;
        } else {
            return 'Just now';
        }
    };

    const markAllAsRead = async () => {
        if (markAllLoading) return;
        setMarkAllLoading(true);
        try {
            const res = await axios.post('http://localhost:8080/api/notifications/mark-all-read', { recipientEmail: userInfo.email });
            if (res.data && res.data.status === 'success') {
                setNotifications(res.data.notifications);
                setNotificationCount(res.data.unreadCount);
                showToast('All notifications marked as read ✅');
            }
        } catch (error) {
            alert('Error marking all as read. Please try again.');
            console.error('Error marking all as read:', error);
        } finally {
            setMarkAllLoading(false);
        }
    };

    return (
        <nav className="navbar fixed-top navbar-expand-lg">
            <div className="container-fluid">
                <div className="d-flex align-items-center ms-auto">
                    <div className="notification-wrapper me-3">
                        <button 
                            className="notification-button"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <FaBell size={20} />
                            {filteredUnreadCount > 0 && (
                                <span className="notification-badge">
                                    {filteredUnreadCount}
                                </span>
                            )}
                        </button>
                        
                        {showNotifications && (
                            <div className="notification-dropdown">
                                <div className="notification-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Notifications</span>
                                    {filteredUnreadCount > 0 && (
                                        <button className="mark-all-read-btn" onClick={markAllAsRead} title="Mark all as read" style={{ background: 'none', border: 'none', color: '#0d6efd', fontWeight: 400, fontSize: '0.85rem', cursor: markAllLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '2px 6px', opacity: markAllLoading ? 0.5 : 0.85 }} disabled={markAllLoading}>
                                            <svg width="14" height="14" fill="currentColor" style={{ marginRight: 2 }} viewBox="0 0 16 16"><path d="M15.854 5.646a.5.5 0 0 0-.708-.708l-7.646 7.647-3.646-3.647a.5.5 0 1 0-.708.708l4 4a.5.5 0 0 0 .708 0l8-8z"/></svg>
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                                <div className="notification-list">
                                    {filteredNotifications.length === 0 ? (
                                        <div className="no-notifications">
                                            <p>No notifications</p>
                                        </div>
                                    ) : (
                                        filteredNotifications.map(notification => (
                                            <NotificationCard
                                                key={notification._id}
                                                notification={notification}
                                                onMarkAsRead={() => markAsRead(notification._id)}
                                                onDelete={() => handleDelete(notification._id)}
                                                onViewMore={() => handleViewMore(notification)}
                                                fadeAll={fadeAll}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="profile-dropdown">
                        <button 
                            className="profile-button dropdown-toggle d-flex align-items-center"
                            type="button"
                            id="userDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <img
                                src={userInfo?.image || '/default-avatar.png'}
                                alt="Profile"
                                className="profile-image me-2"
                                width="32"
                                height="32"
                            />
                            <span className="profile-name">{userInfo?.name || 'Admin'}</span>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end profile-menu" aria-labelledby="userDropdown">
                            <li>
                                <button 
                                    className="dropdown-item" 
                                    onClick={() => navigate('/admin-dashboard/profile')}
                                >
                                    <i className="bi bi-person me-2"></i>
                                    Profile
                                </button>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <button 
                                    className="logout-btn dropdown-item text-danger"
                                    onClick={() => setShowLogoutModal(true)}
                                    aria-label="Logout"
                                >
                                    <i className="bi bi-box-arrow-right me-2"></i>
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Logout Modal */}
            <LogoutModal
                show={showLogoutModal}
                onHide={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
            />
        </nav>
    );
};

export default AdminTopbar;
