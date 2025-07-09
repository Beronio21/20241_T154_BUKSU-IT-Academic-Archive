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
import Select from 'react-select';
import { FaSearch, FaChevronDown, FaRegCalendarAlt } from 'react-icons/fa';

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
  const [selectedYear, setSelectedYear] = useState(null);
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

  // Generate year options (e.g., from 2015 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear - i;
    return { value: year, label: year.toString() };
  });
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(cat => ({ value: cat, label: cat }))
  ];

  // Filter capstones based on search term, date, and category
  const filteredCapstones = approvedCapstones.filter(capstone => {
    const matchesTitle = capstone.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear ? new Date(capstone.createdAt).getFullYear() === selectedYear.value : true;
    const matchesCategory = selectedCategory ? capstone.category === selectedCategory : true;

    return matchesTitle && matchesYear && matchesCategory;
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
                    background: '#fff',
                    padding: '16px 18px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    marginBottom: 0,
                    width: '100%',
                    maxWidth: 1200,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}>
                    <div
                      className="filter-row"
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 12,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      {/* Search Bar */}
                      <div style={{ flex: '1 1 60%', minWidth: 200, maxWidth: '60%' }}>
                        <div style={{ position: 'relative', width: '100%' }}>
                          <input
                            type="text"
                            placeholder="Search for research papers..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                              width: '100%',
                              height: 36,
                              padding: '0 14px 0 38px',
                              borderRadius: 8,
                              border: '1.2px solid #e5e7eb',
                              boxShadow: '0 1px 4px rgba(30,41,59,0.04)',
                              fontSize: '1rem',
                              color: '#334155',
                              background: '#f8fafc',
                              outline: 'none',
                              transition: 'border 0.18s',
                            }}
                          />
                          <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 16 }} />
                        </div>
                      </div>
                      {/* Year Selector */}
                      <div style={{ flex: '0 1 180px', minWidth: 120, maxWidth: 180 }}>
                        <Select
                          options={yearOptions}
                          value={selectedYear}
                          onChange={setSelectedYear}
                          placeholder={<span style={{ color: '#64748b' }}><FaRegCalendarAlt style={{ marginRight: 6, marginBottom: -2 }} />Select Year</span>}
                          isClearable
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              minHeight: 36,
                              height: 36,
                              borderRadius: 8,
                              borderColor: state.isFocused ? '#2563eb' : '#e5e7eb',
                              boxShadow: '0 1px 4px rgba(30,41,59,0.04)',
                              background: '#f8fafc',
                              fontSize: '1rem',
                              paddingLeft: 2,
                              outline: 'none',
                              transition: 'border 0.18s',
                            }),
                            valueContainer: base => ({ ...base, height: 36, padding: '0 8px' }),
                            input: base => ({ ...base, margin: 0, padding: 0 }),
                            indicatorsContainer: base => ({ ...base, height: 36 }),
                            placeholder: base => ({ ...base, color: '#64748b', fontWeight: 500 }),
                            dropdownIndicator: base => ({ ...base, color: '#64748b', paddingRight: 6 }),
                          }}
                          components={{ DropdownIndicator: props => <FaChevronDown style={{ color: '#64748b', fontSize: 14, marginRight: 2 }} /> }}
                        />
                      </div>
                      {/* Category Dropdown */}
                      <div style={{ flex: '0 1 180px', minWidth: 120, maxWidth: 180 }}>
                        <Select
                          options={categoryOptions}
                          value={categoryOptions.find(opt => opt.value === selectedCategory) || categoryOptions[0]}
                          onChange={opt => setSelectedCategory(opt.value)}
                          placeholder={<span style={{ color: '#64748b' }}><FaChevronDown style={{ marginRight: 6, marginBottom: -2 }} />All Categories</span>}
                          isSearchable={false}
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              minHeight: 36,
                              height: 36,
                              borderRadius: 8,
                              borderColor: state.isFocused ? '#2563eb' : '#e5e7eb',
                              boxShadow: '0 1px 4px rgba(30,41,59,0.04)',
                              background: '#f8fafc',
                              fontSize: '1rem',
                              paddingLeft: 2,
                              outline: 'none',
                              transition: 'border 0.18s',
                            }),
                            valueContainer: base => ({ ...base, height: 36, padding: '0 8px' }),
                            input: base => ({ ...base, margin: 0, padding: 0 }),
                            indicatorsContainer: base => ({ ...base, height: 36 }),
                            placeholder: base => ({ ...base, color: '#64748b', fontWeight: 500 }),
                            dropdownIndicator: base => ({ ...base, color: '#64748b', paddingRight: 6 }),
                          }}
                          components={{ DropdownIndicator: props => <FaChevronDown style={{ color: '#64748b', fontSize: 14, marginRight: 2 }} /> }}
                        />
                      </div>
                    </div>
                    {/* Responsive: stack on small screens */}
                    <style>{`
                      @media (max-width: 900px) {
                        .filter-row { flex-direction: column !important; gap: 10px !important; align-items: stretch !important; }
                        .filter-row > div { max-width: 100% !important; min-width: 0 !important; flex: 1 1 100% !important; }
                      }
                    `}</style>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="card-container" style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '25px',
                  padding: '10px',
                  minHeight: 400, // Ensures consistent height
                  position: 'relative',
                  background: '#fff',
                }}>
                  {filteredCapstones.length === 0 ? (
                    <div className="no-results" style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      padding: '40px 20px',
                      minHeight: 320,
                      width: '100%',
                      gridColumn: '1 / -1',
                      color: '#6c757d',
                      background: '#f8f9fa',
                      borderRadius: '12px',
                      boxShadow: '0 1px 4px rgba(30,41,59,0.04)',
                    }}>
                      <i className="fas fa-search" style={{ fontSize: '2.2rem', color: '#b0b6be', marginBottom: '18px' }}></i>
                      <div style={{ fontSize: '1.13rem', color: '#6c757d', fontWeight: 500, marginBottom: 4 }}>
                        No research papers found.
                      </div>
                      <div style={{ fontSize: '1rem', color: '#8a94a6' }}>
                        Try adjusting your filters.
                      </div>
                    </div>
                  ) : (
                    filteredCapstones.map((capstone) => (
                      <div 
                        className="capstone-card" 
                        key={capstone._id} 
                        onClick={() => handleViewDetails(capstone)}
                        style={{
                          background: '#fff',
                          borderRadius: '16px',
                          boxShadow: '0 6px 24px rgba(30,41,59,0.12)',
                          transition: 'box-shadow 0.18s, transform 0.18s',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          minHeight: 320,
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          padding: '28px 26px 0 26px',
                          position: 'relative',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.boxShadow = '0 14px 36px rgba(30,41,59,0.16)';
                          e.currentTarget.style.transform = 'translateY(-3px) scale(1.012)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.boxShadow = '0 6px 24px rgba(30,41,59,0.12)';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        {/* Title */}
                        <div style={{ marginBottom: 12 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: '#2563eb', letterSpacing: 0.1, display: 'block', marginBottom: 2 }}>Title:</span>
                          <div style={{ fontWeight: 800, fontSize: 20, color: '#1e293b', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: 1.25 }}>{capstone.title}</div>
                        </div>
                        {/* Abstract */}
                        <div style={{ marginBottom: 14, position: 'relative' }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: '#2563eb', letterSpacing: 0.1, display: 'block', marginBottom: 2 }}>Abstract:</span>
                          <div style={{
                            color: '#334155',
                            fontSize: 15,
                            background: '#f3f4f6',
                            borderRadius: 10,
                            padding: '12px 16px',
                            minHeight: 40,
                            lineHeight: 1.7,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            position: 'relative',
                          }} title={capstone.abstract}>
                            {capstone.abstract}
                            {/* Read more icon (tooltip on hover) */}
                            {capstone.abstract && capstone.abstract.length > 120 && (
                              <span style={{ position: 'absolute', right: 12, top: 12, color: '#64748b', cursor: 'pointer' }} title="Read full abstract">
                                <i className="fas fa-ellipsis-h"></i>
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Keywords */}
                        <div style={{ marginBottom: 14 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: '#2563eb', letterSpacing: 0.1, display: 'block', marginBottom: 2 }}>Keywords:</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 2, alignItems: 'center' }}>
                            {(capstone.keywords.slice(0, 3)).map((keyword, index) => (
                              <span key={index} style={{
                                backgroundColor: '#e0e7ff',
                                color: '#3730a3',
                                padding: '4px 12px',
                                borderRadius: 12,
                                fontSize: 13,
                                fontWeight: 600,
                                letterSpacing: 0.1,
                                marginBottom: 2,
                                whiteSpace: 'nowrap',
                              }}>{keyword}</span>
                            ))}
                            {capstone.keywords.length > 3 && (
                              <span
                                style={{
                                  backgroundColor: '#e0e7ff',
                                  color: '#64748b',
                                  padding: '4px 12px',
                                  borderRadius: 12,
                                  fontSize: 13,
                                  fontWeight: 600,
                                  letterSpacing: 0.1,
                                  marginBottom: 2,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  position: 'relative',
                                }}
                                title={capstone.keywords.join(', ')}
                              >
                                + {capstone.keywords.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Footer: Category & Submission Date */}
                        <div style={{ flexGrow: 1 }} />
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          minHeight: 90,
                          marginTop: 16,
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1.5px solid #e5e7eb',
                            padding: '14px 0 0 0',
                            background: '#f8fafc',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              <span style={{ fontWeight: 600, fontSize: 13, color: '#64748b', marginRight: 2 }}>Category:</span>
                              <span style={{ background: '#e3f2fd', color: '#1565c0', borderRadius: 10, fontWeight: 700, fontSize: 13, padding: '4px 12px', letterSpacing: 0.2 }}>{capstone.category}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 600, fontSize: 13, color: '#64748b', marginRight: 2 }}>Submitted on:</span>
                              <span style={{ color: '#334155', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {new Date(capstone.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            marginTop: 10,
                            paddingBottom: 6,
                          }}>
                            <button
                              onClick={e => { e.stopPropagation(); handleViewDetails(capstone); }}
                              style={{
                                background: '#f8fafc',
                                color: '#2563eb',
                                border: '1px solid #cbd5e1',
                                borderRadius: 8,
                                fontWeight: 500,
                                fontSize: 14,
                                padding: '5px 14px',
                                cursor: 'pointer',
                                transition: 'background 0.18s, border-color 0.18s, color 0.18s',
                                letterSpacing: 0.1,
                                outline: 'none',
                                display: 'inline-block',
                                minWidth: 0,
                                minHeight: 0,
                                boxShadow: 'none',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#e0e7ff';
                                e.currentTarget.style.borderColor = '#2563eb';
                                e.currentTarget.style.color = '#174ea6';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                                e.currentTarget.style.color = '#2563eb';
                              }}
                              onMouseDown={e => {
                                e.currentTarget.style.transform = 'scale(0.97)';
                              }}
                              onMouseUp={e => {
                                e.currentTarget.style.transform = 'none';
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
                onClick={e => e.stopPropagation()}
                style={{ 
                  width: '95%',
                  maxWidth: 1000,
                  minWidth: 320,
                  boxShadow: '0 8px 32px rgba(30,41,59,0.18)',
                  borderRadius: 18,
                  padding: 0,
                  background: '#fff',
                  margin: '0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  className="custom-modal-header"
                  style={{
                    borderTopLeftRadius: 18,
                    borderTopRightRadius: 18,
                    padding: '1.5rem 2.5rem 1.1rem 2.5rem',
                    background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: 'none',
                  }}
                >
                  <h3 style={{ fontWeight: 800, fontSize: '1.45rem', letterSpacing: 0.5, margin: 0, flex: 1, textAlign: 'center', textShadow: '0 2px 8px rgba(30,41,59,0.10)' }}>
                    Capstone Details
                  </h3>
                </div>
                <div
                  className="custom-modal-body"
                  style={{
                    padding: '2.2rem 3.5rem 2.2rem 3.5rem',
                    fontSize: '1.08rem',
                    color: '#334155',
                    fontWeight: 500,
                    borderRadius: 18,
                    background: 'transparent',
                    textAlign: 'left',
                  }}
                >
                  {selectedThesis && (
                    <div className="thesis-details" style={{ width: '100%' }}>
                      {/* Title */}
                      <div style={{ marginBottom: 18 }}>
                        <div style={{ fontWeight: 700, fontSize: 22, color: '#1e293b', marginBottom: 2, lineHeight: 1.3 }}>{selectedThesis.title}</div>
                      </div>
                      {/* Category & Date Row */}
                      <div style={{ display: 'flex', gap: 18, marginBottom: 18, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600, color: '#64748b', fontSize: 15 }}>Category:</span>
                          <span style={{ color: '#3730a3', background: '#e0e7ff', borderRadius: 12, padding: '2px 12px', fontWeight: 700, fontSize: 14, letterSpacing: 0.2 }}>{selectedThesis.category}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600, color: '#64748b', fontSize: 15 }}>Date:</span>
                          <span style={{ color: '#334155', fontWeight: 600, fontSize: 14 }}>{selectedThesis.createdAt ? new Date(selectedThesis.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                        </div>
                      </div>
                      {/* Divider */}
                      <div style={{ borderBottom: '1.5px solid #e5e7eb', margin: '18px 0' }} />
                      {/* Abstract */}
                      <div style={{ marginBottom: 18 }}>
                        <div style={{ fontWeight: 600, color: '#2563eb', fontSize: 16, marginBottom: 6 }}>Abstract</div>
                        <div style={{
                          color: '#475569',
                          fontSize: 15,
                          whiteSpace: 'pre-line',
                          wordBreak: 'break-word',
                          background: '#f8fafc',
                          borderRadius: 8,
                          padding: '16px 18px',
                          lineHeight: 1.6,
                          boxShadow: '0 2px 8px rgba(30,41,59,0.04)',
                          textAlign: 'justify', // Justified alignment for clean edges
                        }}>{selectedThesis.abstract || 'No abstract provided.'}</div>
                      </div>
                      {/* Members */}
                      <div style={{ marginBottom: 18 }}>
                        <div style={{ fontWeight: 600, color: '#2563eb', fontSize: 16, marginBottom: 6 }}>Members</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {selectedThesis.members && selectedThesis.members.length > 0 ? selectedThesis.members.map((member, i) => (
                            <span key={i} style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', borderRadius: 16, fontWeight: 600, fontSize: 14, padding: '6px 16px', marginBottom: 2 }}>{member}</span>
                          )) : <span style={{ color: '#64748b' }}>None</span>}
                        </div>
                            </div>
                      {/* Keywords */}
                      <div style={{ marginBottom: 0 }}>
                        <div style={{ fontWeight: 600, color: '#2563eb', fontSize: 16, marginBottom: 6 }}>Keywords</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {selectedThesis.keywords && selectedThesis.keywords.length > 0 ? selectedThesis.keywords.map((keyword, i) => (
                            <span key={i} style={{ display: 'inline-block', background: '#e2e8f0', color: '#334155', borderRadius: 16, fontWeight: 600, fontSize: 14, padding: '6px 16px', marginBottom: 2 }}>#{keyword}</span>
                          )) : <span style={{ color: '#64748b' }}>None</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className="custom-modal-footer"
                  style={{
                    borderTop: 'none',
                    padding: '1.25rem 2.5rem',
                    borderBottomLeftRadius: 18,
                    borderBottomRightRadius: 18,
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 12,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowDetailsModal(false)}
                    style={{
                      minWidth: 120,
                      fontWeight: 700,
                      borderRadius: 8,
                      background: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 0',
                      fontSize: 17,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
                      transition: 'background 0.2s',
                    }}
                  >
                    Close
                  </button>
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
        overflowY: "auto",
        minHeight: 0,
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