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
                <div className="card-container" style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '25px',
                  padding: '10px'
                }}>
                  {filteredCapstones.length === 0 ? (
                    <div className="no-results" style={{
                      textAlign: 'center',
                      padding: '40px',
                      gridColumn: '1 / -1',
                      background: '#f8f9fa',
                      borderRadius: '12px'
                    }}>
                      <i className="fas fa-search" style={{ fontSize: '2rem', color: '#6c757d', marginBottom: '15px' }}></i>
                      <p style={{ fontSize: '1.1rem', color: '#6c757d', margin: '0' }}>No research papers found</p>
                    </div>
                  ) : (
                    filteredCapstones.map((capstone) => (
                      <div 
                        className="capstone-card" 
                        key={capstone._id} 
                        onClick={() => handleViewDetails(capstone)}
                        style={{
                          background: '#ffffff',
                          borderRadius: '12px',
                          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.12)'
                          }
                        }}
                      >
                        <div style={{ padding: '20px' }}>
                          {/* Title Container */}
                          <div style={{
                            minHeight: '80px',
                            backgroundColor: '#e8f5e9',
                            borderRadius: '8px',
                            borderLeft: '4px solid #2e7d32',
                            padding: '12px 15px',
                            marginBottom: '15px',
                            transition: 'all 0.3s ease',
                          }}>
                            <h3 style={{
                              fontSize: '1.1rem',
                              margin: '0',
                              color: '#1a237e',
                              fontWeight: '600',
                              display: '-webkit-box',
                              WebkitLineClamp: '3',
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: '1.4',
                              wordWrap: 'break-word',
                              wordBreak: 'break-word'
                            }}>{capstone.title}</h3>
                          </div>

                          {/* Abstract */}
                          <div style={{ marginBottom: '20px' }}>
                            <p style={{
                              fontSize: '0.95rem',
                              color: '#555',
                              display: '-webkit-box',
                              WebkitLineClamp: '3',
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: '1.5',
                              margin: '0'
                            }}>
                              {capstone.abstract}
                            </p>
                          </div>

                          {/* Keywords */}
                          <div style={{ marginBottom: '20px' }}>
                            <div style={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: '8px' 
                            }}>
                              {capstone.keywords.map((keyword, index) => (
                                <span key={index} style={{
                                  backgroundColor: '#f0f4ff',
                                  color: '#3949ab',
                                  padding: '4px 10px',
                                  borderRadius: '15px',
                                  fontSize: '0.85rem',
                                  fontWeight: '500'
                                }}>
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Footer */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: 'auto',
                            paddingTop: '15px',
                            borderTop: '1px solid #eee'
                          }}>
                            <span style={{
                              fontSize: '0.9rem',
                              color: '#666'
                            }}>
                              {new Date(capstone.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <span style={{
                              backgroundColor: '#e3f2fd',
                              color: '#1565c0',
                              padding: '5px 12px',
                              borderRadius: '15px',
                              fontSize: '0.9rem',
                              fontWeight: '500'
                            }}>
                              {capstone.category}
                            </span>
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