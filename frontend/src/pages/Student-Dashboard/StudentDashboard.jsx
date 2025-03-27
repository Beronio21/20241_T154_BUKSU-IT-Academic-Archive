import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import StudentProfile from "../../Profile/StudentProfile";
import SubmitThesis from "../../components/SubmitThesis";
import Docs from "../../components/Docs";
import SendGmail from "../../Communication/SendGmail";
import Topbar from "../../Topbar/Student-Topbar/StudentTopbar";
import StudentNavbar from "../../Navbar/Student-Navbar/StudentNavbar";
import { Button, Container, Row, Col, Table, Alert, Dropdown, Modal } from "react-bootstrap";
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
          <div className="review-submission-container">
            <header className="review-header">
              <h2>Capstone Research Paper</h2>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search by title"
                  value={titleSearch}
                  onChange={(e) => setTitleSearch(e.target.value)}
                  className="form-control search-input"
                />
                <input
                  type="date"
                  value={dateSearch}
                  onChange={(e) => setDateSearch(e.target.value)}
                  className="form-control date-input"
                />
                <select
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="form-control"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
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
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(submission.status) }}
                        >
                          {submission.status}
                        </span>
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

            <Modal 
              show={showDetailsModal} 
              onHide={() => setShowDetailsModal(false)} 
              size="lg"
              className="thesis-details-modal"
            >
              <Modal.Header closeButton>
                <Modal.Title>Thesis Details</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {selectedThesis && (
                  <div className="thesis-details">
                    <div className="detail-section">
                      <h4>Title</h4>
                      <p>{selectedThesis.title}</p>
                    </div>
                    <div className="detail-section">
                      <h4>Status</h4>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(selectedThesis.status) }}
                      >
                        {selectedThesis.status}
                      </span>
                    </div>
                    <div className="detail-section">
                      <h4>Abstract</h4>
                      <p className="abstract-text">{selectedThesis.abstract}</p>
                    </div>
                    <div className="detail-section">
                      <h4>Keywords</h4>
                      <div className="keywords-list">
                        {selectedThesis.keywords.map((keyword, index) => (
                          <span key={index} className="keyword-tag">{keyword}</span>
                        ))}
                      </div>
                    </div>
                    <div className="detail-section">
                      <h4>Members</h4>
                      <ul className="members-list">
                        {selectedThesis.members.map((member, index) => (
                          <li key={index}>{member}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="detail-section">
                      <h4>Submission Information</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Student Email:</label>
                          <p>{selectedThesis.email}</p>
                        </div>
                        <div className="info-item">
                          <label>Submitted Date:</label>
                          <p>{new Date(selectedThesis.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="info-item">
                          <label>Document Link:</label>
                          <a 
                            href={selectedThesis.docsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="doc-link"
                          >
                            View Document
                          </a>
                        </div>
                      </div>
                    </div>
                    {selectedThesis.feedback && selectedThesis.feedback.length > 0 && (
                      <div className="detail-section">
                        <h4>Feedback History</h4>
                        <div className="feedback-list">
                          {selectedThesis.feedback.map((feedback, index) => (
                            <div key={index} className="feedback-item">
                              <div className="feedback-header">
                                <span className="feedback-status" style={{ backgroundColor: getStatusColor(feedback.status) }}>
                                  {feedback.status}
                                </span>
                                <span className="feedback-date">
                                  {new Date(feedback.dateSubmitted).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="feedback-comment">{feedback.comment}</p>
                              <div className="feedback-meta">
                                <span>By: {feedback.teacherName}</span>
                                <span>{feedback.teacherEmail}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                <button 
                  onClick={() => setShowDetailsModal(false)} 
                  className="btn-cancel"
                >
                  Close
                </button>
              </Modal.Footer>
            </Modal>
          </div>
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
      <Topbar userInfo={userInfo} />

      {/* Navbar */}
      <StudentNavbar activeSection={activeSection} handleSectionChange={setActiveSection} />

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ marginLeft: "250px", marginTop: "60px" }}>
        <Routes>
          <Route path="/dashboard" element={renderContent()} />
          <Route path="/profile" element={<StudentProfile userInfo={userInfo} />} />
          <Route path="/submit-thesis" element={<SubmitThesis />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/send-gmail" element={<SendGmail />} />
          <Route path="*" element={<Navigate to="/student-dashboard/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;