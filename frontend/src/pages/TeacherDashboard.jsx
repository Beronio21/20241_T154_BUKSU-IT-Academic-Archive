import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import TeacherProfile from '../Profile/TeacherProfile';
import SubmitThesis from '../components/SubmitThesis';
import Docs from '../components/Docs';
import Calendar from '../components/Calendar';
import SendGmail from '../Communication/SendGmail';
import ScheduleTable from '../components/ScheduleTable';
import DefenseSchedule from '../components/DefenseSchedule';
import ReviewSubmission from '../components/ReviewSubmission';
import StudentList from '../components/StudentList';
import TeacherNotification from '../components/TeacherNotification';
import CommentDocs from '../components/CommentDocs';
import TeacherNavbar from '../Navbar/TeacherNavbar';
import TeacherTopbar from '../Topbar/TeacherTopbar';

const TeacherDashboard = () => {
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
    const [feedbackForm, setFeedbackForm] = useState({ thesisId: '', comment: '', status: '', teacherName: '', teacherEmail: '' });

    useEffect(() => {
        // Prevent going back
        window.history.pushState(null, null, window.location.pathname);
        window.addEventListener('popstate', preventGoBack);

        // Clean up the event listener
        return () => {
            window.removeEventListener('popstate', preventGoBack);
        };
    }, []);

    // Prevent tab/browser closing
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const preventGoBack = (event) => {
        window.history.pushState(null, null, window.location.pathname);
    };

    useEffect(() => {
        const data = localStorage.getItem('user-info');
        if (!data) {
            navigate('/login', { replace: true });
            return;
        }
        const userData = JSON.parse(data);
        if (userData?.role !== 'teacher') {
            navigate('/login', { replace: true });
            return;
        }
        setUserInfo(userData);
        
        if (location.pathname === '/teacher-dashboard') {
            navigate('/teacher-dashboard/dashboard', { replace: true });
        }
    }, [navigate, location]);

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
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/', { replace: true });
        }
    };

    const handleSectionChange = (section) => {
        setActiveSection(section);
        navigate(`/teacher-dashboard/${section}`);
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

    const handleFeedbackSubmit = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/thesis/feedback/${feedbackForm.thesisId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackForm),
            });
            const data = await response.json();
            if (data.status === 'success') {
                // Optionally, refresh submissions or show a success message
                fetchSubmissions();
                setFeedbackForm({ thesisId: '', comment: '', status: '', teacherName: '', teacherEmail: '' }); // Reset form
            } else {
                console.error('Feedback submission failed:', data.message);
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    const renderFeedbackForm = () => {
        const modalStyles = {
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#ffffff',
        };

        const dialogStyles = {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
        };

        const headerStyles = {
            backgroundColor: '#f8f9fa',
            borderBottom: 'none',
            padding: '20px',
        };

        const titleStyles = {
            fontWeight: 'bold',
            fontSize: '1.5rem',
        };

        const textareaStyles = {
            borderRadius: '5px',
            border: '1px solid #ced4da',
            padding: '10px',
            fontSize: '1rem',
            resize: 'none',
            width: '100%',
        };

        const selectStyles = {
            borderRadius: '5px',
            border: '1px solid #ced4da',
            padding: '10px',
            fontSize: '1rem',
            width: '100%',
            marginTop: '1rem',
        };

        const footerStyles = {
            borderTop: 'none',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
        };

        const buttonPrimaryStyles = {
            backgroundColor: '#007bff',
            borderColor: '#007bff',
            transition: 'background-color 0.3s ease',
        };

        return (
            <div className="modal fade" id="feedbackModal" tabIndex="-1" aria-labelledby="feedbackModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg" style={dialogStyles}>
                    <div className="modal-content" style={modalStyles}>
                        <div className="modal-header" style={headerStyles}>
                            <h5 className="modal-title" id="feedbackModalLabel" style={titleStyles}>Add Feedback</h5>
                        </div>
                        <div className="modal-body">
                            <textarea
                                className="form-control"
                                style={textareaStyles}
                                value={feedbackForm.comment}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                                placeholder="Enter your feedback"
                            />
                            <select
                                className="form-select"
                                style={selectStyles}
                                value={feedbackForm.status}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, status: e.target.value })}
                            >
                                <option value="">Select Status</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="revision">Revision</option>
                            </select>
                        </div>
                        <div className="modal-footer" style={footerStyles}>
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" style={buttonPrimaryStyles} onClick={handleFeedbackSubmit}>Submit Feedback</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch(activeSection) {
            case 'profile':
                return <TeacherProfile userInfo={userInfo} />;
            case 'eventmaker':
                return <Calendar />;
            case 'defenseschedule':
                return <DefenseSchedule />;
            case 'review-submissions':
                return <ReviewSubmission />;
            case 'student-list':
                return <StudentList />;
            case 'comment-docs':
                return <CommentDocs />;
            case 'dashboard':
            default:
                return (
                    <>
                        <div className="container mt-0 p-1 py-3">
                            <header className="d-flex justify-content-between align-items-center border rounded p-5 shadow-sm">
                                <div className="user-info">
                                    <h1 className="h4">Welcome, {userInfo?.name}</h1>
                                    <p className="mb-0">Teacher ID: {userInfo?.teacherId || 'N/A'}</p>
                                </div>
                                <div className="profile-picture-container rounded-circle overflow-hidden" style={{ width: '80px', height: '80px' }}>
                                    <img
                                        className="img-fluid"
                                        src={userInfo?.image || '/default-avatar.png'}
                                        alt={userInfo?.name || 'User Avatar'}
                                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                    />
                                </div>
                            </header>
                        </div>

                        <section className="row g-3">
                            <div className="col-md-4">
                                <div className="card text-center shadow-sm" style={{ height: '100%' }}>
                                    <div className="card-body">
                                        <h5 className="card-title text-muted">Pending Reviews</h5>
                                        <p className="display-6 fw-bold text-primary">
                                            {submissions.filter(sub => sub.status === 'pending').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card text-center shadow-sm" style={{ height: '100%' }}>
                                    <div className="card-body">
                                        <h5 className="card-title text-muted">Students Assigned</h5>
                                        <p className="display-6 fw-bold text-primary">
                                            {submissions.length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card text-center shadow-sm" style={{ height: '100%' }}>
                                    <div className="card-body">
                                        <h5 className="card-title text-muted">Upcoming Defenses</h5>
                                        <p className="display-6 fw-bold text-primary">3</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="submissions-section">
                            <h2>Recent Submissions to Review</h2>
                            {loading ? (
                                <div className="loading-spinner">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
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
                                        {submissions.filter(sub => sub.status === 'pending').length === 0 ? (
                                            <tr>
                                                <td colSpan="6" style={{textAlign: 'center'}}>
                                                    No pending submissions to review
                                                </td>
                                            </tr>
                                        ) : (
                                            submissions
                                                .filter(sub => sub.status === 'pending')
                                                .map((submission) => (
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
                                                            <div className="action-buttons" style={{ display: 'flex', gap: '5px' }}>
                                                                <a 
                                                                    href={submission.docsLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn btn-primary"
                                                                >
                                                                    View
                                                                </a>
                                                                <button 
                                                                    className="btn btn-success"
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#feedbackModal"
                                                                    onClick={() => setFeedbackForm({ ...feedbackForm, thesisId: submission._id })}
                                                                >
                                                                    Feedback
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>                                                ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </section>
                        {feedbackForm.thesisId && renderFeedbackForm()}
                    </>
                );
        }
    };

    return (
        <div className="d-flex">
            <TeacherTopbar 
                userInfo={userInfo}
                unreadCount={unreadCount}
                handleLogout={handleLogout}
            />
            <TeacherNavbar 
                activeSection={activeSection} 
                handleSectionChange={handleSectionChange} 
            />
            
            {/* Main Content */}
            <div style={{marginLeft: '250px'}} className="flex-grow-1 p-4">
                <Routes>
                    <Route path="/dashboard" element={renderContent()} />
                    <Route path="/profile" element={<TeacherProfile userInfo={userInfo} />} />
                    <Route path="/defenseschedule" element={<DefenseSchedule />} />
                    <Route path="/review-submissions" element={<ReviewSubmission />} />
                    <Route path="/comment-docs" element={<CommentDocs />} />
                    <Route path="/docs" element={<Docs />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/send-gmail" element={<SendGmail />} />
                    <Route path="/schedule" element={<ScheduleTable />} />
                    <Route path="*" element={<Navigate to="/teacher-dashboard/dashboard" replace />} />
                </Routes>
            </div>
        </div>
    );
};

export default TeacherDashboard;
