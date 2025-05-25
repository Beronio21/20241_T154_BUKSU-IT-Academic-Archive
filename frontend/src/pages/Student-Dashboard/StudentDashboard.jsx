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
import axios from 'axios';
import Dashboard from './Dashboard';

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
  const [approvedCapstones, setApprovedCapstones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState(['IoT', 'AI', 'ML', 'Sound', 'Camera']);
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

      const response = await axios.get(`http://localhost:8080/api/thesis/student-submissions/${userInfo.email}`);
      setSubmissions(response.data.data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch approved capstones
  useEffect(() => {
    fetchApprovedCapstones();
  }, []);

  const fetchApprovedCapstones = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/thesis/approved'); // Fetch only approved capstones
      const data = await response.json();
      if (data.status === 'success') {
        setApprovedCapstones(data.data);
      }
    } catch (error) {
      console.error('Error fetching approved capstones:', error);
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

  // Filter capstones based on search term, date, and category
  const filteredCapstones = approvedCapstones.filter(capstone => {
    const matchesTitle = capstone.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = selectedDate ? new Date(capstone.createdAt).toLocaleDateString() === new Date(selectedDate).toLocaleDateString() : true;
    const matchesCategory = selectedCategory ? capstone.category === selectedCategory : true;

    return matchesTitle && matchesDate && matchesCategory;
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
      case "docs":
        return <Docs />;
      case "statistics":
        return <Dashboard />;
      case "dashboard":
      default:
        return (
          <div className="student-dashboard pt-0">
            {/* Search and Filter Section */}
                <div className="search-filter">
                  {/* Search Input (Full Width on Top) */}
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control mb-2"
                    style={{ width: "100%", minWidth: "250px" }}
                  />

                  {/* Year and Category (Bottom, Side by Side) */}
                  <div className="d-flex" style={{ gap: "10px" }}>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="form-control"
                      style={{ flex: "1 1 0", minWidth: "150px" }}
                    />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="form-control"
                      style={{ flex: "1 1 0", minWidth: "150px" }}
                    >
                      <option value="">Category</option>
                      {categories.length > 0 ? (
                        categories.map((category, index) => (
                          <option key={index} value={category}>{category}</option>
                        ))
                      ) : (
                        <option disabled>No Categories</option>
                      )}
                    </select>
                  </div>
                </div>


            {loading ? (
              <p>Loading approved capstones...</p>
            ) : (
              <div className="card-container p-4" style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
                padding: '20px'
              }}>
                {filteredCapstones.length === 0 ? (
                  <p>No approved capstones available</p>
                ) : (
                  filteredCapstones.map((capstone) => (
                    <div className="capstone-card" key={capstone._id} style={{
                      aspectRatio: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '20px',
                      backgroundColor: '#fff',
                      borderRadius: '10px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleViewDetails(capstone)}
                    >
                      <h3 style={{
                        fontSize: '1.1rem',
                        marginBottom: '10px',
                        display: '-webkit-box',
                        WebkitLineClamp: '2',
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: '1.3'
                      }}>{capstone.title}</h3>
                      
                      <div style={{ flex: 1, overflow: 'hidden', marginBottom: '10px' }}>
                        <p style={{
                          fontSize: '0.9rem',
                          color: '#666',
                          display: '-webkit-box',
                          WebkitLineClamp: '3',
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          margin: '0 0 10px 0'
                        }}>
                          <strong>Abstract:</strong> {capstone.abstract}
                        </p>
                        
                        <p style={{
                          fontSize: '0.9rem',
                          color: '#666',
                          display: '-webkit-box',
                          WebkitLineClamp: '2',
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          margin: '0 0 10px 0'
                        }}>
                          <strong>Keywords:</strong> {capstone.keywords.join(', ')}
                        </p>
                      </div>

                      <div style={{
                        marginTop: 'auto',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        fontSize: '0.8rem',
                        color: '#888'
                      }}>
                        <span>{new Date(capstone.createdAt).toLocaleDateString()}</span>
                        <span style={{
                          backgroundColor: '#e8f4ff',
                          color: '#0066cc',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>{capstone.category}</span>
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
              backdrop="static"
            >
              <Modal.Header className="border-0 pb-0" style={{
                background: 'linear-gradient(135deg, #0062cc 0%, #0044cc 100%)',
                color: 'white',
                padding: '20px 30px'
              }}>
                <Modal.Title style={{ width: '100%' }}>
                  <div className="d-flex flex-column">
                    <h4 className="mb-2" style={{ fontSize: '1.5rem', fontWeight: '600' }}>Thesis Details</h4>
                    <p className="mb-0" style={{ fontSize: '0.9rem', opacity: '0.9' }}>
                      Comprehensive overview of the research paper
                    </p>
                  </div>
                </Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ padding: '30px' }}>
                {selectedThesis && (
                  <div className="thesis-details">
                    <div className="detail-section mb-4">
                      <h4 className="text-primary mb-3" style={{ fontSize: '1.2rem', fontWeight: '600' }}>Title</h4>
                      <p className="p-3 bg-light rounded" style={{ fontSize: '1.1rem' }}>{selectedThesis.title}</p>
                    </div>
                    <div className="detail-section mb-4">
                      <h4 className="text-primary mb-3" style={{ fontSize: '1.2rem', fontWeight: '600' }}>Abstract</h4>
                      <p className="p-3 bg-light rounded" style={{ lineHeight: '1.6' }}>{selectedThesis.abstract}</p>
                    </div>
                    <div className="detail-section mb-4">
                      <h4 className="text-primary mb-3" style={{ fontSize: '1.2rem', fontWeight: '600' }}>Members</h4>
                      <div className="members-list p-3 bg-light rounded">
                        {selectedThesis.members.map((member, index) => (
                          <div key={index} className="member-item mb-2" style={{ fontSize: '1rem' }}>
                            • {member}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="detail-section mb-4">
                      <h4 className="text-primary mb-3" style={{ fontSize: '1.2rem', fontWeight: '600' }}>Submission Information</h4>
                      <div className="info-grid p-3 bg-light rounded">
                        <div className="info-item mb-3">
                          <label className="text-muted mb-1">Student Email:</label>
                          <p className="mb-0" style={{ fontSize: '1rem' }}>{selectedThesis.email}</p>
                        </div>
                        <div className="info-item mb-3">
                          <label className="text-muted mb-1">Submitted Date:</label>
                          <p className="mb-0" style={{ fontSize: '1rem' }}>{new Date(selectedThesis.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="info-item">
                          <label className="text-muted mb-1">Document Link:</label>
                          <a 
                            href={selectedThesis.docsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary mt-2"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark-text" viewBox="0 0 16 16">
                              <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
                              <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                            </svg>
                            View Document
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer className="border-0" style={{ padding: '20px 30px' }}>
                <button 
                  onClick={() => setShowDetailsModal(false)} 
                  className="btn btn-secondary"
                  style={{
                    padding: '10px 24px',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
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

  const handleSectionChange = (section) => {
    setActiveSection(section);
    navigate(`/student-dashboard/${section}`);
  };

  return (
    <div className="d-flex flex-column" style={{ 
      height: "100vh",
      backgroundColor: "#ffffff",
      overflow: "hidden"
    }}>
      {/* Topbar */}
      <Topbar userInfo={userInfo} />

      {/* Navbar */}
      <StudentNavbar activeSection={activeSection} handleSectionChange={handleSectionChange} />

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ 
        marginLeft: "250px", 
        marginTop: "60px",
        backgroundColor: "#ffffff",
        overflow: "auto"
      }}>
        <Routes>
          <Route path="/dashboard" element={renderContent()} />
          <Route path="/profile" element={<StudentProfile userInfo={userInfo} />} />
          <Route path="/submit-thesis" element={<SubmitThesis />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/send-gmail" element={<SendGmail />} />
          <Route path="/schedule" element={<ScheduleTable />} />
          <Route path="/statistics" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/student-dashboard/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;