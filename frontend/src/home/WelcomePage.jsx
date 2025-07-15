import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import './WelcomePage.css';
import WelcomeDashboard from './WelcomeDashboard';

const WelcomePage = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [approvedCapstones, setApprovedCapstones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCapstone, setSelectedCapstone] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [navOpen, setNavOpen] = useState(false); // for mobile nav
  const [expandedAbstractId, setExpandedAbstractId] = useState(null);

  // Detect mobile
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches;

  // Fetch approved capstones
  useEffect(() => {
    const fetchApprovedCapstones = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/thesis/approved');
        if (response.data.status === 'success') {
          setApprovedCapstones(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching approved capstones:', error);
        setError('Failed to load research papers');
      } finally {
        setLoading(false);
      }
    };
    fetchApprovedCapstones();
  }, []);

  // Filter capstones
  const filteredCapstones = approvedCapstones.filter(capstone => {
    const search = searchTerm.toLowerCase();
    const matchesTitle = capstone.title.toLowerCase().includes(search);
    const matchesAuthor = capstone.members?.some(member => 
      member.toLowerCase().includes(search)
    );
    const matchesKeyword = capstone.keywords?.some(keyword =>
      keyword.toLowerCase().includes(search)
    );
    const matchesYear = !selectedYear || 
      new Date(capstone.createdAt).getFullYear() === parseInt(selectedYear);
    const matchesCategory = selectedCategory === "All" || 
      capstone.category === selectedCategory;
    return (matchesTitle || matchesAuthor || matchesKeyword) && matchesYear && matchesCategory;
  });

  // Generate year options
  const yearOptions = Array.from(
    new Set(approvedCapstones.map(capstone => 
      new Date(capstone.createdAt).getFullYear()
    ))
  ).sort((a, b) => b - a);

  // Extract unique categories from capstones and merge with predefined
  const predefinedCategories = ['AI', 'Web Development', 'IoT', 'ML', 'Sound', 'Camera'];
  const dynamicCategories = Array.from(new Set([
    ...predefinedCategories,
    ...approvedCapstones.map(capstone => capstone.category).filter(Boolean)
  ]));
  const categories = ["Categories", ...dynamicCategories];

  // Add this function to handle viewing details
  const handleViewDetails = (capstone) => {
    setSelectedCapstone(capstone);
    setShowDetailsModal(true);
  };

  return (
    <div className="welcome-page">
      <nav className="welcome-nav topbar-fullwidth">
        <div className="nav-container nav-header-refined topbar-flex" style={{paddingLeft: 0, paddingRight: 0}}>
          <div style={{flex: 1, display: 'flex', alignItems: 'center', minWidth: 0}}>
            <span className="nav-brand refined-brand topbar-brand-identity" style={{marginLeft: '0.8rem'}}>
              BukSu IT Capstone Archive
            </span>
          </div>
          <div className="topbar-actions" style={{flex: 1, justifyContent: 'flex-end', display: 'flex', alignItems: 'center', minWidth: 0}}>
            <button
              className="hamburger-menu"
              aria-label="Open navigation menu"
              aria-expanded={navOpen}
              onClick={() => setNavOpen((open) => !open)}
            >
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
            </button>
            <div className={`nav-actions refined-nav-actions topbar-navlinks${navOpen ? ' open' : ''}`}
              style={{marginRight: '0.8rem'}}>
             
              <button
                className="nav-login refined-login-btn"
                onClick={() => navigate("/login")}
                tabIndex={0}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="welcome-main">
        {showDashboard ? (
          <WelcomeDashboard />
        ) : (
          <div className="welcome-container">
            <div className="welcome-header">
              <h2>Capstone Archive</h2>
              <p>Explore approved research papers and capstone projects</p>
            </div>

            {/* Search and Filter */}
            <div className="search-filter-modern">
              <div className="search-bar-group">
                <span className="search-icon-inside">🔍</span>
                <input
                  type="text"
                  placeholder="Search by title, author, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-bar-modern"
                />
              </div>
              <div className="filter-dropdowns-group">
                <div className="custom-dropdown-modern">
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                    }}
                    className="dropdown-select-modern"
                  >
                    <option value="">Years</option>
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="custom-dropdown-modern">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                    }}
                    className="dropdown-select-modern"
                  >
                    <option value="All">Categories</option>
                    {dynamicCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Research Items */}
            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : error ? (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>
                  Retry
                </button>
              </div>
            ) : filteredCapstones.length === 0 ? (
              <div className="empty-state" style={{ minHeight: 320, width: '100%', maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 0 24px 0' }}>
                <div style={{ background: '#f8fafc', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '28px 24px', color: '#64748b', fontSize: '1.13rem', fontWeight: 500, boxShadow: '0 2px 8px rgba(30,41,59,0.04)', display: 'flex', alignItems: 'center', gap: 12, margin: '0 auto', minWidth: 320, maxWidth: 420, textAlign: 'center' }}>
                  <i className="fas fa-search" style={{ fontSize: 26, marginRight: 8, color: '#94a3b8' }}></i>
                  No research papers found
                </div>
              </div>
            ) : (
              <div className="research-grid">
                {filteredCapstones.map(capstone => (
                  <div 
                    className="capstone-card bg-white relative z-10 transition-transform duration-200 transform-gpu hover:shadow-lg hover:scale-105"
                    key={capstone._id} 
                    onClick={() => handleViewDetails(capstone)}
                    style={{  
                      borderRadius: '18px',
                      boxShadow: '0 6px 24px rgba(30,41,59,0.12)',
                      cursor: 'pointer',
                      minHeight: 520,
                      maxWidth: 370,
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      padding: '32px 28px 24px 28px',
                      position: 'relative',
                      boxSizing: 'border-box',
                      border: '1.5px solid #e5e7eb',
                      zIndex: 10,
                      height: 520,
                      transition: 'box-shadow 0.18s, transform 0.18s, border-color 0.18s',
                      background: '#fff',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 14px 36px rgba(30,41,59,0.16)'; e.currentTarget.style.transform = 'translateY(-3px) scale(1.012)'; e.currentTarget.style.borderColor = '#2563eb'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(30,41,59,0.12)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                  >
                    {/* Card Content: flex-col, justify-between for vertical alignment */}
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      {/* Title */}
                      <div style={{ marginBottom: 14 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#2563eb', letterSpacing: 0.1, display: 'block', marginBottom: 2 }}>Title:</span>
                        <div style={{ fontWeight: 800, fontSize: 17, color: '#1e293b', wordBreak: 'break-word', lineHeight: 1.25, maxWidth: '100%', whiteSpace: 'normal', overflow: 'visible', textOverflow: 'unset', display: 'block' }}>{capstone.title}</div>
                      </div>
                      {/* Abstract/Description */}
                      <div style={{ marginBottom: 14 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#2563eb', letterSpacing: 0.1, display: 'block', marginBottom: 2 }}>Abstract:</span>
                        <div style={{
                          color: '#334155',
                          fontSize: 15,
                          background: '#f3f4f6',
                          borderRadius: 10,
                          padding: '12px 16px',
                          minHeight: 40,
                          lineHeight: 1.7,
                          textAlign: 'justify',
                          maxWidth: '100%',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          position: 'relative',
                          marginBottom: 0,
                        }} title={capstone.abstract}>
                          {capstone.abstract}
                        </div>
                      </div>
                      {/* Keywords */}
                      {capstone.keywords && capstone.keywords.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: '#2563eb', letterSpacing: 0.1, display: 'block', marginBottom: 2 }}>Keywords:</span>
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
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
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                textAlign: 'center',
                                maxWidth: 90,
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
                      )}
                      {/* Spacer to push button and meta to bottom */}
                      <div style={{ flex: 1 }} />
                      {/* Action Button */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 0, marginBottom: 0 }}>
                        <button onClick={e => { e.stopPropagation(); handleViewDetails(capstone); }} style={{ background: '#f8fafc', color: '#2563eb', border: '1px solid #cbd5e1', borderRadius: 8, fontWeight: 500, fontSize: 15, padding: '7px 18px', cursor: 'pointer', transition: 'background 0.18s, border-color 0.18s, color 0.18s', letterSpacing: 0.1, outline: 'none', display: 'inline-block', minWidth: 0, minHeight: 0, boxShadow: 'none' }} onMouseEnter={e => { e.currentTarget.style.background = '#e0e7ff'; e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#174ea6'; }} onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#2563eb'; }} onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }} onMouseUp={e => { e.currentTarget.style.transform = 'none'; }}>View Details</button>
                      </div>
                      {/* Category & Date at Bottom */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid #e5e7eb', fontSize: '0.97rem', fontWeight: 600, gap: 12 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2563eb', borderRadius: 13, padding: '4px 14px', fontWeight: 700, fontSize: '0.97rem', letterSpacing: 0.1 }}>
                          {capstone.category}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontWeight: 600, fontSize: '0.97rem' }}>
                          {new Date(capstone.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Wider Details Modal */}
      {showDetailsModal && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content-wide" onClick={(e) => e.stopPropagation()} style={{ width: '95%', maxWidth: 1000, minWidth: 320, borderRadius: 18, padding: 0, background: '#fff', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: '1.5rem 2.5rem 1.1rem 2.5rem', background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)', color: '#fff', borderBottom: 'none' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.45rem', letterSpacing: 0.5, margin: 0, flex: 1, textAlign: 'left', textShadow: '0 2px 8px rgba(30,41,59,0.10)' }}>
                Capstone Details
              </h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowDetailsModal(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: 28, fontWeight: 'bold', cursor: 'pointer', padding: 0, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ padding: '2.2rem 1.2rem 2.2rem 1.2rem', fontSize: '1.08rem', color: '#334155', fontWeight: 500, borderRadius: 18, background: 'transparent', textAlign: 'left' }}>
              {selectedCapstone && (
                <div className="capstone-details" style={{ width: '100%', background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(30,41,59,0.04)', padding: '0 0', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {/* Title */}
                  <div style={{ marginBottom: 16, marginTop: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 22, color: '#1e293b', marginBottom: 2, lineHeight: 1.3 }}>{selectedCapstone.title}</div>
                  </div>
                  {/* Category & Date Row */}
                  <div style={{ display: 'flex', gap: 18, marginBottom: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, color: '#64748b', fontSize: 15 }}>Category:</span>
                      <span style={{ color: '#3730a3', background: '#e0e7ff', borderRadius: 12, padding: '2px 12px', fontWeight: 700, fontSize: 14, letterSpacing: 0.2 }}>{selectedCapstone.category}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, color: '#64748b', fontSize: 15 }}>Date:</span>
                      <span style={{ color: '#334155', fontWeight: 600, fontSize: 14 }}>{selectedCapstone.createdAt ? new Date(selectedCapstone.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                    </div>
                  </div>
                  {/* Abstract */}
                  <div style={{ marginBottom: 16, marginTop: 0 }}>
                    <div style={{ fontWeight: 600, color: '#2563eb', fontSize: 16, marginBottom: 6 }}>Abstract</div>
                    <div style={{
                      color: '#475569',
                      fontSize: 16,
                      whiteSpace: 'pre-line',
                      wordBreak: 'break-word',
                      background: '#f8fafc',
                      borderRadius: 10,
                      padding: '18px 14px',
                      lineHeight: 1.85,
                      boxShadow: '0 2px 8px rgba(30,41,59,0.04)',
                      textAlign: 'justify',
                      minHeight: 120,
                      maxHeight: 'none',
                      marginBottom: 0,
                      display: 'block',
                    }}>{selectedCapstone.abstract || 'No abstract provided.'}</div>
                  </div>
                  {/* Members */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, color: '#2563eb', fontSize: 16, marginBottom: 6 }}>Members</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {selectedCapstone.members && selectedCapstone.members.length > 0 ? selectedCapstone.members.map((member, i) => (
                        <span key={i} style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', borderRadius: 16, fontWeight: 600, fontSize: 14, padding: '6px 16px', marginBottom: 2 }}>{member}</span>
                      )) : <span style={{ color: '#64748b' }}>None</span>}
                    </div>
                  </div>
                  {/* Keywords */}
                  <div style={{ marginBottom: 0 }}>
                    <div style={{ fontWeight: 600, color: '#2563eb', fontSize: 16, marginBottom: 6 }}>Keywords</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {selectedCapstone.keywords && selectedCapstone.keywords.length > 0 ? selectedCapstone.keywords.map((keyword, i) => (
                        <span key={i} style={{ display: 'inline-block', background: '#e2e8f0', color: '#334155', borderRadius: 16, fontWeight: 600, fontSize: 14, padding: '6px 16px', marginBottom: 2 }}>#{keyword}</span>
                      )) : <span style={{ color: '#64748b' }}>None</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '1.2rem 2.5rem', borderBottomLeftRadius: 18, borderBottomRightRadius: 18, background: 'transparent' }}>
              <button 
                className="btn-close-modal"
                onClick={() => setShowDetailsModal(false)}
                style={{ background: '#f8fafc', color: '#2563eb', border: '1px solid #cbd5e1', borderRadius: 8, fontWeight: 500, fontSize: 15, padding: '7px 18px', cursor: 'pointer', transition: 'background 0.18s, border-color 0.18s, color 0.18s', letterSpacing: 0.1, outline: 'none', display: 'inline-block', minWidth: 0, minHeight: 0, boxShadow: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e0e7ff'; e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#174ea6'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#2563eb'; }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'none'; }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="welcome-footer">
        <p>© {new Date().getFullYear()} BUKSU IT Capstone Archive</p>
      </footer>
    </div>
  );
};

export default WelcomePage;