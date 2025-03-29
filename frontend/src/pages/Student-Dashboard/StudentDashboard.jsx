import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import StudentProfile from "../../Profile/Student-Profile/StudentProfile";
import SubmitThesis from "../../components/Submit-Thesis/SubmitThesis";
import Docs from "../../components/Docs";
import StudentTopbar from "../../Topbar/Student-Topbar/StudentTopbar";
import StudentNavbar from "../../Navbar/Student-Navbar/StudentNavbar";
import { Container, Row, Col, Card, Alert, Button, Spinner } from "react-bootstrap";
import "./StudentDashboard.css";

const StudentDashboard = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [topicFilter, setTopicFilter] = useState("All Topics");

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const data = localStorage.getItem("user-info");
        if (!data) {
            navigate("/login");
            return;
        }
        const userData = JSON.parse(data);
        if (userData?.role !== "student" || !userData.token) {
            navigate("/login");
            return;
        }
        setUserInfo(userData);
        if (location.pathname === "/student-dashboard") {
            navigate("/student-dashboard/dashboard");
        }
    }, [navigate, location]);

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            setError(null);
            try {
                const userInfo = JSON.parse(localStorage.getItem("user-info"));
                if (!userInfo?.email) throw new Error("User info not found");

                const response = await fetch(`http://localhost:8080/api/thesis/student-submissions/${encodeURIComponent(userInfo.email)}`);
                if (!response.ok) throw new Error("Failed to fetch submissions");

                const data = await response.json();
                if (data.status === "success") setSubmissions(data.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, []);

    const filteredSubmissions = submissions.filter(({ title, createdAt }) => {
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesYear = yearFilter ? new Date(createdAt).getFullYear().toString() === yearFilter : true;
        const matchesTopic = topicFilter === "All Topics" || title.toLowerCase().includes(topicFilter.toLowerCase());
        return matchesSearch && matchesYear && matchesTopic;
    });

    const renderDashboard = () => (
        <Container fluid className="capstone-container px-4">
            <h2 className="dashboard-title text-center mb-4">Capstone Archive</h2>
            {loading ? (
                <div className="text-center"><Spinner animation="border" /></div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : filteredSubmissions.length === 0 ? (
                <Alert variant="info">No submissions found</Alert>
            ) : (
                <Row className="g-4">
                    {filteredSubmissions.map(({ _id, title, members, adviserEmail, createdAt, status, docsLink }) => (
                        <Col xs={12} sm={6} md={4} lg={3} key={_id}>
                            <Card className="capstone-card shadow-sm border-0 d-flex flex-column">
                                <Card.Body className="d-flex flex-column">
                                    <div className="submission-header d-flex justify-content-between align-items-center">
                                        <Card.Title className="submission-title text-truncate" title={title}>{title}</Card.Title>
                                        <span className={`badge bg-${status === "approved" ? "success" : "warning"}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                                    </div>
                                    <Card.Text className="submission-members text-truncate"><strong>Members:</strong> {members.join(", ")}</Card.Text>
                                    <Card.Text className="text-truncate"><strong>Adviser:</strong> {adviserEmail}</Card.Text>
                                    <Card.Text><strong>Submitted on:</strong> {new Date(createdAt).toLocaleDateString()}</Card.Text>
                                    <div className="mt-auto btn-container">
                                        <Button variant="secondary" size="sm" onClick={() => alert("View Details clicked!")}>View Details</Button>
                                        <a href={docsLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">View Document</a>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );

    return (
        <div className={`dashboard-wrapper ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
            <StudentTopbar 
                userInfo={userInfo} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                yearFilter={yearFilter} 
                setYearFilter={setYearFilter} 
                topicFilter={topicFilter} 
                setTopicFilter={setTopicFilter} 
            />
            <div className="d-flex">
                <StudentNavbar isSidebarOpen={isSidebarOpen} />
                <div className="dashboard-content">
                    <Routes>
                        <Route path="/dashboard" element={renderDashboard()} />
                        <Route path="/profile" element={<StudentProfile userInfo={userInfo} />} />
                        <Route path="/submit-thesis" element={<SubmitThesis />} />
                        <Route path="/docs" element={<Docs />} />
                        <Route path="*" element={<Navigate to="/student-dashboard/dashboard" replace />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;