import React from 'react';
import { FiCheckCircle, FiXCircle, FiEdit2, FiClock } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';
import './NotificationCard.css';

const statusIconMap = {
  approved: <FiCheckCircle size={22} strokeWidth={2} style={{ color: '#22c55e', marginRight: 12 }} />, // green
  rejected: <FiXCircle size={22} strokeWidth={2} style={{ color: '#ef4444', marginRight: 12 }} />, // red
  revision: <FiEdit2 size={22} strokeWidth={2} style={{ color: '#fb923c', marginRight: 12 }} />, // orange
  pending: <FiClock size={22} strokeWidth={2} style={{ color: '#facc15', marginRight: 12 }} />, // yellow
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

const NotificationCard = ({ notification, onMarkAsRead, onDelete, fadeAll }) => {
  const { title, message, createdAt, read, status } = notification;
  const statusKey = getStatusKey(status);
  const statusIcon = statusIconMap[statusKey];

  // Card click handler: only mark as read if unread
  const handleCardClick = () => {
    if (!read && onMarkAsRead) onMarkAsRead();
  };

  return (
    <div
      className={`notification-card${fadeAll ? ' fade-out' : ''}${read ? '' : ' unread'}`}
      onClick={handleCardClick}
      tabIndex={0}
      style={{ cursor: !read ? 'pointer' : 'default', position: 'relative', display: 'flex', alignItems: 'center', minHeight: 56 }}
    >
      {/* Outline status icon */}
      {statusIcon}
      <div className="notification-card-content" style={{ flex: 1 }}>
        <div className="notification-card-title" style={{ fontWeight: 600, color: '#222', marginBottom: 2 }}>{title}</div>
        <div className="notification-card-message" style={{ color: '#475569', fontSize: 15, marginBottom: 2 }}>{message}</div>
        {/* Show extra info if present */}
        {notification.thesisTitle && (
          <div style={{ fontSize: 14, color: '#2c3e50', marginBottom: 2 }}><strong>Capstone:</strong> {notification.thesisTitle}</div>
        )}
        {/* Always show status, default to Pending if missing */}
        {notification.status ? (
          <div style={{ fontSize: 14, color: '#2c3e50', marginBottom: 2 }}><strong>Status:</strong> {notification.status}</div>
        ) : (
          <div style={{ fontSize: 14, color: '#2c3e50', marginBottom: 2 }}><strong>Status:</strong> Pending</div>
        )}
        {notification.reviewerComments && notification.reviewerComments.trim() && (
          <div style={{ fontSize: 14, color: '#2c3e50', marginBottom: 2 }}><strong>Reviewer Comments:</strong> {notification.reviewerComments}</div>
        )}
        {/* Show who performed the action if available */}
        {notification.reviewedBy && (
          <div style={{ fontSize: 14, color: '#2c3e50', marginBottom: 2 }}><strong>Reviewed By:</strong> {notification.reviewedBy}</div>
        )}
        <div className="notification-card-timestamp" style={{ color: '#64748b', fontSize: 13 }}>
          {notification.createdAt
            ? new Date(notification.createdAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'Unknown time'}
        </div>
      </div>
    </div>
  );
};

export default NotificationCard; 