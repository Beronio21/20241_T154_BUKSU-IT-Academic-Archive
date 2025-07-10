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
        return <Dashboard role="student" />;
      case "dashboard":
      default:
        return (
          <div className="student-dashboard pt-0">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Dashboard Header */}
                <div className="dashboard-header mb-4" style={{
                  background: 'linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%)',
                  borderRadius: '15px',
                  padding: '25px',
                  boxShadow: '0 2px 15px rgba(0, 0, 0, 0.05)'
                }}>
                  <h2 style={{ 
                    fontSize: '1.75rem', 
                    color: '#2c3e50',
                    marginBottom: '15px',
                    fontWeight: '600'
                  }}>Research Archive</h2>
                  <p style={{ 
                    color: '#666', 
                    fontSize: '1.1rem',
                    marginBottom: '20px' 
                  }}>Explore approved research papers and capstone projects</p>
                  
                  {/* Search and Filter Section with improved styling */}
                  <div className="search-filter" style={{
                    background: '#ffffff',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}>
                    <div className="row g-3">
                      <div className="col-12">
                        <div className="input-group">
                          <span className="input-group-text" style={{ background: '#f8f9fa' }}>
                            <i className="fas fa-search"></i>
                          </span>
                          <input
                            type="text"
                            placeholder="Search for research papers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control"
                            style={{ 
                              padding: '12px',
                              fontSize: '1rem',
                              border: '1px solid #dee2e6'
                            }}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="form-control"
                          style={{ padding: '12px' }}
                        />
                      </div>
                      <div className="col-md-6">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="form-control"
                          style={{ padding: '12px' }}
                        >
                          <option value="">All Categories</option>
                          {categories.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="card-container">
                  {filteredCapstones.length === 0 ? (
                    <div className="no-results">
                      <i className="fas fa-search"></i>
                      <p>No research papers found matching your criteria</p>
                      <small style={{ color: '#a0aec0', fontSize: '0.9rem' }}>
                        Try adjusting your search terms or filters
                      </small>
                    </div>
                  ) : (
                    filteredCapstones.map((capstone) => (
                      <div 
                        className="capstone-card" 
                        key={capstone._id} 
                        onClick={() => handleViewDetails(capstone)}
                      >
                        <div style={{ padding: '25px' }}>
                          {/* Title Container with enhanced styling */}
                          <div style={{
                            minHeight: '80px',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                            borderRadius: '12px',
                            padding: '15px 18px',
                            marginBottom: '20px',
                            borderLeft: '4px solid #667eea',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              position: 'absolute',
                              top: '0',
                              right: '0',
                              width: '60px',
                              height: '60px',
                              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                              borderRadius: '0 12px 0 60px'
                            }}></div>
                            <h3>{capstone.title}</h3>
                          </div>

                          {/* Abstract with better typography */}
                          <div style={{ marginBottom: '20px' }}>
                            <p style={{
                              fontSize: '0.95rem',
                              color: '#4a5568',
                              lineHeight: '1.6',
                              margin: '0',
                              display: '-webkit-box',
                              WebkitLineClamp: '3',
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {capstone.abstract}
                            </p>
                          </div>

                          {/* Keywords with enhanced styling */}
                          <div style={{ marginBottom: '20px' }}>
                            <div style={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: '8px' 
                            }}>
                              {capstone.keywords && capstone.keywords.length > 0 ? (
                                capstone.keywords.slice(0, 3).map((keyword, index) => (
                                  <span key={index} style={{
                                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                    color: '#667eea',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    border: '1px solid rgba(102, 126, 234, 0.2)'
                                  }}>
                                    {keyword}
                                  </span>
                                ))
                              ) : (
                                <span style={{
                                  backgroundColor: 'rgba(160, 174, 192, 0.1)',
                                  color: '#a0aec0',
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  fontSize: '0.8rem',
                                  fontWeight: '500'
                                }}>
                                  No keywords
                                </span>
                              )}
                              {capstone.keywords && capstone.keywords.length > 3 && (
                                <span style={{
                                  backgroundColor: 'rgba(160, 174, 192, 0.1)',
                                  color: '#a0aec0',
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  fontSize: '0.8rem',
                                  fontWeight: '500'
                                }}>
                                  +{capstone.keywords.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Enhanced Footer with better layout */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: 'auto',
                            paddingTop: '20px',
                            borderTop: '1px solid rgba(0, 0, 0, 0.05)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                fontSize: '0.85rem',
                                color: '#a0aec0',
                                fontWeight: '500'
                              }}>
                                📅 {new Date(capstone.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                color: '#667eea',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                border: '1px solid rgba(102, 126, 234, 0.2)'
                              }}>
                                {capstone.category || 'General'}
                              </span>
                            </div>
                          </div>

                          {/* View Details Button */}
                          <div style={{ 
                            marginTop: '15px',
                            textAlign: 'center'
                          }}>
                            <button 
                              className="btn"
                              style={{
                                width: '100%',
                                padding: '10px',
                                fontSize: '0.9rem'
                              }}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
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

            <div className={`custom-modal ${showDetailsModal ? 'show' : ''}`} onClick={() => setShowDetailsModal(false)}>
              <div 
                className="custom-modal-content" 
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  width: '80%',  // Adjust this value as needed (60%, 70%, 90%, etc.)
                  maxWidth: '1800px',  // Maximum width
                  minWidth: '300px'   // Minimum width
                }}
              >
                <div className="custom-modal-header">
                  <h3>Thesis Details</h3>
                  <button onClick={() => setShowDetailsModal(false)} className="close-button">
                    &times;
                  </button>
                </div>
                <div className="custom-modal-body">
                  {selectedThesis && (
                    <div className="thesis-details">
                      <div className="detail-section">
                        <h4>Title</h4>
                        <p>{selectedThesis.title}</p>
                      </div>
                      <div className="detail-section">
                        <h4>Abstract</h4>
                        <p>{selectedThesis.abstract}</p>
                      </div>
                      <div className="detail-section">
                        <h4>Members</h4>
                        <div className="members-list">
                          {selectedThesis.members.map((member, index) => (
                            <div key={index} className="member-item">
                              • {member}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
      minHeight: "100vh",
      backgroundColor: "#ffffff"
    }}>
      {/* Topbar */}
      <Topbar userInfo={userInfo} />

      {/* Navbar */}
      <StudentNavbar activeSection={activeSection} handleSectionChange={handleSectionChange} userInfo={userInfo} />

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ 
        marginLeft: "220px",
        marginTop: "60px",
        backgroundColor: "#ffffff",
        minHeight: "calc(100vh - 60px)",
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
          <Route path="/statistics" element={<Dashboard role="student" />} />
          <Route path="*" element={<Navigate to="/student-dashboard/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;