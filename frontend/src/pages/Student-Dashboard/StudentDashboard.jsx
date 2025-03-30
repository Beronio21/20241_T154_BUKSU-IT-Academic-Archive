import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import StudentProfile from "../../Profile/Student-Profile/StudentProfile";
import SubmitThesis from "../../components/Submit-Thesis/SubmitThesis";
import Topbar from "../../Topbar/Student-Topbar/StudentTopbar";
import StudentNavbar from "../../Navbar/Student-Navbar/StudentNavbar";
import { Card, Container, Row, Col, Alert, Modal } from "react-bootstrap";
import "./StudentDashboard.css";
import axios from 'axios';

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [userInfo, setUserInfo] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [titleSearch, setTitleSearch] = useState('');
  const [dateSearch, setDateSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ comment: "", status: "pending" });
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const categories = ['IoT', 'AI', 'ML', 'Sound', 'Camera']; // Define your categories

  // Ensure user authentication
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

  // Fetch submissions
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const userInfo = JSON.parse(localStorage.getItem("user-info"));
      if (!userInfo || !userInfo.email) {
        throw new Error("User  info not found");
      }

      const response = await axios.get(`http://localhost:8080/api/thesis/student-submissions/${userInfo.email}`);
      setSubmissions(response.data.data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login", { replace: true });
    }
  };

  // Filter submissions based on search term and status
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesTitle = submission.title.toLowerCase().includes(titleSearch.toLowerCase());
    const matchesDate = dateSearch ? new Date(submission.createdAt).toLocaleDateString() === new Date(dateSearch).toLocaleDateString() : true;
    const matchesCategory = categorySearch ? submission.category === categorySearch : true;

    const matchesStatus =
      statusFilter === "All" || submission.status === statusFilter;

    return matchesTitle && matchesDate && matchesCategory && matchesStatus;
  });

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

  // Add this function before renderContent
  const handleViewDetails = (thesis) => {
    setSelectedThesis(thesis);
    setShowDetailsModal(true);
  };

  
  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <StudentProfile userInfo={userInfo} />;
        
        
        
        
      case "submit-thesis":
        return <SubmitThesis />;
      case "dashboard":
      default:
        return (
          <Container>

            <Row className="mb-4">
              <Col>
                <h2>Capstone Research Paper</h2>

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
                {filteredSubmissions.length === 0 ? (
                  <Col>
                    <Alert variant="info">No submissions to review</Alert>
                  </Col>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <Col md={4} key={submission._id} className="mb-4">
                      <Card className="submission-card">
                        <Card.Body>
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
                          <a href={submission.docsLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                            View Document
                          </a>
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

  const handleSubmitFeedback = async () => {
    try {
        // Implement the logic to submit feedback
        console.log('Feedback submitted:', feedbackForm);
        setShowModal(false);
        // Optionally, refresh the submissions list
        fetchSubmissions();
    } catch (error) {
        console.error('Error submitting feedback:', error);
    }
  };

  return (
    <div className="d-flex flex-column" style={{ height: "100vh" }}>
      {/* Topbar */}
      <Topbar
        userInfo={userInfo}
        titleSearch={titleSearch}
        setTitleSearch={setTitleSearch}
        dateSearch={dateSearch}
        setDateSearch={setDateSearch}
        categorySearch={categorySearch}
        setCategorySearch={setCategorySearch}
        categories={categories}
      />

      {/* Navbar */}
      <StudentNavbar activeSection={activeSection} handleSectionChange={setActiveSection} />

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ marginLeft: "250px", marginTop: "60px" }}>
        <Routes>
          <Route path="/dashboard" element={renderContent()} />
          <Route path="/profile" element={<StudentProfile userInfo={userInfo} />} />
          <Route path="/submit-thesis" element={<SubmitThesis />} />
          <Route path="*" element={<Navigate to="/student-dashboard/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;