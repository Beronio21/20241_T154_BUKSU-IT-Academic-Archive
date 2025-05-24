import React, { useState, useEffect } from 'react';
import { Dropdown, Badge, ListGroup, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { 
    FaBell, 
    FaClock, 
    FaCheck, 
    FaTrash, 
    FaCheckDouble, 
    FaEllipsisV, 
    FaRegBell,
    FaEnvelope,
    FaUserGraduate,
    FaFileAlt,
    FaExclamationCircle
} from 'react-icons/fa';
import axios from 'axios';
import './AdminNotifications.css';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    useEffect(() => {
        fetchNotifications();
        // Set up polling for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/admin/notifications');
            setNotifications(response.data);
            const unread = response.data.filter(notif => !notif.read).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`http://localhost:8080/api/admin/notifications/${notificationId}/read`);
            setNotifications(notifications.map(notif => 
                notif._id === notificationId ? { ...notif, read: true } : notif
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put('http://localhost:8080/api/admin/notifications/read-all');
            setNotifications(notifications.map(notif => ({ ...notif, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const removeNotification = async (notificationId) => {
        try {
            await axios.delete(`http://localhost:8080/api/admin/notifications/${notificationId}`);
            setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
            if (!notifications.find(n => n._id === notificationId)?.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error removing notification:', error);
        }
    };

    const removeAllNotifications = async () => {
        if (!showConfirmDelete) {
            setShowConfirmDelete(true);
            return;
        }
        try {
            await axios.delete('http://localhost:8080/api/admin/notifications');
            setNotifications([]);
            setUnreadCount(0);
            setShowConfirmDelete(false);
        } catch (error) {
            console.error('Error removing all notifications:', error);
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' years ago';
        
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' months ago';
        
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' days ago';
        
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' hours ago';
        
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' minutes ago';
        
        return Math.floor(seconds) + ' seconds ago';
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'submission':
                return <FaFileAlt className="notification-type-icon submission" />;
            case 'registration':
                return <FaUserGraduate className="notification-type-icon registration" />;
            case 'update':
                return <FaEnvelope className="notification-type-icon update" />;
            default:
                return <FaExclamationCircle className="notification-type-icon default" />;
        }
    };

    const renderTooltip = (text) => (
        <Tooltip>{text}</Tooltip>
    );

    return (
        <Dropdown align="end" className="notification-dropdown">
            <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip>{unreadCount > 0 ? `${unreadCount} new notifications` : 'No new notifications'}</Tooltip>}
            >
                <Dropdown.Toggle variant="link" className="notification-toggle">
                    <div className="notification-bell-container">
                        {unreadCount > 0 ? (
                            <FaBell size={20} className="notification-bell active" />
                        ) : (
                            <FaRegBell size={20} className="notification-bell" />
                        )}
                        {unreadCount > 0 && (
                            <Badge bg="danger" className="notification-badge pulse">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                        )}
                    </div>
                </Dropdown.Toggle>
            </OverlayTrigger>

            <Dropdown.Menu className="notification-menu">
                <div className="notification-header">
                    <div className="d-flex align-items-center">
                        <h6 className="mb-0">Notifications</h6>
                        {unreadCount > 0 && (
                            <Badge bg="danger" className="ms-2 notification-count-badge">
                                {unreadCount} New
                            </Badge>
                        )}
                    </div>
                    <div className="notification-actions">
                        {notifications.length > 0 && (
                            <>
                                <OverlayTrigger
                                    placement="bottom"
                                    overlay={renderTooltip('Mark all as read')}
                                >
                                    <Button
                                        variant="link"
                                        className="p-0 me-3 text-primary action-button"
                                        onClick={markAllAsRead}
                                        disabled={unreadCount === 0}
                                    >
                                        <FaCheckDouble size={16} />
                                    </Button>
                                </OverlayTrigger>
                                <OverlayTrigger
                                    placement="bottom"
                                    overlay={renderTooltip(showConfirmDelete ? 'Click again to confirm' : 'Clear all notifications')}
                                >
                                    <Button
                                        variant="link"
                                        className={`p-0 action-button ${showConfirmDelete ? 'text-danger pulse-danger' : 'text-muted'}`}
                                        onClick={removeAllNotifications}
                                        onBlur={() => setTimeout(() => setShowConfirmDelete(false), 200)}
                                    >
                                        <FaTrash size={16} />
                                    </Button>
                                </OverlayTrigger>
                            </>
                        )}
                    </div>
                </div>

                <div className="notification-list">
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-grow spinner-grow-sm text-primary me-1" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <div className="spinner-grow spinner-grow-sm text-primary mx-1" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <div className="spinner-grow spinner-grow-sm text-primary ms-1" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : notifications.length > 0 ? (
                        <ListGroup variant="flush">
                            {notifications.map((notification) => (
                                <ListGroup.Item 
                                    key={notification._id}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                >
                                    <div className="d-flex align-items-start">
                                        <div className="notification-icon">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div 
                                            className="notification-content" 
                                            onClick={() => !notification.read && markAsRead(notification._id)}
                                        >
                                            <p className="notification-text">{notification.message}</p>
                                            <div className="notification-meta">
                                                <small className="text-muted">
                                                    <FaClock className="me-1" />
                                                    {getTimeAgo(notification.createdAt)}
                                                </small>
                                                {notification.read ? (
                                                    <small className="text-success">
                                                        <FaCheck className="me-1" />
                                                        Read
                                                    </small>
                                                ) : (
                                                    <small className="text-primary">
                                                        <FaRegBell className="me-1" />
                                                        New
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                        <Dropdown className="ms-2">
                                            <OverlayTrigger
                                                placement="left"
                                                overlay={renderTooltip('Actions')}
                                            >
                                                <Dropdown.Toggle variant="link" className="notification-action-toggle p-0">
                                                    <FaEllipsisV size={14} className="text-muted" />
                                                </Dropdown.Toggle>
                                            </OverlayTrigger>
                                            <Dropdown.Menu align="end" className="notification-actions-menu">
                                                {!notification.read && (
                                                    <Dropdown.Item 
                                                        onClick={() => markAsRead(notification._id)}
                                                        className="text-primary"
                                                    >
                                                        <FaCheck className="me-2" />
                                                        Mark as read
                                                    </Dropdown.Item>
                                                )}
                                                <Dropdown.Item 
                                                    className="text-danger"
                                                    onClick={() => removeNotification(notification._id)}
                                                >
                                                    <FaTrash className="me-2" />
                                                    Remove
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <div className="empty-notifications">
                            <FaRegBell size={40} className="text-muted mb-2" />
                            <p className="text-muted mb-0">No notifications</p>
                        </div>
                    )}
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default AdminNotifications; 