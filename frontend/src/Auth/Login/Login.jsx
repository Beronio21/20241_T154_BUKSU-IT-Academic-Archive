import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth, emailLogin } from "../../api";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "./Login.css";

import bukSULogo from '../../Images/logobuksu.jpg';
import GoogleLogo from '../../Images/GoogleLogo.png';

const GoogleLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [approvedCapstones, setApprovedCapstones] = useState([]);
    const [showProjects, setShowProjects] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState(['IoT', 'AI', 'ML', 'Sound', 'Camera', 'Web Development', 'Mobile App', 'Database', 'Network', 'Security']);
    const [selectedThesis, setSelectedThesis] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add("login-page");
        document.documentElement.classList.add("login-page");
        return () => {
            document.body.classList.remove("login-page");
            document.documentElement.classList.remove("login-page");
        };
    }, []);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("user-info"));
        if (userInfo && userInfo.googleDriveToken) {
            console.log("Google Drive is already connected.");
        }
    }, []);

    // Fetch approved capstones
    useEffect(() => {
        if (showProjects) {
            fetchApprovedCapstones();
        }
    }, [showProjects]);

    const fetchApprovedCapstones = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/thesis/approved');
            const data = await response.json();
            if (data.status === 'success') {
                setApprovedCapstones(data.data);
            }
        } catch (error) {
            console.error('Error fetching approved capstones:', error);
        }
    };

    // Filter capstones based on search term, date, and category
    const filteredCapstones = approvedCapstones.filter(capstone => {
        const matchesTitle = capstone.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDate = selectedDate ? new Date(capstone.createdAt).toLocaleDateString() === new Date(selectedDate).toLocaleDateString() : true;
        const matchesCategory = selectedCategory ? capstone.category === selectedCategory : true;

        return matchesTitle && matchesDate && matchesCategory;
    });

    const handleViewDetails = (thesis) => {
        setSelectedThesis(thesis);
        setShowDetailsModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setLoading(true);

        try {
            const result = await emailLogin(email, password);
            
            if (result.status === "success" && result.data.user.role === "admin") {
                localStorage.setItem("user-info", JSON.stringify({
                    id: result.data.user._id,
                    name: result.data.user.name,
                    email: result.data.user.email,
                    image: result.data.user.image,
                    role: result.data.user.role,
                    token: result.data.token
                }));
                navigate(`/${result.data.user.role}-dashboard`);
                return;
            }

            if (!recaptchaToken) {
                setErrorMessage("Please complete the reCAPTCHA.");
                setLoading(false);
                return;
            }

            const response = await fetch("http://localhost:8080/api/verify-recaptcha", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recaptchaToken }),
            });

            const recaptchaData = await response.json();
            if (!recaptchaData.success) {
                setErrorMessage("reCAPTCHA verification failed. Please try again.");
                setLoading(false);
                return;
            }

            if (result.status === "success") {
                localStorage.setItem("user-info", JSON.stringify({
                    id: result.data.user._id,
                    name: result.data.user.name,
                    email: result.data.user.email,
                    image: result.data.user.image,
                    role: result.data.user.role,
                    token: result.data.token
                }));
                navigate(`/${result.data.user.role}-dashboard`);
            } else {
                setErrorMessage(result.message || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            setErrorMessage(error?.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                const result = await googleAuth(tokenResponse.access_token);
                if (result.status === "success") {
                    const {user, token} = result.data;
                    localStorage.setItem("user-info", JSON.stringify({
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: user.role,
                        token,
                        googleDriveToken: tokenResponse.access_token,
                    }));
                    navigate(`/${user.role}-dashboard`);
                } else {
                    setErrorMessage(result.message || "Google login failed");
                }
            } catch (error) {
                console.error("Google login error:", error);
                setErrorMessage("Google login failed");
            } finally {
                setLoading(false);
            }
        },
        onError: (error) => {
            console.error("Google login error:", error);
            setErrorMessage("Google login failed");
        },
        scope: "email profile https://www.googleapis.com/auth/drive",
    });

    return (
        <div className="vh-100 d-flex flex-column">
            {/* Enhanced Header/Navbar */}
            <div className="navbar navbar-expand-lg navbar-light bg-light w-100" style={{margin: 0, padding: 0}}>
                <div className="w-100 d-flex justify-content-between align-items-center px-4">
                    <div className="d-flex align-items-center">
                        <img src={bukSULogo} alt="BukSU Logo" style={{width: "45px", height: "45px", marginRight: "12px"}}/>
                        <div>
                            <div className="navbar-brand-text">IT Capstone Archive</div>
                            <div className="navbar-subtitle">Bukidnon State University</div>
                        </div>
                    </div>
                    
                    <div className="d-flex align-items-center">
                        <a href="#home" className="nav-link" onClick={() => setShowProjects(false)}>Home</a>
                        <a href="#browse" className="nav-link" onClick={() => setShowProjects(true)}>Browse Projects</a>
                        <a href="#about" className="nav-link" onClick={() => setShowProjects(false)}>About</a>
                        <a href="#contact" className="nav-link" onClick={() => setShowProjects(false)}>Contact</a>
                        <button 
                            className="nav-login-btn"
                            onClick={() => setShowLogin(!showLogin)}
                        >
                            {showLogin ? "Close Login" : "Login"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-grow-1 d-flex align-items-center justify-content-center p-0 m-0">
                {!showLogin ? (
                    <div className="home-content">
                        {!showProjects ? (
                            <>
                                {/* Hero Section */}
                                <section className="hero-section fade-in">
                                    <div className="hero-content">
                                        <h1 className="hero-title">Explore BukSU Students' Capstone Projects</h1>
                                        <p className="hero-subtitle">
                                            Access a collection of approved and completed capstone projects from Bukidnon State University students.
                                        </p>
                                        
                                        {/* Search Bar */}
                                        <div className="search-container">
                                            <div className="search-box">
                                                <span className="search-icon">🔍</span>
                                                <input
                                                    type="text"
                                                    placeholder="Search by title, author, course, or year"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="search-input"
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* CTA Buttons */}
                                        <div className="hero-buttons">
                                            <button 
                                                className="hero-btn hero-btn-primary"
                                                onClick={() => setShowProjects(true)}
                                            >
                                                Browse Projects
                                            </button>
                                            <button className="hero-btn hero-btn-secondary">
                                                Submit Your Capstone
                                            </button>
                                        </div>
                                    </div>
                                </section>

                                {/* About Section */}
                                <section className="about-section">
                                    <div className="about-container">
                                        <h2 className="section-title">What is the Capstone Archive?</h2>
                                        <p className="about-text">
                                            The BukSU Capstone Archive is a digital repository of approved capstone projects from students across all programs. 
                                            This platform serves as a reference for current students, a recognition of student work, and a valuable academic resource.
                                        </p>
                                    </div>
                                </section>

                                {/* Browse by Program Section */}
                                <section className="programs-section">
                                    <div className="programs-container">
                                        <h2 className="section-title">Browse by Program or Department</h2>
                                        <div className="programs-grid">
                                            <div className="program-card">
                                                <div className="program-icon">👨‍💻</div>
                                                <h3>Information Technology</h3>
                                                <p>Software development, web applications, and IT solutions</p>
                                            </div>
                                            <div className="program-card">
                                                <div className="program-icon">🧪</div>
                                                <h3>Science and Math</h3>
                                                <p>Research studies, mathematical models, and scientific innovations</p>
                                            </div>
                                            <div className="program-card">
                                                <div className="program-icon">🏫</div>
                                                <h3>Education</h3>
                                                <p>Teaching methodologies, educational tools, and learning systems</p>
                                            </div>
                                            <div className="program-card">
                                                <div className="program-icon">📊</div>
                                                <h3>Business Administration</h3>
                                                <p>Business strategies, market analysis, and management systems</p>
                                            </div>
                                            <div className="program-card">
                                                <div className="program-icon">🎨</div>
                                                <h3>Arts & Humanities</h3>
                                                <p>Creative projects, cultural studies, and artistic innovations</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </>
                        ) : (
                            /* Browse Projects Section */
                            <div className="student-dashboard pt-0">
                                {/* Dashboard Header */}
                                <div className="dashboard-header mb-4 sticky-search-bar">
                                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 6 }}>Browse Capstone Projects</h2>
                                    <p style={{ fontSize: '1rem', color: '#718096', marginBottom: 12 }}>Discover approved research and capstone works from BukSU students</p>
                                    {/* Search and Filter Section */}
                                    <div className="search-filter sticky-search-filter">
                                        <div className="row g-3 align-items-center">
                                            <div className="col-12 col-md-5">
                                                <div className="input-group">
                                                    <span className="input-group-text" style={{ background: '#f8f9fa' }}>
                                                        <i className="fas fa-search"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        placeholder="Search..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="form-control"
                                                        style={{ padding: '10px', fontSize: '0.98rem', border: '1px solid #dee2e6' }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <input
                                                    type="date"
                                                    value={selectedDate}
                                                    onChange={(e) => setSelectedDate(e.target.value)}
                                                    className="form-control"
                                                    style={{ padding: '10px', fontSize: '0.98rem' }}
                                                />
                                            </div>
                                            <div className="col-6 col-md-4">
                                                <select
                                                    value={selectedCategory}
                                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                                    className="form-control"
                                                    style={{ padding: '10px', fontSize: '0.98rem' }}
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
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="login-container slide-up">
                        <div className="login-header">
                            <h4>Sign In</h4>
                        </div>
                        <div className="login-body">
                    <form onSubmit={handleSubmit}>
                                <div className="form-group">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                                <div className="form-group">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                        <div className="d-flex justify-content-center mb-3">
                            <ReCAPTCHA
                                sitekey="6LfREoYqAAAAABFQTQf5IG6SVrRmgcyz5p-C1gls"
                                onChange={(token) => setRecaptchaToken(token)}
                            />
                        </div>
                                <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? "Logging in..." : "Log In"}
                        </button>
                    </form>
                            <div className="divider">
                                <span>Or Login with</span>
                            </div>
                    <button
                                className="google-btn"
                        onClick={googleLogin}
                        disabled={loading}
                    >
                        <img
                            src={GoogleLogo}
                            alt="Google logo"
                                    style={{ width: "20px", height: "20px" }}
                                />
                                {loading ? "Signing in..." : "Sign in with Google"}
                            </button>
                            <div className="register-link">
                                Don't have an account? <span onClick={() => setShowModal(true)}>Register</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer - Full Width */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>© 2025 BukSU Capstone Archive</h4>
                        <p>Bukidnon State University</p>
                    </div>
                    <div className="footer-section">
                        <h5>Contact Info</h5>
                        <p>📧 capstone@buksu.edu.ph</p>
                        <p>📞 (088) 813-5661</p>
                    </div>
                    <div className="footer-section">
                        <h5>Follow Us</h5>
                        <div className="social-links">
                            <a href="#" className="social-link">📘 Facebook</a>
                            <a href="#" className="social-link">📷 Instagram</a>
                        </div>
                    </div>
                    <div className="footer-section">
                        <h5>Legal</h5>
                        <a href="#" className="social-link">Privacy Policy</a>
                        <a href="#" className="social-link">Terms of Use</a>
                    </div>
                </div>
            </footer>

            {/* Project Details Modal */}
            <div className={`custom-modal ${showDetailsModal ? 'show' : ''}`} onClick={() => setShowDetailsModal(false)}>
                <div 
                    className="custom-modal-content" 
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                        width: '80%',
                        maxWidth: '1800px',
                        minWidth: '300px'
                    }}
                >
                    <div className="custom-modal-header">
                        <h3>Project Details</h3>
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
                                        {selectedThesis.members && selectedThesis.members.map((member, index) => (
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

            {showModal && (
                <div className="modal fade show" style={{display: "block"}}>
                    <div className="modal-dialog">
                    <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Choose Your Account Type</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-6">
                            <div className="user-type-card" onClick={() => navigate("/teacher-register")}>
                                    <img src="./src/Images/Teacher.png" alt="Teacher"/>
                                <p>Teacher</p>
                            </div>
                                    </div>
                                    <div className="col-6">
                            <div className="user-type-card" onClick={() => navigate("/student-register")}>
                                    <img src="./src/Images/user.png" alt="Student"/>
                                            <p>Student</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoogleLogin;