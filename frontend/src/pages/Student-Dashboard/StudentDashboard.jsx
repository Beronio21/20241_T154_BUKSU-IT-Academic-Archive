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
import { FaSearch, FaChevronDown, FaRegCalendarAlt, FaTag } from 'react-icons/fa';

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [approvedCapstones, setApprovedCapstones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState(['IoT', 'AI', 'ML', 'Sound', 'Camera']);
  const [selectedYear, setSelectedYear] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect /student-dashboard to /student-dashboard/dashboard
  useEffect(() => {
    if (location.pathname === "/student-dashboard") {
      navigate("/student-dashboard/dashboard");
    }
  }, [navigate, location]);

  // Fetch public capstones
  useEffect(() => {
    const fetchCapstones = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the correct public endpoint for guest access
        const response = await fetch('http://localhost:8080/api/thesis/public/approved');
        if (!response.ok) throw new Error('Failed to fetch capstones');
        const data = await response.json();
        if (data.status === 'success' && Array.isArray(data.data)) {
          setApprovedCapstones(data.data);
        } else {
          setApprovedCapstones([]);
        }
      } catch (err) {
        setError('Failed to load capstones. Please try again later.');
        setApprovedCapstones([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCapstones();
  }, []);

  // Filter capstones based on search term, year, and category
  const filteredCapstones = approvedCapstones.filter(capstone => {
    const matchesTitle = capstone.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear ? new Date(capstone.createdAt).getFullYear() === selectedYear.value : true;
    const matchesCategory = selectedCategory ? capstone.category === selectedCategory : true;
    return matchesTitle && matchesYear && matchesCategory;
  });

  const handleViewDetails = (thesis) => {
    setSelectedThesis(thesis);
    setShowDetailsModal(true);
  };

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

  // User-friendly capstone details modal (from provided code)
  const renderDetailsModal = () => {
    return (
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
                    textAlign: 'justify',
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
    );
  };

  // Render the archive UI
  const renderArchive = () => (
    <div className="student-dashboard pt-0">
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" style={{ textAlign: 'center', margin: '2rem auto', maxWidth: 500 }}>{error}</div>
      ) : (
        <>
          {/* Dashboard Header */}
          <div className="dashboard-header mb-4" style={{
            background: 'linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%)',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 2px 15px rgba(0, 0, 0, 0.05)',
            marginLeft: '32px', // Subtle right shift for alignment
            maxWidth: 1200,
            width: 'calc(100% - 32px)',
            transition: 'margin-left 0.2s',
          }}>
            <h2 style={{ fontSize: '1.75rem', color: '#2c3e50', marginBottom: '15px', fontWeight: '600' }}>Research Archive</h2>
            <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '20px' }}>Explore approved research papers and capstone projects</p>
            {/* Search and Filter Bar */}
            <div className="search-filter" style={{
              background: '#fff',
              padding: '14px 25px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              marginBottom: 0,
              width: '100%',
              maxWidth: 1200,
              marginLeft: '0', // Align with header's margin
              marginRight: 'auto',
            }}>
              <div className="filter-row" style={{ display: 'flex', flexWrap: 'nowrap', gap: 14, alignItems: 'center', width: '100%', minWidth: 0 }}>
                <div style={{ flex: '1 1 auto', minWidth: 180, maxWidth: '100%', display: 'flex', alignItems: 'center', marginRight: 0 }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type="text"
                      placeholder="Search by title or author"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      style={{ width: '100%', height: 44, padding: '0 14px 0 38px', borderRadius: 10, border: '1.5px solid #e5e7eb', boxShadow: '0 1px 4px rgba(30,41,59,0.04)', fontSize: '1rem', color: '#334155', background: '#f8fafc', outline: 'none', transition: 'border 0.18s' }}
                    />
                    <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 18 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flex: '0 0 auto', gap: 8, alignItems: 'center', minWidth: 0 }}>
                  <div style={{ width: 160, minWidth: 120, maxWidth: 200, display: 'flex', alignItems: 'center' }}>
                    <Select
                      options={yearOptions}
                      value={selectedYear}
                      onChange={setSelectedYear}
                      placeholder={<span style={{ color: '#64748b' }}><FaRegCalendarAlt style={{ marginRight: 6, marginBottom: -2 }} />Select Year</span>}
                      isClearable
                      menuPortalTarget={typeof window !== 'undefined' ? window.document.body : null}
                      styles={{
                        container: base => ({ ...base, width: 160, minWidth: 160, maxWidth: 160 }),
                        control: (base, state) => ({ ...base, minHeight: 44, height: 44, borderRadius: 10, borderColor: state.isFocused ? '#2563eb' : '#e5e7eb', boxShadow: '0 1px 4px rgba(30,41,59,0.04)', background: '#f8fafc', fontSize: '1rem', paddingLeft: 2, outline: 'none', transition: 'border 0.18s', width: 160, minWidth: 160, maxWidth: 160 }),
                        valueContainer: base => ({ ...base, height: 44, padding: '0 8px' }),
                        input: base => ({ ...base, margin: 0, padding: 0 }),
                        indicatorsContainer: base => ({ ...base, height: 44 }),
                        placeholder: base => ({ ...base, color: '#64748b', fontWeight: 500 }),
                        dropdownIndicator: base => ({ ...base, color: '#64748b', paddingRight: 6 }),
                        menu: base => ({ ...base, width: 160, minWidth: 160, maxWidth: 160, zIndex: 9999 }),
                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                      }}
                      components={{ DropdownIndicator: props => <FaChevronDown style={{ color: '#64748b', fontSize: 16, marginRight: 2 }} /> }}
                    />
                  </div>
                  <div style={{ width: 160, minWidth: 120, maxWidth: 200, display: 'flex', alignItems: 'center' }}>
                    <Select
                      options={categoryOptions}
                      value={categoryOptions.find(opt => opt.value === selectedCategory) || categoryOptions[0]}
                      onChange={opt => setSelectedCategory(opt.value)}
                      placeholder={<span style={{ color: '#64748b' }}>All Categories <FaChevronDown style={{ marginLeft: 6, marginBottom: -2 }} /></span>}
                      isSearchable={false}
                      menuPortalTarget={typeof window !== 'undefined' ? window.document.body : null}
                      styles={{
                        container: base => ({ ...base, width: 160, minWidth: 160, maxWidth: 160 }),
                        control: (base, state) => ({ ...base, minHeight: 44, height: 44, borderRadius: 10, borderColor: state.isFocused ? '#2563eb' : '#e5e7eb', boxShadow: '0 1px 4px rgba(30,41,59,0.04)', background: '#f8fafc', fontSize: '1rem', paddingLeft: 2, outline: 'none', transition: 'border 0.18s', width: 160, minWidth: 160, maxWidth: 160 }),
                        valueContainer: base => ({ ...base, height: 44, padding: '0 8px' }),
                        input: base => ({ ...base, margin: 0, padding: 0 }),
                        indicatorsContainer: base => ({ ...base, height: 44 }),
                        placeholder: base => ({ ...base, color: '#64748b', fontWeight: 500 }),
                        dropdownIndicator: base => ({ ...base, color: '#64748b', paddingRight: 6 }),
                        menu: base => ({ ...base, width: 160, minWidth: 160, maxWidth: 160, zIndex: 9999 }),
                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                      }}
                      components={{ DropdownIndicator: props => <FaChevronDown style={{ color: '#64748b', fontSize: 16, marginRight: 2 }} /> }}
                    />
                  </div>
                </div>
              </div>
              <style>{`
                @media (max-width: 900px) {
                  .filter-row { flex-direction: column !important; gap: 10px !important; align-items: stretch !important; }
                  .filter-row > div { max-width: 100% !important; min-width: 0 !important; flex: 1 1 100% !important; justify-content: flex-start !important; }
                }
                @media (max-width: 600px) {
                  .search-filter { padding: 10px 4vw !important; }
                  .filter-row { gap: 7px !important; }
                }
              `}</style>
            </div>
          </div>
          {/* Results Section: maintain grid height, show message if empty */}
          <div className="results-section" style={{
            minHeight: '320px',
            width: 'calc(100% - 32px)',
            maxWidth: 1200,
            marginLeft: '50px',
            marginRight: 'auto',
            padding: '0 0 24px 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '38px',
            alignItems: 'stretch',
            justifyItems: 'center',
            position: 'relative',
            background: 'none',
            boxSizing: 'border-box',
          }}>
            {filteredCapstones.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                width: '100%',
                minHeight: '320px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                margin: 0,
                boxSizing: 'border-box',
              }}>
                <div style={{
                  background: '#f8fafc',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '28px 25px',
                  color: '#64748b',
                  fontSize: '1.13rem',
                  fontWeight: 500,
                  boxShadow: '0 2px 8px rgba(30,41,59,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  minWidth: 320,
                  maxWidth: 420,
                  textAlign: 'center',
                  margin: '0 auto',
                }}>
                  <i className="fas fa-search" style={{ fontSize: 26, marginRight: 8, color: '#94a3b8' }}></i>
                  No research papers found
                </div>
              </div>
            ) : (
              filteredCapstones.map((capstone) => (
                <div 
                  className="capstone-card bg-white relative z-10 transition-transform duration-200 transform-gpu hover:shadow-lg hover:scale-105"
                  key={capstone._id} 
                  onClick={() => handleViewDetails(capstone)}
                  style={{  
                    borderRadius: '18px',
                    boxShadow: '0 6px 24px rgba(30,41,59,0.12)',
                    cursor: 'pointer',
                    minHeight: 440,
                    maxWidth: 370,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '32px 28px 24px 28px',
                    position: 'relative',
                    boxSizing: 'border-box',
                    border: '1.5px solid #e5e7eb',
                    zIndex: 10,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 14px 36px rgba(30,41,59,0.16)'; e.currentTarget.style.transform = 'translateY(-3px) scale(1.012)'; e.currentTarget.style.borderColor = '#2563eb'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(30,41,59,0.12)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                >
                  {/* Card Content: flex-col, justify-between for vertical alignment */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    {/* Title */}
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#2563eb', letterSpacing: 0.1, display: 'block', marginBottom: 2 }}>Title:</span>
                      <div style={{ fontWeight: 800, fontSize: 20, color: '#1e293b', wordBreak: 'break-word', lineHeight: 1.25, maxWidth: '100%' }}>{capstone.title}</div>
                    </div>
                    {/* Abstract/Description */}
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#2563eb', letterSpacing: 0.1, display: 'block', marginBottom: 2 }}>Abstract:</span>
                      <div style={{ color: '#334155', fontSize: 15, background: '#f3f4f6', borderRadius: 10, padding: '12px 16px', minHeight: 40, lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', position: 'relative', maxWidth: '100%' }} title={capstone.abstract}>
                        {capstone.abstract}
                      </div>
                    </div>
                    {/* Keywords */}
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#2563eb', letterSpacing: 0.1, display: 'block', marginBottom: 2 }}>Keywords:</span>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                        gap: '8px',
                        maxHeight: 48,
                        overflow: 'hidden',
                        alignItems: 'center',
                        minHeight: 24,
                      }}>
                        {(capstone.keywords?.slice(0, 6) || []).map((keyword, idx) => (
                          <span key={idx} style={{
                            background: '#f3f4f6',
                            color: '#334155',
                            borderRadius: 12,
                            fontWeight: 600,
                            fontSize: 13,
                            padding: '4px 12px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'inline-block',
                            textAlign: 'center',
                          }}>{keyword}</span>
                        ))}
                        {capstone.keywords && capstone.keywords.length > 6 && (
                          <span style={{
                            background: '#f3f4f6',
                            color: '#64748b',
                            borderRadius: 12,
                            fontWeight: 600,
                            fontSize: 13,
                            padding: '4px 12px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'inline-block',
                            textAlign: 'center',
                          }}>{`+${capstone.keywords.length - 6} more`}</span>
                        )}
                      </div>
                    </div>
                    {/* Action Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 'auto', marginBottom: 0 }}>
                      <button onClick={e => { e.stopPropagation(); handleViewDetails(capstone); }} style={{ background: '#f8fafc', color: '#2563eb', border: '1px solid #cbd5e1', borderRadius: 8, fontWeight: 500, fontSize: 15, padding: '7px 18px', cursor: 'pointer', transition: 'background 0.18s, border-color 0.18s, color 0.18s', letterSpacing: 0.1, outline: 'none', display: 'inline-block', minWidth: 0, minHeight: 0, boxShadow: 'none' }} onMouseEnter={e => { e.currentTarget.style.background = '#e0e7ff'; e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#174ea6'; }} onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#2563eb'; }} onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }} onMouseUp={e => { e.currentTarget.style.transform = 'none'; }}>View Details</button>
                    </div>
                    {/* Category & Date at Bottom */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid #e5e7eb', fontSize: '0.97rem', fontWeight: 600, gap: 12 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2563eb', borderRadius: 13, padding: '4px 14px', fontWeight: 700, fontSize: '0.97rem', letterSpacing: 0.1 }}>
                        <FaTag style={{ marginRight: 4, fontSize: 15, color: '#2563eb' }} />
                        {capstone.category}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontWeight: 600, fontSize: '0.97rem' }}>
                        <FaRegCalendarAlt style={{ marginRight: 4, fontSize: 15, color: '#64748b' }} />
                        {new Date(capstone.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Render the details modal using the old custom modal design */}
          {renderDetailsModal()}
        </>
      )}
    </div>
  );

  // Render main content based on active section
  const renderContent = () => {
    if (activeSection === 'statistics') {
      return <Dashboard />;
    }
    return renderArchive();
  };

  return (
    <div className="d-flex flex-column" style={{ height: '100vh', backgroundColor: '#ffffff', overflow: 'hidden' }}>
      {/* Topbar/Header */}
      <Topbar />
      {/* Sidebar/Navbar */}
      <StudentNavbar activeSection={activeSection} handleSectionChange={setActiveSection} />
      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ marginLeft: '220px', marginTop: '60px', backgroundColor: '#ffffff', overflowY: 'auto', minHeight: 0 }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default StudentDashboard;