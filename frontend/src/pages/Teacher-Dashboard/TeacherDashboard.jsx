import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import TeacherProfile from '../../Profile/Teacher-Profile/TeacherProfile';
import SubmitThesis from '../../components/Submit-Thesis/SubmitThesis';
import CommentDocs from '../../components/CommentDocs';
import SendGmail from '../../Communication/SendGmail';
import ReviewSubmission from '../../components/Review-Submissions/ReviewSubmission';
import StudentList from '../../components/StudentList';
import TeacherNavbar from '../../Navbar/Teacher-Navbar/TeacherNavbar';
import TeacherTopbar from '../../Topbar/Teacher-Topbar/TeacherTopbar';
import { Modal, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import './TeacherDashboard.css'; // Import your CSS file for custom styles

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
    const [titleSearch, setTitleSearch] = useState('');
    const [dateSearch, setDateSearch] = useState('');
    const [categorySearch, setCategorySearch] = useState('');
    
    const categories = ['IoT', 'AI', 'ML', 'Sound', 'Camera']; // Define your categories

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

    useEffect(() => {
        if (userInfo?.email) {
            fetchSubmissions();
        }
    }, [userInfo]);

    const fetchSubmissions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:8080/api/thesis/submissions`);
            setSubmissions(response.data.data);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setError("No submissions found.");
            } else {
                setError("An error occurred while fetching submissions.");
            }
            console.error("Error fetching submissions:", error);
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
        const matchesTitle = submission.title.toLowerCase().includes(titleSearch.toLowerCase());
        const matchesDate = dateSearch ? new Date(submission.createdAt).toLocaleDateString() === new Date(dateSearch).toLocaleDateString() : true;
        const matchesCategory = categorySearch ? submission.category === categorySearch : true;

        return matchesTitle && matchesDate && matchesCategory;
    });

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return <TeacherProfile userInfo={userInfo} />;
            case 'send-gmail':
                return <SendGmail />;
            case 'schedule':
                return <DefenseSchedule />;
            case 'review-submissions':
                return <ReviewSubmission />;
            case 'student-list':
                return <StudentList />;
            case 'dashboard':
            default:
                return (
                    <Container>
                        <Row className="mb-4">
                            <Col>
                                <h2>Capstone Research Paper Submissions</h2>
                            </Col>
                        </Row>
                        {loading ? (
                            <div className="loading-container">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <Alert variant="danger">{error}</Alert>
                        ) : (
                            <Row>
                                {submissions.length === 0 ? (
                                    <Col>
                                        <Alert variant="info">No submissions to review</Alert>
                                    </Col>
                                ) : (
                                    submissions.map((submission) => (
                                        <Col md={4} key={submission._id} className="mb-4">
                                            <Card className="submission-card h-100">
                                                <Card.Body className="d-flex flex-column">
                                                    <Card.Title>{submission.title}</Card.Title>
                                                    <Card.Text>
                                                        <strong>Status:</strong> 
                                                        <span style={{ color: getStatusColor(submission.status) }}>
                                                            {submission.status}
                                                        </span>
                                                    </Card.Text>
                                                    <Card.Text>
                                                        <strong>Abstract:</strong> {submission.abstract}
                                                    </Card.Text>
                                                    <Card.Text>
                                                        <strong>Keywords:</strong> {submission.keywords.join(', ')}
                                                    </Card.Text>
                                                    <Card.Text>
                                                        <strong>Members:</strong> {submission.members.join(', ')}
                                                    </Card.Text>
                                                    <Card.Text>
                                                        <strong>Submitted:</strong> {new Date(submission.createdAt).toLocaleDateString()}
                                                    </Card.Text>
                                                    <div className="mt-auto">
                                                        <a href={submission.docsLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-100">
                                                            View Document
                                                        </a>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))
                                )}
                            </Row>
                        )}
                    </Container>
                );
        }
    };

    return (
        <div className="d-flex flex-column" style={{ height: "100vh" }}>
            <TeacherTopbar userInfo={userInfo} handleLogout={handleLogout} />
            <TeacherNavbar activeSection={activeSection} handleSectionChange={handleSectionChange} />
            <div className="flex-grow-1 p-4">
                <Routes>
                    <Route path="/dashboard" element={renderContent()} />
                    <Route path="/profile" element={<TeacherProfile userInfo={userInfo} />} />
                    <Route path="/submit-thesis" element={<SubmitThesis />} />
                    <Route path="/comment-docs" element={<CommentDocs />} />
                    <Route path="/review-submissions" element={<ReviewSubmission />} />
                    <Route path="/student-list" element={<StudentList />} />
                    <Route path="*" element={<Navigate to="/teacher-dashboard/dashboard" replace />} />
                </Routes>
            </div>
        </div>
    );
};

export default TeacherDashboard;


