import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Container, Row, Col, Alert, Card, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import "./StudentDashboard.css";

import StudentProfile from "../../Profile/Student-Profile/StudentProfile";
import SubmitThesis from "../../components/Submit-Thesis/SubmitThesis";
import StudentNavbar from "../../Navbar/Student-Navbar/StudentNavbar";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [userInfo, setUserInfo] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [titleSearch, setTitleSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [yearSearch, setYearSearch] = useState("");

  const categories = ["IoT", "AI", "ML", "Sound", "Camera"];
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  // Fetch user info from localStorage and validate
  useEffect(() => {
    const data = localStorage.getItem("user-info");
    if (!data) return navigate("/login");
    
    const userData = JSON.parse(data);
    if (userData?.role !== "student" || !userData.token) return navigate("/login");
    
    setUserInfo(userData);
    if (location.pathname === "/student-dashboard") navigate("/student-dashboard/dashboard");
  }, [navigate, location]);

  // Fetch submissions from API
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const userInfo = JSON.parse(localStorage.getItem("user-info"));
      if (!userInfo || !userInfo.email) throw new Error("User info not found");
      
      const response = await axios.get(`http://localhost:8080/api/thesis/student-submissions/${userInfo.email}`);
      setSubmissions(response.data.data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter submissions based on search criteria
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesTitle = submission.title.toLowerCase().includes(titleSearch.toLowerCase());
    const matchesCategory = categorySearch ? submission.category === categorySearch : true;
    const matchesYear = yearSearch ? new Date(submission.createdAt).getFullYear().toString() === yearSearch : true;
    return matchesTitle && matchesCategory && matchesYear;
  });

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
            <Row className="mb-4 pb-3">
              <Col>
                <h2>Capstone Research Paper</h2>
                {/* Search bar */}
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

                {/* Year and Category dropdowns */}
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
              </Col>
            </Row>

            {/* Show loading spinner while fetching data */}
            {loading ? (
              <div className="loading-container text-center">
                <Spinner animation="border" variant="primary" />
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
                          <Card.Text><strong>Status:</strong> {submission.status}</Card.Text>
                          <Card.Text><strong>Abstract:</strong> {submission.abstract}</Card.Text>
                          <Card.Text><strong>Keywords:</strong> {submission.keywords.join(', ')}</Card.Text>
                          <Card.Text><strong>Members:</strong> {submission.members.join(', ')}</Card.Text>
                          <Card.Text><strong>Submitted:</strong> {new Date(submission.createdAt).toLocaleDateString()}</Card.Text>
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

  return (
    <div className="d-flex flex-column" style={{ height: "100vh" }}>
      <StudentNavbar activeSection={activeSection} handleSectionChange={setActiveSection} />
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
