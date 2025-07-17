import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import axios from 'axios';
import './TeacherTopbar.css';
import NotificationCard from '../../components/NotificationCard';
import { useToast } from '../../components/NotificationToast';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../../api';

const TeacherTopbar = ({ userInfo, handleLogout, fetchSubmissions }) => {
    const navigate = useNavigate();
    const [notificationCount, setNotificationCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [fadeAll, setFadeAll] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { showToast } = useToast();
    const socketRef = useRef(null);
    const [markAllLoading, setMarkAllLoading] = useState(false);

    // Fetch notifications and unread count on mount
    useEffect(() => {
        // Load notifications from localStorage first for instant display
        const stored = localStorage.getItem('teacher-notifications');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setNotifications(parsed);
                setNotificationCount(parsed.filter(n => !n.read).length);
            } catch {}
        }
        async function fetchNotifications() {
            if (!userInfo || !userInfo.teacher_id || !userInfo.email) return;
            const teacherId = userInfo.teacher_id;
            try {
                const res = await axios.get(`${API_BASE_URL}/api/notifications`, {
                    params: { recipientEmail: userInfo.email, role: 'teacher', teacherId }
                });
                // Filter for teacher-relevant notifications only
                const teacherTypes = ['submission', 'feedback', 'review_update', 'profile_reminder', 'status_update'];
                const filtered = res.data.data.filter(n =>
                    n.recipientEmail === userInfo.email &&
                    (
                        !n.teacherId || n.teacherId === teacherId // Accept if teacherId is missing (legacy) or matches
                    ) &&
                    !n.forAdmins &&
                    teacherTypes.includes(n.type)
                );
                // Remove duplicates by unique event (thesisId + type + status + teacherId)
                const uniqueMap = new Map();
                filtered.forEach(n => {
                    const key = `${n.thesisId || ''}_${n.type || ''}_${n.status || ''}_${n.teacherId || ''}`;
                    if (!uniqueMap.has(key)) uniqueMap.set(key, n);
                });
                const unique = Array.from(uniqueMap.values());
                setNotifications(unique);
                setNotificationCount(unique.filter(n => !n.read).length);
                // Save to localStorage
                localStorage.setItem('teacher-notifications', JSON.stringify(unique));
            } catch (error) {
                if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
                    alert('Cannot connect to backend. Please make sure the server is running on port 8080.');
                } else {
                    alert('Error fetching notifications. Please try again.');
                    console.error('Error fetching notifications:', error);
                }
            }
        }
        fetchNotifications();
        // Socket.IO for real-time
        if (!userInfo || !userInfo.email) return;
        socketRef.current = io(API_BASE_URL);
        // --- Join teacher's room for notifications ---
        socketRef.current.emit('join', userInfo.email, 'teacher');
        // -------------------------------------------
        socketRef.current.on('teacher_notification', (notif) => {
            const teacherId = userInfo.teacher_id;
            const teacherTypes = ['submission', 'feedback', 'review_update', 'profile_reminder', 'status_update'];
            if (
                notif.recipientEmail === userInfo.email &&
                (!notif.teacherId || notif.teacherId === teacherId) &&
                !notif.forAdmins &&
                teacherTypes.includes(notif.type)
            ) {
                setNotifications(prev => {
                    const key = `${notif.thesisId || ''}_${notif.type || ''}_${notif.status || ''}_${notif.teacherId || ''}`;
                    let found = false;
                    const updated = prev.map(n => {
                        const nKey = `${n.thesisId || ''}_${n.type || ''}_${n.status || ''}_${n.teacherId || ''}`;
                        if (nKey === key) {
                            found = true;
                            return { ...n, ...notif };
                        }
                        return n;
                    });
                    if (!found) {
                        updated.unshift(notif);
                    }
                    // Recalculate unread count
                    setNotificationCount(updated.filter(n => !n.read).length);
                    // Save to localStorage
                    localStorage.setItem('teacher-notifications', JSON.stringify(updated));
                    return updated;
                });
                showToast(notif);
                if (typeof fetchSubmissions === 'function') fetchSubmissions();
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
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                });
        }
    };

    const markAsRead = async (id) => {
        if (!userInfo || !userInfo.email) {
            alert('User info missing. Please log in again.');
            return;
        }
        try {
            await axios.put(`http://localhost:8080/api/notifications/${id}/read`, { recipientEmail: userInfo.email }, { headers: { Authorization: `Bearer ${userInfo.token}` } });
            setNotifications(notifications.map(n => 
                n._id === id ? {...n, read: true} : n
            ));
            setNotificationCount(prev => Math.max(0, prev - 1));
            // Save to localStorage
            localStorage.setItem('teacher-notifications', JSON.stringify(notifications.map(n => 
                n._id === id ? {...n, read: true} : n
            )));
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setNotifications(notifications.filter(n => n._id !== id));
                localStorage.setItem('teacher-notifications', JSON.stringify(notifications.filter(n => n._id !== id)));
            } else {
                alert('Error marking notification as read. Please try again.');
                console.error('Error marking notification as read:', error);
            }
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/notifications/${id}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setNotifications(notifications.filter(n => n._id !== id));
            setNotificationCount(prev => Math.max(0, prev - 1));
            // Save to localStorage
            localStorage.setItem('teacher-notifications', JSON.stringify(notifications.filter(n => n._id !== id)));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleViewMore = (notification) => {
        // Implement navigation or modal for more details
        console.log('View more for notification:', notification);
        // Example: navigate(`/notification/${notification._id}`);
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
                // Save to localStorage
                localStorage.setItem('teacher-notifications', JSON.stringify(res.data.notifications));
            }
        } catch (error) {
            alert('Error marking all as read. Please try again.');
            console.error('Error marking all as read:', error);
        } finally {
            setMarkAllLoading(false);
        }
    };

    return (
        <nav className="navbar fixed-top navbar-expand-lg" style={{
            backgroundColor: 'transparent',
           
        }}>
            <div className="container-fluid">
                <div className="d-flex align-items-center ms-auto">
                    <div className="notification-wrapper me-3">
                        <button 
                            className="notification-button"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <FaBell size={20} />
                            {notificationCount > 0 && (
                                <span className="notification-badge">
                                    {notificationCount}
                                </span>
                            )}
                        </button>
                        
                        {showNotifications && (
                            <div className="notification-dropdown">
                                <div className="notification-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Notifications</span>
                                    <button className="mark-all-read-btn" onClick={e => { e.stopPropagation(); markAllAsRead(); }} title="Mark all as read" style={{ background: 'none', border: 'none', color: '#0d6efd', fontWeight: 400, fontSize: '0.85rem', cursor: markAllLoading || notificationCount === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '2px 6px', opacity: markAllLoading || notificationCount === 0 ? 0.5 : 0.85 }} disabled={markAllLoading || notificationCount === 0}>
                                        <svg width="14" height="14" fill="currentColor" style={{ marginRight: 2 }} viewBox="0 0 16 16"><path d="M15.854 5.646a.5.5 0 0 0-.708-.708l-7.646 7.647-3.646-3.647a.5.5 0 1 0-.708.708l4 4a.5.5 0 0 0 .708 0l8-8z"/></svg>
                                        Mark all as read
                                    </button>
                                </div>
                                <div className="notification-list">
                                    {notifications.length === 0 ? (
                                        <div className="no-notifications">
                                            <p>No notifications</p>
                                        </div>
                                    ) : (
                                        notifications.map(notification => (
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
                            <span className="profile-name">{userInfo?.name || 'Teacher'}</span>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end profile-menu" aria-labelledby="userDropdown">
                            <li>
                                <button 
                                    className="dropdown-item" 
                                    onClick={() => navigate('/teacher-dashboard/profile')}
                                >
                                    <i className="bi bi-person me-2"></i>
                                    Profile
                                </button>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <button 
                                    className="logout-btn dropdown-item text-danger"
                                    onClick={() => {
                                        localStorage.clear();
                                        sessionStorage.clear();
                                        localStorage.removeItem('teacher-notifications');
                                        window.location.href = '/login';
                                    }}
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
        </nav>
    );
};

export default TeacherTopbar;
