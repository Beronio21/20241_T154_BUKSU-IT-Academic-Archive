import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import TeacherProfile from '../../Profile/Teacher-Profile/TeacherProfile';
import SubmitThesis from '../../components/Submit-Thesis/SubmitThesis';
import CommentDocs from '../../components/CommentDocs';
import ReviewSubmission from '../../components/Review-Submissions/ReviewSubmission';
import StudentList from '../../components/StudentList';
import TeacherNavbar from '../../Navbar/Teacher-Navbar/TeacherNavbar';
import TeacherTopbar from '../../Topbar/Teacher-Topbar/TeacherTopbar';
import { Container, Row, Col, Card, Alert, Spinner, Form } from 'react-bootstrap';
import axios from 'axios';

const TeacherDashboard = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [userInfo, setUserInfo] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [titleSearch, setTitleSearch] = useState("");
    const [categorySearch, setCategorySearch] = useState("");
    const [yearSearch, setYearSearch] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const categories = ["IoT", "AI", "ML", "Sound", "Camera"];
    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

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
        if (userInfo?.email) fetchSubmissions();
    }, [userInfo]);

    const fetchSubmissions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:8080/api/thesis/submissions');
            setSubmissions(response.data.data);
        } catch (error) {
            setError(error.response?.status === 404 ? "No submissions found." : 
                error.response?.status === 403 ? "Access denied. You do not have permission to view these submissions." : 
                "Error fetching submissions.");
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

    const filteredSubmissions = submissions.filter((submission) => {
        const matchesTitle = submission.title.toLowerCase().includes(titleSearch.toLowerCase());
        const matchesCategory = categorySearch ? submission.category === categorySearch : true;
        const matchesYear = yearSearch ? new Date(submission.createdAt).getFullYear().toString() === yearSearch : true;
        return matchesTitle && matchesCategory && matchesYear;
    });

    return (
        <div className="teacher-dashboard d-flex flex-column">
            <TeacherTopbar userInfo={userInfo} handleLogout={handleLogout} />
            <TeacherNavbar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="dashboard-content flex-grow-1 p-4 ms-auto" style={{ width: "85%" }}>
                <Routes>
                    <Route path="/dashboard" element={
                        <Container className="py-4">
                            <Row className="mb-4">
                                <Col><h2 className="text-center">Capstone Research Paper Submissions</h2></Col>
                            </Row>
                            <Row className="mb-3">
                                <Col>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by title"
                                        value={titleSearch}
                                        onChange={(e) => setTitleSearch(e.target.value)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Select
                                        value={yearSearch}
                                        onChange={(e) => setYearSearch(e.target.value)}
                                    >
                                        <option value="">All Years</option>
                                        {years.map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={6}>
                                    <Form.Select
                                        value={categorySearch}
                                        onChange={(e) => setCategorySearch(e.target.value)}
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                            </Row>
                            {loading ? (
                                <div className="d-flex justify-content-center my-5">
                                    <Spinner animation="border" variant="primary" />
                                </div>
                            ) : error ? (
                                <Alert variant="danger" className="text-center">{error}</Alert>
                            ) : filteredSubmissions.length === 0 ? (
                                <Alert variant="info" className="text-center">No submissions to review</Alert>
                            ) : (
                                <Row>
                                    {filteredSubmissions.map(submission => (
                                        <Col md={4} key={submission._id} className="mb-4">
                                            <Card className="shadow-sm border-light">
                                                <Card.Body>
                                                    <Card.Title className="text-primary">{submission.title}</Card.Title>
                                                    <Card.Text><strong>Status:</strong> {submission.status}</Card.Text>
                                                    <Card.Text><strong>Abstract:</strong> {submission.abstract}</Card.Text>
                                                    <Card.Text><strong>Keywords:</strong> {submission.keywords.join(', ')}</Card.Text>
                                                    <Card.Text><strong>Members:</strong> {submission.members.join(', ')}</Card.Text>
                                                    <Card.Text><strong>Submitted:</strong> {new Date(submission.createdAt).toLocaleDateString()}</Card.Text>
                                                    <a href={submission.docsLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary w-100">View Document</a>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </Container>
                    } />
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
