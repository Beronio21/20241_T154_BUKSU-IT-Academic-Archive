import React, { useState, useMemo } from 'react';
import '../Styles/TeacherNotification.css';
import { FiCheckCircle, FiXCircle, FiEdit2, FiClock } from 'react-icons/fi';

// Map status to icon and color
const statusIconMap = {
  approved: <FiCheckCircle size={20} style={{ color: '#22c55e', marginRight: 8 }} />, // green
  rejected: <FiXCircle size={20} style={{ color: '#ef4444', marginRight: 8 }} />, // red
  revision: <FiEdit2 size={20} style={{ color: '#fb923c', marginRight: 8 }} />, // orange
  pending: <FiClock size={20} style={{ color: '#facc15', marginRight: 8 }} />, // yellow
};
const getStatusKey = (status) => {
  if (!status) return 'pending';
  const s = status.toLowerCase();
  if (s === 'approved') return 'approved';
  if (s === 'rejected') return 'rejected';
  if (s === 'revision' || s === 'needs revision') return 'revision';
  if (s === 'pending' || s === 'under review') return 'pending';
  return 'pending';
};

const TeacherNotification = ({ notifications, markAsRead, markAllAsRead }) => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const unreadCount = notifications.filter(n => !n.read).length;

    // Filtered notifications
    const filtered = useMemo(() => notifications.filter(n => {
      const matchesSearch =
        n.thesisTitle?.toLowerCase().includes(search.toLowerCase()) ||
        n.title?.toLowerCase().includes(search.toLowerCase()) ||
        n.message?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter ? (n.status || '').toLowerCase() === statusFilter : true;
      return matchesSearch && matchesStatus;
    }), [notifications, search, statusFilter]);

    return (
        <div className="notifications-page teacher-notifications-responsive">
            <div className="notifications-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>Notifications {unreadCount > 0 && <span className="unread-badge">{unreadCount} New</span>}</h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search by capstone, title, or message..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, minWidth: 180 }}
                    />
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }}
                    >
                        <option value="">All Statuses</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="revision">Revision</option>
                        <option value="pending">Pending</option>
                    </select>
                    {unreadCount > 0 && markAllAsRead && (
                        <button
                            className="mark-all-read-btn"
                            onClick={markAllAsRead}
                            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
            </div>
            <div className="notifications-container">
                {filtered.length === 0 ? (
                    <div className="no-notifications">
                        <p>No notifications</p>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {filtered.map(notification => {
                            const statusKey = getStatusKey(notification.status);
                            const statusIcon = statusIconMap[statusKey];
                            return (
                                <div
                                    key={notification._id}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                    onClick={() => markAsRead(notification._id)}
                                    style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', background: !notification.read ? 'linear-gradient(90deg, #eaf4ff 0%, #fafdff 100%)' : '#fff', borderLeft: !notification.read ? '4px solid #2563eb' : '4px solid transparent', marginBottom: 10, borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                                >
                                    {/* Status icon */}
                                    <div style={{ marginRight: 12, marginTop: 2 }}>{statusIcon}</div>
                                    <div className="notification-content" style={{ flex: 1 }}>
                                        <h4 style={{ fontWeight: 600, color: '#222', marginBottom: 2 }}>{notification.title || 'N/A'}</h4>
                                        <p style={{ color: '#475569', fontSize: 15, marginBottom: 2 }}>{notification.message || 'N/A'}</p>
                                        <div style={{ fontSize: 14, color: '#2c3e50', marginBottom: 2 }}><strong>Capstone:</strong> {notification.thesisTitle || 'N/A'}</div>
                                        <div style={{ fontSize: 14, color: '#2c3e50', marginBottom: 2 }}><strong>Status:</strong> {notification.status || 'N/A'}</div>
                                        <div style={{ fontSize: 14, color: '#2c3e50', marginBottom: 2 }}><strong>Reviewer Comments:</strong> {notification.reviewerComments && notification.reviewerComments.trim() ? notification.reviewerComments : 'N/A'}</div>
                                        <small style={{ color: '#64748b', fontSize: 13 }}>
                                            {notification.createdAt
                                                ? new Date(notification.createdAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                : 'Unknown time'}
                                        </small>
                                    </div>
                                    {!notification.read && (
                                        <span className="unread-indicator">New</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherNotification; 