import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import StudentProfile from "../../Profile/StudentProfile";
import SubmitThesis from "../../components/SubmitThesis";
import Docs from "../../components/Docs";
import Calendar from "../../components/Calendar";
import SendGmail from "../../Communication/SendGmail";
import ScheduleTable from "../../components/ScheduleTable";
import Topbar from "../../Topbar/Student-Topbar/StudentTopbar";
import StudentNavbar from "../../Navbar/Student-Navbar/StudentNavbar";
import { Button, Container, Row, Col, Table, Alert, Dropdown, Modal } from "react-bootstrap";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [userInfo, setUserInfo] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ comment: "", status: "pending" });
  const navigate = useNavigate();
  const location = useLocation();

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

      const response = await fetch(
        `http://localhost:8080/api/thesis/student-submissions/${encodeURIComponent(userInfo.email)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch submissions");
      }

      const data = await response.json();
      if (data.status === "success") {
        setSubmissions(data.data);
      }
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
    const matchesSearchTerm =
      submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.members.some((member) =>
        member.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "All" || submission.status === statusFilter;

    return matchesSearchTerm && matchesStatus;
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
          <Route path="/schedule" element={<ScheduleTable />} />
          <Route path="*" element={<Navigate to="/student-dashboard/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;