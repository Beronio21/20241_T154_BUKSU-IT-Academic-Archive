import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import TeacherProfile from '../../Profile/TeacherProfile';
import SubmitThesis from '../../components/SubmitThesis';
import CommentDocs from '../../components/CommentDocs';
import Calendar from '../../components/Calendar';
import SendGmail from '../../Communication/SendGmail';
import ScheduleTable from '../../components/ScheduleTable';
import DefenseSchedule from '../../components/DefenseSchedule';
import ReviewSubmission from '../../components/ReviewSubmission';
import StudentList from '../../components/StudentList';
import TeacherNotification from '../../components/TeacherNotification';
import TeacherNavbar from '../../Navbar/Teacher-Navbar/TeacherNavbar';
import TeacherTopbar from '../../Topbar/Teacher-Topbar/TeacherTopbar';
import { Modal } from 'react-bootstrap';

const TeacherDashboard = () => {

    const [activeSection, setActiveSection] = useState('dashboard');
    const [userInfo, setUserInfo] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [feedbackForm, setFeedbackForm] = useState({ comment: '', status: 'pending' });
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        const storedUserInfo = localStorage.getItem('user-info');
        if (!storedUserInfo) {
            navigate('/login', { replace: true });
            return;
        }
        const userData = JSON.parse(storedUserInfo);
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

    const handleAddFeedback = (submission) => {
        setShowModal(true);
        setFeedbackForm({ comment: '', status: 'pending' });
    };

    const handleSubmitFeedback = () => {
        // Implement the logic to submit feedback
        console.log('Feedback submitted:', feedbackForm);
        setShowModal(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return '#ffd700';
            case 'approved':
                return '#4caf50';
            case 'rejected':
                return '#f44336';
            case 'revision':
                return '#2196f3';
            default:
                return '#ccc';
        }
    };

    const filteredSubmissions = submissions.filter(submission => {
        const matchesTitle = submission.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = filterDate ? new Date(submission.createdAt).toLocaleDateString() === new Date(filterDate).toLocaleDateString() : true;
        return matchesTitle && matchesDate;
    });

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return <TeacherProfile userInfo={userInfo} />;
            case 'submit-thesis':
                return <SubmitThesis />;
            case 'comment-docs':
                return <CommentDocs />;
            case 'calendar':
                return <Calendar />;
            case 'send-gmail':
                return <SendGmail />;
            case 'schedule':
                return <ScheduleTable />;
            case 'defenseschedule':
                return <DefenseSchedule />;
            case 'review-submissions':
                return <ReviewSubmission />;
            case 'student-list':
                return <StudentList />;
            case 'dashboard':
            default:
                return (
                    <div className="review-submission-container">
                        <header className="review-header">
                            <h2>Capstone Research Paper</h2>
                            <div className="search-bar">
                                <input
                                    type="text"
                                    placeholder="Search by title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="form-control search-input"
                                />
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="form-control date-input"
                                />
                            </div>
                        </header>

                        {loading ? (
                            <div className="loading-container">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="error-message">
                                {error}
                            </div>
                        ) : (
                            <div className="submissions-grid">
                                {submissions.length === 0 ? (
                                    <div className="no-submissions">
                                        <i className="bi bi-inbox text-muted"></i>
                                        <p>No submissions to review</p>
                                    </div>
                                ) : (
                                    filteredSubmissions.map((submission) => (
                                        <div key={submission._id} className="submission-card">
                                            <div className="submission-header">
                                                <h3>{submission.title}</h3>
                                          
                                            </div>
                                            <div className="submission-content">
                                                <div className="info-group">
                                                    <label>Abstract:</label>
                                                    <p className="abstract-text">{submission.abstract}</p>
                                                </div>
                                                <div className="info-group">
                                                    <label>Keywords:</label>
                                                    <p className="keywords-list">{submission.keywords ? submission.keywords.join(', ') : 'No keywords available'}</p>
                                                </div>
                                                <div className="info-group">
                                                    <label>Members:</label>
                                                    <p>{submission.members ? submission.members.join(', ') : 'No members listed'}</p>
                                                </div>
                                                <div className="info-group">
                                                    <label>Student Email:</label>
                                                    <p>{submission.email || 'N/A'}</p>
                                                </div>
                                                <div className="info-group">
                                                    <label>Submitted:</label>
                                                    <p>{new Date(submission.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="submission-actions">
                                                <a 
                                                    href={submission.docsLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-view"
                                                >
                                                    <i className="bi bi-eye-fill me-2"></i>
                                                    View Document
                                                </a>
                                       
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        <Modal show={showModal} onHide={() => setShowModal(false)} className="feedback-modal">
                            <Modal.Header closeButton>
                                <Modal.Title>Submit Feedback</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <div className="feedback-form">
                                    <div className="form-group">
                                        <label>Your Feedback</label>
                                        <textarea
                                            value={feedbackForm.comment}
                                            onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                                            placeholder="Enter your feedback..."
                                            rows="4"
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            value={feedbackForm.status}
                                            onChange={(e) => setFeedbackForm({ ...feedbackForm, status: e.target.value })}
                                            className="form-control"
                                            required
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approve</option>
                                            <option value="rejected">Reject</option>
                                            <option value="revision">Needs Revision</option>
                                        </select>
                                    </div>
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <button 
                                    onClick={handleSubmitFeedback} 
                                    className="btn-submit" 
                                    disabled={!feedbackForm.comment.trim()}
                                >
                                    Submit Feedback
                                </button>
                                <button 
                                    onClick={() => setShowModal(false)} 
                                    className="btn-cancel"
                                >
                                    Cancel
                                </button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                );
        }
    };

    return (
        <div className="d-flex">
            <TeacherTopbar userInfo={userInfo} handleLogout={handleLogout} />
            <TeacherNavbar activeSection={activeSection} handleSectionChange={handleSectionChange} />
            <div className="flex-grow-1 p-4" style={{ marginLeft: '250px', marginTop: '60px' }}>
                <Routes>
                    <Route path="/dashboard" element={renderContent()} />
                    <Route path="/profile" element={<TeacherProfile userInfo={userInfo} />} />
                    <Route path="/submit-thesis" element={<SubmitThesis />} />
                    <Route path="/comment-docs" element={<CommentDocs />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/send-gmail" element={<SendGmail />} />
                    <Route path="/schedule" element={<ScheduleTable />} />
                    <Route path="/defenseschedule" element={<DefenseSchedule />} />
                    <Route path="/review-submissions" element={<ReviewSubmission />} />
                    <Route path="/student-list" element={<StudentList />} />
                    <Route path="*" element={<Navigate to="/teacher-dashboard/dashboard" replace />} />
                </Routes>
            </div>
        </div>
    );
};

export default TeacherDashboard;


