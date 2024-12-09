import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import StudentProfile from '../Profile/StudentProfile';
import SubmitThesis from '../components/SubmitThesis';
import Docs from '../components/Docs';
import Calendar from '../components/Calendar';
import SendGmail from '../Communication/SendGmail';
import ScheduleTable from '../components/ScheduleTable';

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
    const location = useLocation();
    const [isEditing, setIsEditing] = useState(false);
    const [editedInfo, setEditedInfo] = useState(null);

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
        
        if (location.pathname === '/student-dashboard') {
            navigate('/student-dashboard/dashboard');
        }
    }, [navigate, location]);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    useEffect(() => {
        if (userInfo?.email) {
            fetchNotifications();
        }
    }, [userInfo]);

    useEffect(() => {
        // Prevent back navigation
        const handlePopState = () => {
            window.history.pushState(null, null, window.location.pathname);
        };

        window.history.pushState(null, null, window.location.pathname);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

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
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/', { replace: true });
        }
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

    const handleProfileUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/students/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify(editedInfo)
            });

            if (response.ok) {
                const updatedUser = { ...userInfo, ...editedInfo };
                setUserInfo(updatedUser);
                localStorage.setItem('user-info', JSON.stringify(updatedUser));
                setIsEditing(false);
                alert('Profile updated successfully!');
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    const renderContent = () => {
        switch(activeSection) {
            case 'profile':
                return (
                    <div className="container-fluid py-4">
                        <div className="card shadow">
                            {/* Profile Header */}
                            <div className="card-header bg-primary text-white p-4 position-relative">
                                <div className="d-flex align-items-center">
                                    <div className="position-relative">
                                        <img
                                            src={userInfo?.image || 'https://via.placeholder.com/150'}
                                            alt="Profile"
                                            className="rounded-circle"
                                            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                        />
                                        <button className="btn btn-light btn-sm position-absolute bottom-0 end-0 rounded-circle p-1">
                                            <i className="fas fa-camera"></i>
                                        </button>
                                    </div>
                                    <div className="ms-4">
                                        <h2 className="mb-1">{userInfo?.name}</h2>
                                        <p className="mb-0">{userInfo?.student_id}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Content */}
                            <div className="card-body p-4">
                                <div className="row">
                                    {/* Personal Information */}
                                    <div className="col-lg-8">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h3 className="mb-0">Personal Information</h3>
                                            <button 
                                                className="btn btn-outline-primary"
                                                onClick={() => {
                                                    if (isEditing) {
                                                        handleProfileUpdate();
                                                    } else {
                                                        setEditedInfo({ ...userInfo });
                                                        setIsEditing(true);
                                                    }
                                                }}
                                            >
                                                {isEditing ? 'Save Changes' : 'Edit Profile'}
                                            </button>
                                        </div>

                                        <div className="row g-4">
                                            {/* Name */}
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">Full Name</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={editedInfo?.name || ''}
                                                            onChange={(e) => setEditedInfo({
                                                                ...editedInfo,
                                                                name: e.target.value
                                                            })}
                                                        />
                                                    ) : (
                                                        <p className="form-control-plaintext">{userInfo?.name}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">Email</label>
                                                    <p className="form-control-plaintext">{userInfo?.email}</p>
                                                </div>
                                            </div>

                                            {/* Student ID */}
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">Student ID</label>
                                                    <p className="form-control-plaintext">{userInfo?.student_id}</p>
                                                </div>
                                            </div>

                                            {/* Contact Number */}
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">Contact Number</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="tel"
                                                            className="form-control"
                                                            value={editedInfo?.contactNumber || ''}
                                                            onChange={(e) => setEditedInfo({
                                                                ...editedInfo,
                                                                contactNumber: e.target.value
                                                            })}
                                                        />
                                                    ) : (
                                                        <p className="form-control-plaintext">
                                                            {userInfo?.contactNumber || 'Not specified'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Program */}
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">Program</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={editedInfo?.program || ''}
                                                            onChange={(e) => setEditedInfo({
                                                                ...editedInfo,
                                                                program: e.target.value
                                                            })}
                                                        />
                                                    ) : (
                                                        <p className="form-control-plaintext">
                                                            {userInfo?.program || 'Not specified'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Year Level */}
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="form-label">Year Level</label>
                                                    {isEditing ? (
                                                        <select
                                                            className="form-select"
                                                            value={editedInfo?.yearLevel || ''}
                                                            onChange={(e) => setEditedInfo({
                                                                ...editedInfo,
                                                                yearLevel: e.target.value
                                                            })}
                                                        >
                                                            <option value="">Select Year Level</option>
                                                            <option value="1">1st Year</option>
                                                            <option value="2">2nd Year</option>
                                                            <option value="3">3rd Year</option>
                                                            <option value="4">4th Year</option>
                                                        </select>
                                                    ) : (
                                                        <p className="form-control-plaintext">
                                                            {userInfo?.yearLevel || 'Not specified'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Card */}
                                    <div className="col-lg-4">
                                        <div className="card bg-light">
                                            <div className="card-body">
                                                <h4 className="card-title mb-4">Thesis Progress</h4>
                                                <div className="row g-3">
                                                    <div className="col-12">
                                                        <div className="p-3 bg-white rounded shadow-sm text-center">
                                                            <h3 className="text-primary mb-1">
                                                                {submissions.filter(sub => sub.status === 'approved').length}
                                                            </h3>
                                                            <p className="mb-0">Approved Submissions</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="p-3 bg-white rounded shadow-sm text-center">
                                                            <h3 className="text-warning mb-1">
                                                                {submissions.filter(sub => sub.status === 'pending').length}
                                                            </h3>
                                                            <p className="mb-0">Pending Reviews</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="p-3 bg-white rounded shadow-sm text-center">
                                                            <h3 className="text-info mb-1">
                                                                {submissions.length}
                                                            </h3>
                                                            <p className="mb-0">Total Submissions</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
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
                                                                className="btn btn-primary btn-sm me-1"
                                                                style={{ padding: '0.1rem 0.3rem' }}
                                                            >
                                                                View
                                                            </a>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                style={{ padding: '0.1rem 0.3rem' }}
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
            case 'send-gmail':
                return <SendGmail />;
            case 'schedule':
                return <ScheduleTable />;
            default:
                return null;
        }
    };

    const handleSectionChange = (section) => {
        setActiveSection(section);
        navigate(`/student-dashboard/${section}`);
    };

    return (
        <div className="d-flex">
            <div className="bg-dark position-fixed start-0 top-0" 
                 style={{
                     width: '250px', 
                     height: '100vh', 
                     overflowY: 'auto',
                     boxShadow: '2px 0 5px rgba(0,0,0,0.2)'
                 }}>
                <div className="d-flex flex-column h-100">
                    {/* Header */}
                    <div className="p-4 text-center">
                        <h5 className="text-white fw-bold mb-0">Student Portal</h5>
                    </div>

                    {/* Navigation Items */}
                    <div className="px-3">
                        <ul className="nav flex-column gap-1">
                            {[
                                { name: 'Dashboard', section: 'dashboard', icon: '📊' },
                                { name: 'My Profile', section: 'profile', icon: '👤' },
                                { name: 'Send Gmail', section: 'send-gmail', icon: '📧' },
                            ].map((item) => (
                                <li className="nav-item" key={item.section}>
                                    <button 
                                        className={`nav-link w-100 text-start rounded ${
                                            activeSection === item.section 
                                            ? 'active bg-primary text-white' 
                                            : 'text-white-50'
                                        }`}
                                        onClick={() => handleSectionChange(item.section)}
                                        style={{
                                            transition: 'all 0.2s ease',
                                            padding: '12px 16px',
                                            border: 'none',
                                            backgroundColor: activeSection === item.section ? '#0d6efd' : 'transparent',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (activeSection !== item.section) {
                                                e.target.style.backgroundColor = '#2c3034';
                                                e.target.classList.remove('text-white-50');
                                                e.target.classList.add('text-white');
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (activeSection !== item.section) {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.classList.add('text-white-50');
                                                e.target.classList.remove('text-white');
                                            }
                                        }}
                                    >
                                        <span className="me-2">{item.icon}</span>
                                        {item.name}
                                    </button>
                                </li>
                            ))}

                            {/* Thesis Management Dropdown */}
                            <li className="nav-item">
                                <div className="dropdown w-100">
                                    <button 
                                        className="nav-link w-100 text-start rounded text-white-50 dropdown-toggle"
                                        data-bs-toggle="dropdown"
                                        style={{
                                            transition: 'all 0.2s ease',
                                            padding: '12px 16px',
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#2c3034';
                                            e.target.classList.remove('text-white-50');
                                            e.target.classList.add('text-white');
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = 'transparent';
                                            e.target.classList.add('text-white-50');
                                            e.target.classList.remove('text-white');
                                        }}
                                    >
                                        <span className="me-2">📚</span>
                                        Thesis Management
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-dark">
                                        <li>
                                            <button 
                                                className="dropdown-item text-white-50"
                                                onClick={() => handleSectionChange('submit-thesis')}
                                                style={{
                                                    fontSize: '14px',
                                                    padding: '8px 16px',
                                                }}
                                            >
                                                Submit Thesis
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </li>

                            {/* Remaining navigation items */}
                            {[
                                { name: 'Calendar', section: 'calendar', icon: '📅' },
                                { name: 'Schedule', section: 'schedule', icon: '📋' },
                            ].map((item) => (
                                <li className="nav-item" key={item.section}>
                                    <button 
                                        className={`nav-link w-100 text-start rounded ${
                                            activeSection === item.section 
                                            ? 'active bg-primary text-white' 
                                            : 'text-white-50'
                                        }`}
                                        onClick={() => handleSectionChange(item.section)}
                                        style={{
                                            transition: 'all 0.2s ease',
                                            padding: '12px 16px',
                                            border: 'none',
                                            backgroundColor: activeSection === item.section ? '#0d6efd' : 'transparent',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (activeSection !== item.section) {
                                                e.target.style.backgroundColor = '#2c3034';
                                                e.target.classList.remove('text-white-50');
                                                e.target.classList.add('text-white');
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (activeSection !== item.section) {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.classList.add('text-white-50');
                                                e.target.classList.remove('text-white');
                                            }
                                        }}
                                    >
                                        <span className="me-2">{item.icon}</span>
                                        {item.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Logout Button */}
                    <div className="mt-auto p-3">
                        <button 
                            className="btn btn-danger w-100"
                            onClick={handleLogout}
                        >
                            <span className="me-2">🚪</span>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{marginLeft: '250px'}} className="flex-grow-1 p-4">
                <Routes>
                    <Route path="/dashboard" element={renderContent()} />
                    <Route path="/profile" element={<StudentProfile userInfo={userInfo} />} />
                    <Route path="/submit-thesis" element={<SubmitThesis />} />
                    <Route path="/notifications" element={renderNotificationsPage()} />
                    <Route path="/docs" element={<Docs />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/send-gmail" element={<SendGmail />} />
                    <Route path="/schedule" element={<ScheduleTable />} />
                    <Route path="*" element={<Navigate to="/student-dashboard/dashboard" replace />} />
                </Routes>
            </div>
        </div>
    );
};

export default StudentDashboard; 