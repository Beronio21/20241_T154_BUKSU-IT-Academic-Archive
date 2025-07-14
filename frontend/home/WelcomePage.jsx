import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import './WelcomePage.css';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [approvedCapstones, setApprovedCapstones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCapstone, setSelectedCapstone] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
    const matchesTitle = capstone.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAuthor = capstone.members?.some(member => 
      member.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesYear = !selectedYear || 
      new Date(capstone.createdAt).getFullYear() === parseInt(selectedYear);
    const matchesCategory = selectedCategory === "All" || 
      capstone.category === selectedCategory;
    return (matchesTitle || matchesAuthor) && matchesYear && matchesCategory;
  });

  // Generate year options
  const yearOptions = Array.from(
    new Set(approvedCapstones.map(capstone => 
      new Date(capstone.createdAt).getFullYear()
    ))
  ).sort((a, b) => b - a);

  // Extract unique categories
  const categories = ["All", ...new Set(
    approvedCapstones.map(capstone => capstone.category).filter(Boolean)
  )];

  // Add this function to handle viewing details
  const handleViewDetails = (capstone) => {
    setSelectedCapstone(capstone);
    setShowDetailsModal(true);
  };

  return (
    <div className="welcome-page">
      {/* Navigation */}
      <nav className="welcome-nav">
        <div className="nav-container">
          <h1 className="nav-brand">BUKSU IT Archive</h1>
          <div className="nav-actions">
            <button 
              className="btn-outline" 
              onClick={() => navigate("/login")}
            >
              Login/Signup
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="welcome-main">
        <div className="welcome-container">
          <div className="welcome-header">
            <h2>Research Archive</h2>
            <p>Explore approved research papers and capstone projects</p>
          </div>

          {/* Search and Filter */}
          <div className="search-filter">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by title or author"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">Select Year</option>
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
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
            <div className="empty-state">
              <p>No research papers found</p>
              <small>Try adjusting your search or filters</small>
            </div>
          ) : (
            <div className="research-grid">
              {filteredCapstones.map(capstone => (
                <div key={capstone._id} className="research-card">
                  <div className="card-content">
                    <h3>{capstone.title}</h3>
                    <p className="card-meta">{capstone.category} • {new Date(capstone.createdAt).getFullYear()}</p>
                    <p className="card-abstract">{capstone.abstract}</p>
                    {capstone.members?.length > 0 && (
                      <div className="card-members">
                        {capstone.members.slice(0, 3).map((member, index) => (
                          <span key={index} className="member-tag">
                            {member}
                          </span>
                        ))}
                        {capstone.members.length > 3 && (
                          <span className="member-tag">
                            +{capstone.members.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="card-footer">
                    <button 
                      className="card-button"
                      onClick={() => handleViewDetails(capstone)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Wider Details Modal */}
      {showDetailsModal && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Research Details</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              {selectedCapstone && (
                <div className="capstone-details">
                  <h3>{selectedCapstone.title}</h3>
                  <div className="detail-row">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{selectedCapstone.category}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Year:</span>
                    <span className="detail-value">
                      {new Date(selectedCapstone.createdAt).getFullYear()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Abstract:</span>
                    <p className="detail-value">{selectedCapstone.abstract}</p>
                  </div>
                  {selectedCapstone.members?.length > 0 && (
                    <div className="detail-row">
                      <span className="detail-label">Members:</span>
                      <div className="members-list">
                        {selectedCapstone.members.map((member, index) => (
                          <span key={index} className="member-tag">
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedCapstone.keywords?.length > 0 && (
                    <div className="detail-row">
                      <span className="detail-label">Keywords:</span>
                      <div className="keywords-list">
                        {selectedCapstone.keywords.map((keyword, index) => (
                          <span key={index} className="keyword-tag">
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn-close-modal"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="welcome-footer">
        <p>© {new Date().getFullYear()} BUKSU IT Academic Archive</p>
      </footer>
    </div>
  );
};

export default WelcomePage;