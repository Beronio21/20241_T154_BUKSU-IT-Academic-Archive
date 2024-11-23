import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';
import StudentProfile from './StudentProfile';
import SubmitThesis from './SubmitThesis';
import Docs from './Docs';
import Calendar from './Calendar';

const StudentDashboard = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [userInfo, setUserInfo] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const data = localStorage.getItem('user-info');
        if (!data) {
            navigate('/login');
            return;
        }
        const userData = JSON.parse(data);
        if (userData?.role !== 'student') {
            navigate('/login');
            return;
        }
        setUserInfo(userData);
    }, [navigate]);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    useEffect(() => {
        if (userInfo?.email) {
            fetchNotifications();
        }
    }, [userInfo]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            setError(null);

            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            if (!userInfo || !userInfo.email) {
                throw new Error('User info not found');
            }

            const response = await fetch(
                `http://localhost:8080/api/thesis/student-submissions/${encodeURIComponent(userInfo.email)}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch submissions');
            }

            const data = await response.json();
            if (data.status === 'success') {
                setSubmissions(data.data);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            setError(null); // Reset error state
            console.log('Fetching notifications for:', userInfo.email); // Debug log

            const response = await fetch(
                `http://localhost:8080/api/notifications/${encodeURIComponent(userInfo.email)}`
            );
            
            console.log('Response status:', response.status); // Debug log
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received notifications:', data); // Debug log
            
            if (data.status === 'success') {
                setNotifications(data.data);
                setUnreadCount(data.data.filter(n => !n.read).length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setError(error.message);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
                method: 'PUT'
            });
            
            setNotifications(prev => 
                prev.map(n => 
                    n._id === notificationId ? { ...n, read: true } : n
                )
            );
            setUnreadCount(prev => prev - 1);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('user-info');
        navigate('/login');
    };

    const renderFeedback = (feedback) => {
        if (!feedback || feedback.length === 0) return null;
        
        return (
            <div className="feedback-section">
                {feedback.map((item, index) => (
                    <div key={index} className="feedback-item">
                        <div className="feedback-header">
                            <span className="teacher-info">
                                <strong>{item.teacherName}</strong> ({item.teacherEmail})
                            </span>
                            <span className={`feedback-status status-${item.status.toLowerCase()}`}>
                                {item.status}
                            </span>
                            <span className="feedback-date">
                                {formatDate(item.dateSubmitted)}
                            </span>
                        </div>
                        <div className="feedback-comment">
                            {item.comment}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderNotificationsPage = () => {
        return (
            <section className="notifications-page">
                <h2>All Notifications</h2>
                <div className="notifications-list">
                    {notifications.length === 0 ? (
                        <p className="no-notifications">No notifications</p>
                    ) : (
                        notifications.map(notification => (
                            <div 
                                key={notification._id} 
                                className={`notification-card ${!notification.read ? 'unread' : ''}`}
                            >
                                <div className="notification-header">
                                    <div className="notification-title">{notification.title}</div>
                                    <div className="notification-time">
                                        {formatDate(notification.createdAt)}
                                    </div>
                                </div>
                                <div className="notification-message">{notification.message}</div>
                                {!notification.read && (
                                    <button 
                                        className="mark-read-btn"
                                        onClick={() => markAsRead(notification._id)}
                                    >
                                        Mark as Read
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </section>
        );
    };

    const handleDelete = async (thesisId) => {
        if (!window.confirm('Are you sure you want to delete this thesis?')) {
            return;
        }

        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const response = await fetch(
                `http://localhost:8080/api/thesis/delete/${thesisId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userInfo.token}`
                    }
                }
            );

            const data = await response.json();
            if (data.status === 'success') {
                alert('Thesis deleted successfully');
                fetchSubmissions(); // Refresh the list
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error deleting thesis:', error);
            alert('Failed to delete thesis: ' + error.message);
        }
    };

    const renderContent = () => {
        switch(activeSection) {
            case 'profile':
                return <StudentProfile userInfo={userInfo} />;
            case 'submit-thesis':
                return <SubmitThesis />;
            case 'notifications':
                return renderNotificationsPage();
            case 'dashboard':
                return (
                    <>
                        <header className="header">
                            <div className="user-info">
                                <h1>Welcome, {userInfo?.name}</h1>
                                <p>Student ID: {userInfo?.student_id || 'N/A'}</p>
                            </div>
                            <img className="profile-picture" src={userInfo?.image} alt={userInfo?.name} />
                        </header>

                        <section className="status-cards">
                            <div className="status-card">
                                <h3>Pending Reviews</h3>
                                <p className="count">
                                    {submissions.filter(sub => sub.status === 'pending').length}
                                </p>
                            </div>
                            <div className="status-card">
                                <h3>Approved Chapters</h3>
                                <p className="count">
                                    {submissions.filter(sub => sub.status === 'approved').length}
                                </p>
                            </div>
                            <div className="status-card">
                                <h3>Upcoming Defense</h3>
                                <p>March 15, 2024</p>
                            </div>
                        </section>

                        <section className="submissions-section">
                            <h2>Recent Submissions</h2>
                            {loading ? (
                                <div className="loading-spinner">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            ) : submissions.length === 0 ? (
                                <div className="alert alert-info" role="alert">
                                    No submissions found
                                </div>
                            ) : (
                                <table className="submissions-table">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Members</th>
                                            <th>Adviser</th>
                                            <th>Submission Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" style={{textAlign: 'center'}}>
                                                    No submissions yet
                                                </td>
                                            </tr>
                                        ) : (
                                            submissions.map((submission, index) => (
                                                <React.Fragment key={submission._id || index}>
                                                    <tr>
                                                        <td>{submission.title}</td>
                                                        <td>{submission.members.join(', ')}</td>
                                                        <td>{submission.adviserEmail}</td>
                                                        <td>{formatDate(submission.createdAt)}</td>
                                                        <td>
                                                            <span className={`status-${submission.status.toLowerCase()}`}>
                                                                {submission.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <a 
                                                                href={submission.docsLink} 
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn-view"
                                                            >
                                                                View
                                                            </a>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleDelete(submission._id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {submission.feedback && submission.feedback.length > 0 && (
                                                        <tr className="feedback-row">
                                                            <td colSpan="6">
                                                                {renderFeedback(submission.feedback)}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </section>

                        <section className="calendar-link">
                            <h2>Google Calendar</h2>
                            <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">
                                View your events on Google Calendar
                            </a>
                        </section>
                    </>
                );
            case 'docs':
                return <Docs />;
            case 'calendar':
                return <Calendar />;
            default:
                return null;
        }
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <h2>Student Menu</h2>
                <ul>
                    <li 
                        className={activeSection === 'dashboard' ? 'active' : ''} 
                        onClick={() => setActiveSection('dashboard')}
                    >
                        Dashboard
                    </li>
                    <li 
                        className={activeSection === 'profile' ? 'active' : ''} 
                        onClick={() => setActiveSection('profile')}
                    >
                        My Profile
                    </li>
                    <li 
                        className={activeSection === 'submit-thesis' ? 'active' : ''} 
                        onClick={() => setActiveSection('submit-thesis')}
                    >
                        Submit Thesis
                    </li>
                    <li 
                        className={activeSection === 'notifications' ? 'active' : ''} 
                        onClick={() => setActiveSection('notifications')}
                    >
                        Notifications
                        {unreadCount > 0 && <span className="menu-notification-badge">{unreadCount}</span>}
                    </li>
                    <li 
                        className={activeSection === 'docs' ? 'active' : ''} 
                        onClick={() => setActiveSection('docs')}
                    >
                        Docs
                    </li>
                    <li 
                        className={activeSection === 'calendar' ? 'active' : ''} 
                        onClick={() => setActiveSection('calendar')}
                    >
                        Create Event
                    </li>
                    <li>My Submissions</li>
                    <li>Schedule</li>
                    <li>Messages</li>
                    <li onClick={handleLogout}>Log Out</li>
                </ul>
            </aside>

            <main className="main-content">
                <div className="notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
                    <i className="fas fa-bell"></i>
                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </div>

                {showNotifications && (
                    <div className="notifications-dropdown">
                        <h3>Notifications</h3>
                        {notifications.length === 0 ? (
                            <p className="no-notifications">No notifications</p>
                        ) : (
                            notifications.map(notification => (
                                <div 
                                    key={notification._id} 
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                    onClick={() => markAsRead(notification._id)}
                                >
                                    <div className="notification-title">{notification.title}</div>
                                    <div className="notification-message">{notification.message}</div>
                                    <div className="notification-time">
                                        {formatDate(notification.createdAt)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
                {renderContent()}
            </main>
        </div>
    );
};

export default StudentDashboard; 