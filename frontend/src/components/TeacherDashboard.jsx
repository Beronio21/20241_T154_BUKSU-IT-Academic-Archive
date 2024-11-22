import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherProfile from './TeacherProfile';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [currentView, setCurrentView] = useState('dashboard');
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedbackForm, setFeedbackForm] = useState({
        thesisId: null,
        comment: '',
        status: 'pending'
    });
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const data = localStorage.getItem('user-info');
        if (!data) {
            navigate('/login');
            return;
        }
        const userData = JSON.parse(data);
        if (userData?.role !== 'teacher') {
            navigate('/login');
            return;
        }
        setUserInfo(userData);
    }, [navigate]);

    // Fetch submissions when userInfo is available
    useEffect(() => {
        if (userInfo?.email) {
            fetchSubmissions();
        }
    }, [userInfo]);

    const fetchSubmissions = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/thesis/submissions/adviser?email=${encodeURIComponent(userInfo.email)}`
            );
            const data = await response.json();
            
            if (data.status === 'success') {
                setSubmissions(data.data);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
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

    // Handle menu item clicks
    const handleMenuClick = (view) => {
        setCurrentView(view);
    };

    const handleSubmitFeedback = async (thesisId) => {
        try {
            if (!feedbackForm.comment.trim()) {
                alert('Please enter a comment');
                return;
            }

            const feedbackData = {
                comment: feedbackForm.comment.trim(),
                status: feedbackForm.status,
                teacherName: userInfo.name,
                teacherEmail: userInfo.email
            };

            console.log('Submitting feedback:', {
                thesisId,
                ...feedbackData
            });

            const response = await fetch(`http://localhost:8080/api/thesis/feedback/${thesisId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify(feedbackData)
            });

            const data = await response.json();
            console.log('Server response:', data);
            
            if (response.ok) {
                alert('Feedback submitted successfully');
                setFeedbackForm({
                    thesisId: null,
                    comment: '',
                    status: 'pending'
                });
                await fetchSubmissions(); // Refresh the list
            } else {
                throw new Error(data.message || 'Failed to submit feedback');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert(`Failed to submit feedback: ${error.message}`);
        }
    };

    // Add this useEffect to fetch notifications
    useEffect(() => {
        if (userInfo?.email) {
            fetchNotifications();
        }
    }, [userInfo]);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/notifications/${encodeURIComponent(userInfo.email)}`
            );
            const data = await response.json();
            
            if (data.status === 'success') {
                setNotifications(data.data);
                setUnreadCount(data.data.filter(n => !n.read).length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
                method: 'PUT'
            });
            await fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Render content based on current view
    const renderContent = () => {
        switch(currentView) {
            case 'profile':
                return <TeacherProfile />;
            case 'dashboard':
            default:
                return (
                    <>
                        <header className="header">
                            <div className="user-info">
                                <h1>Welcome, {userInfo?.name}</h1>
                                <p>Teacher ID: {userInfo?.teacherId || 'N/A'}</p>
                            </div>
                            <img className="profile-picture" src={userInfo?.image} alt={userInfo?.name} />
                            <div className="notifications-wrapper">
                                <button 
                                    className="notifications-button"
                                    onClick={() => setShowNotifications(!showNotifications)}
                                >
                                    Notifications {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                                </button>
                                {showNotifications && (
                                    <div className="notifications-dropdown">
                                        {notifications.length === 0 ? (
                                            <p>No notifications</p>
                                        ) : (
                                            notifications.map(notification => (
                                                <div 
                                                    key={notification._id}
                                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                                    onClick={() => markAsRead(notification._id)}
                                                >
                                                    <h4>{notification.title}</h4>
                                                    <p>{notification.message}</p>
                                                    <small>{new Date(notification.createdAt).toLocaleDateString()}</small>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </header>

                        <section className="status-cards">
                            <div className="status-card">
                                <h3>Pending Reviews</h3>
                                <p className="count">
                                    {submissions.filter(sub => sub.status === 'pending').length}
                                </p>
                            </div>
                            <div className="status-card">
                                <h3>Students Assigned</h3>
                                <p className="count">{submissions.length}</p>
                            </div>
                            <div className="status-card">
                                <h3>Upcoming Defenses</h3>
                                <p className="count">3</p>
                            </div>
                        </section>

                        <section className="submissions-section">
                            <h2>Recent Submissions to Review</h2>
                            {loading ? (
                                <p>Loading submissions...</p>
                            ) : (
                                <table className="submissions-table">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Members</th>
                                            <th>Student Email</th>
                                            <th>Submission Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" style={{textAlign: 'center'}}>
                                                    No submissions to review
                                                </td>
                                            </tr>
                                        ) : (
                                            submissions.map((submission) => (
                                                <tr key={submission._id}>
                                                    <td>{submission.title}</td>
                                                    <td>{submission.members.join(', ')}</td>
                                                    <td>{submission.email || 'N/A'}</td>
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
                                                            className="btn-feedback"
                                                            onClick={() => setFeedbackForm({ ...feedbackForm, thesisId: submission._id })}
                                                        >
                                                            Add Feedback
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </section>

                        {feedbackForm.thesisId && (
                            <div className="feedback-modal">
                                <div className="feedback-content">
                                    <h3>Submit Feedback</h3>
                                    <textarea
                                        value={feedbackForm.comment}
                                        onChange={(e) => setFeedbackForm({...feedbackForm, comment: e.target.value})}
                                        placeholder="Enter your feedback..."
                                        rows="4"
                                        required
                                    />
                                    <select
                                        value={feedbackForm.status}
                                        onChange={(e) => setFeedbackForm({...feedbackForm, status: e.target.value})}
                                        required
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approve</option>
                                        <option value="rejected">Reject</option>
                                        <option value="revision">Needs Revision</option>
                                    </select>
                                    <div className="button-group">
                                        <button 
                                            onClick={() => handleSubmitFeedback(feedbackForm.thesisId)}
                                            className="btn-submit"
                                            disabled={!feedbackForm.comment.trim()}
                                        >
                                            Submit Feedback
                                        </button>
                                        <button 
                                            onClick={() => setFeedbackForm({...feedbackForm, thesisId: null})}
                                            className="btn-cancel"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                );
        }
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <h2>Teacher Menu</h2>
                <ul>
                    <li 
                        className={currentView === 'dashboard' ? 'active' : ''} 
                        onClick={() => handleMenuClick('dashboard')}
                    >
                        Dashboard
                    </li>
                    <li>Review Submissions</li>
                    <li>Student List</li>
                    <li>Defense Schedule</li>
                    <li>Messages</li>
                    <li 
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{ position: 'relative' }}
                    >
                        Notifications
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </li>
                    <li 
                        className={currentView === 'profile' ? 'active' : ''} 
                        onClick={() => handleMenuClick('profile')}
                    >
                        My Profile
                    </li>
                    <li onClick={handleLogout}>Log Out</li>
                </ul>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="notifications-container">
                    {showNotifications && (
                        <div className="notifications-dropdown">
                            <div className="notifications-header">
                                <h3>Notifications</h3>
                                <button onClick={() => setShowNotifications(false)}>×</button>
                            </div>
                            {notifications.length === 0 ? (
                                <p className="no-notifications">No notifications</p>
                            ) : (
                                <div className="notifications-list">
                                    {notifications.map(notification => (
                                        <div 
                                            key={notification._id}
                                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                            onClick={() => markAsRead(notification._id)}
                                        >
                                            <h4>{notification.title}</h4>
                                            <p>{notification.message}</p>
                                            <small>{new Date(notification.createdAt).toLocaleDateString()}</small>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {renderContent()}
            </main>
        </div>
    );
};

export default TeacherDashboard; 