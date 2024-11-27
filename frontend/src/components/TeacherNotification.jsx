import React from 'react';
import './TeacherNotification.css';

const TeacherNotification = ({ notifications, markAsRead }) => {
    return (
        <div className="notifications-page">
            <h2>Notifications</h2>
            <div className="notifications-container">
                {notifications.length === 0 ? (
                    <div className="no-notifications">
                        <p>No notifications</p>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {notifications.map(notification => (
                            <div 
                                key={notification._id}
                                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                onClick={() => markAsRead(notification._id)}
                            >
                                <div className="notification-content">
                                    <h4>{notification.title}</h4>
                                    <p>{notification.message}</p>
                                    <small>
                                        {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </small>
                                </div>
                                {!notification.read && (
                                    <span className="unread-indicator">New</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherNotification; 