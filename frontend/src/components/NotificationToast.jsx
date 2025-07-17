import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import NotificationCard from './NotificationCard';
import './NotificationToast.css';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const getShownIds = () => {
  try {
    const ids = localStorage.getItem('shownNotificationIds');
    return ids ? new Set(JSON.parse(ids)) : new Set();
  } catch {
    return new Set();
  }
};
const setShownIds = (ids) => {
  localStorage.setItem('shownNotificationIds', JSON.stringify(Array.from(ids)));
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [shownIds, setShownIdsState] = useState(getShownIds());

  useEffect(() => {
    setShownIds(shownIds);
  }, [shownIds]);

  // Accepts either a notification object (with _id) or a string message
  const showToast = useCallback((notificationOrMsg, duration = 4000) => {
    if (!notificationOrMsg) return;
    // If it's a string, show as a simple toast (always show, not deduped)
    if (typeof notificationOrMsg === 'string') {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message: notificationOrMsg }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
      return;
    }
    // If it's a notification object, dedupe by _id
    if (!notificationOrMsg._id) return;
    if (shownIds.has(notificationOrMsg._id)) return;
    setToasts((prev) => [...prev, { ...notificationOrMsg, id: notificationOrMsg._id }]);
    setShownIdsState((prev) => new Set(prev).add(notificationOrMsg._id));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== notificationOrMsg._id));
    }, duration);
  }, [shownIds]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="notification-toast-container compact-toast-area">
        {toasts.map((toast) => (
          <div key={toast.id} className={`notification-toast-slide-in${toast.type === 'toast' ? ' admin-toast' : ''}`}>
            {toast.title || toast.message ? (
              <div className={`notification-toast-card${toast.type === 'toast' ? ' admin-toast-card' : ''}`}>
                {toast.title && <div className="notification-toast-title">{toast.title}</div>}
                <div className="notification-toast-message">{toast.message}</div>
              </div>
            ) : (
              <div className="notification-toast-card">
                <div className="notification-toast-message">{typeof toast === 'string' ? toast : ''}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}; 