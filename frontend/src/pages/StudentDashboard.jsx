import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import StudentProfile from '../Profile/StudentProfile';
import SubmitThesis from '../components/SubmitThesis';
import ViewSubmittedThesis from '../components/ViewSubmittedThesis';

const StudentDashboard = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation(); 

    useEffect(() => {
        const data = localStorage.getItem('user-info');
        if (!data) {
            navigate('/login', { replace: true });
            return;
        }
        const userData = JSON.parse(data);
        if (userData?.role !== 'student' || !userData.token) {
            navigate('/login', { replace: true });
            return;
        }
        setUserInfo(userData);
        
        if (location.pathname === '/student-dashboard') {
            navigate('/student-dashboard/dashboard', { replace: true });
        }
    }, [navigate, location]);

    useEffect(() => {
        if (userInfo?.email) {
            fetchSubmissions();
        }
    }, [userInfo]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!userInfo?.email) {
                throw new Error('User email not found');
            }

            console.log('Fetching submissions for:', userInfo.email);
            const url = `http://localhost:8080/api/thesis/student-submissions/${encodeURIComponent(userInfo.email)}`;
            console.log('Request URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch submissions');
            }

            if (data.status === 'success') {
                setSubmissions(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch submissions');
            }
        } catch (error) {
            console.error('Detailed error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (thesisId) => {
        if (!window.confirm('Are you sure you want to delete this thesis?')) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/api/thesis/delete/${thesisId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userInfo.token}`
                    }
                }
            );

            const data = await response.json();
            if (data.status === 'success') {
                alert('Thesis deleted successfully');
                fetchSubmissions(); // Refresh the list
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error deleting thesis:', error);
            alert('Failed to delete thesis: ' + error.message);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/login', { replace: true });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const renderFeedback = (feedback) => {
        if (!feedback || feedback.length === 0) return null;
        
        return (
            <div className="feedback-section">
                {feedback.map((item, index) => (
                    <div key={index} className="feedback-item">
                        <div className="feedback-header">
                            <span className="teacher-info">
                                <strong>{item.teacherName}</strong> ({item.teacherEmail})
                            </span>
                            <span className={`feedback-status status-${item.status.toLowerCase()}`}>
                                {item.status}
                            </span>
                            <span className="feedback-date">
                                {formatDate(item.dateSubmitted)}
                            </span>
                        </div>
                        <div className="feedback-comment">
                            {item.comment}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const ThesisSubmissions = () => (
        <section className="submissions-section mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Thesis Submissions</h2>
                <Link to="/student-dashboard/submit-thesis" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>Submit New Thesis
                </Link>
            </div>
            {loading ? (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>{error}
                </div>
            ) : submissions.length === 0 ? (
                <div className="text-center p-5 bg-light rounded">
                    <i className="bi bi-file-earmark-text display-1 text-muted"></i>
                    <p className="mt-3 text-muted">No submissions found. Start by submitting your first thesis!</p>
                    <Link to="/student-dashboard/submit-thesis" className="btn btn-primary mt-3">
                        Submit Thesis
                    </Link>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>Title</th>
                                <th>Members</th>
                                <th>Adviser</th>
                                <th>Submission Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((submission, index) => (
                                <React.Fragment key={submission._id || index}>
                                    <tr>
                                        <td className="fw-bold">{submission.title}</td>
                                        <td>{submission.members.join(', ')}</td>
                                        <td>{submission.adviserEmail}</td>
                                        <td>{formatDate(submission.createdAt)}</td>
                                        <td>
                                            <span className={`badge ${
                                                submission.status === 'pending' ? 'bg-warning' : 
                                                submission.status === 'approved' ? 'bg-success' :
                                                submission.status === 'revision needed' ? 'bg-info' : 'bg-danger'
                                            }`}>
                                                {submission.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <a 
                                                    href={submission.docsLink} 
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    <i className="bi bi-eye me-1"></i>View
                                                </a>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDelete(submission._id)}
                                                    disabled={submission.status === 'approved'}
                                                >
                                                    <i className="bi bi-trash me-1"></i>Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {submission.feedback && submission.feedback.length > 0 && (
                                        <tr className="feedback-row">
                                            <td colSpan="6" className="bg-light">
                                                <div className="p-3">
                                                    <h6 className="mb-3">Feedback History</h6>
                                                    {renderFeedback(submission.feedback)}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );

    return (
        <div className="d-flex flex-column min-vh-100 bg-light" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
            <Header userInfo={userInfo} handleLogout={handleLogout} />
            <div className="flex-grow-1 p-4">
                <Routes>
                    <Route path="/dashboard" element={<MainContent />} />
                    <Route path="/student-profile" element={<StudentProfile />} />
                    <Route path="/submit-thesis" element={<SubmitThesis />} />
                    <Route path="/my-theses" element={<ViewSubmittedThesis />} />
                    <Route path="/home" element={<MainContent />} />
            
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </div>
            <Footer />
        </div>
    );
};

const Header = ({ userInfo, handleLogout }) => (
    <header className="w-100 bg-white shadow-sm py-2 fixed-top">
        <div className="container d-flex align-items-center justify-content-between">
            <Link to="/student-dashboard/dashboard" className="text-decoration-none">
                <div className="d-flex align-items-center gap-2">
                    <img src="../src/Images/buksulogo.png" alt="Logo" className="logo" style={{ height: "40px" }} />
                    <h2 className="text-dark fs-5 fw-bold mb-0">IT Capstone Archive</h2>
                </div>
            </Link>
            <nav className="d-none d-md-flex align-items-center gap-3">
                {['Home'].map((item) => (
                    <Link key={item} className="text-dark text-decoration-none" to={`/student-dashboard/${item.toLowerCase()}`}>{item}</Link>
                ))}
                <Link className="text-dark text-decoration-none" to="/student-dashboard/submit-thesis">Submit Thesis</Link>
                <Link className="text-dark text-decoration-none" to="/student-dashboard/my-theses">My Theses</Link>
                
                {userInfo ? (
                    <div className="dropdown">
                        <a
                            href="#"
                            className="d-flex align-items-center text-dark text-decoration-none dropdown-toggle"
                            id="userDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <div className="user-icon rounded-circle overflow-hidden" style={{ width: '40px', height: '40px' }}>
                                <img
                                    src={userInfo.image || '/default-avatar.png'}
                                    alt={userInfo.name || 'User Avatar'}
                                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                />
                            </div>
                        </a>
                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                            <li><Link className="dropdown-item" to="/student-dashboard/student-profile">Profile Settings</Link></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                        </ul>
                    </div>
                ) : (
                    <Link className="text-dark text-decoration-none" to="/login">Login</Link>
                )}
            </nav>
        </div>
    </header>
);

const MainContent = () => (
    <main className="flex-grow-1 p-3 p-md-4 mt-5">
        <div className="container">
            <Intro />
            <SearchBar />
            <Filters />
            <ProjectList />
        </div>
    </main>
);

const Intro = () => (
    <div>
        <h1 className="text-dark text display-6 fw-bold mb-3">Capstone IT Projects</h1>
        <p className="text-secondary mb-4">
            Explore the best IT capstone projects from 2020 to present. Use the search bar to find a specific project, or use the filters to browse by year or type.
        </p>
    </div>
);

const SearchBar = () => (
    <div className="mb-4 position-relative">
        <div className="input-group">
            <input
                type="text"
                className="form-control bg-light border border-secondary"
                placeholder="Search..."
                style={{
                    borderWidth: '1px',
                    borderColor: '#ced4da',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    padding: '0.5rem 2.5rem',
                    paddingLeft: '3rem',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                    position: 'relative',
                    zIndex: 1,
                }}
                onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#80bdff';
                    e.currentTarget.style.boxShadow = '0 0 5px rgba(0, 123, 255, 0.5)';
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#ced4da';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            />
            <span
                className="input-group-text bg-light border-0"
                style={{
                    borderRadius: '0 0.375rem 0.375rem 0',
                    padding: '0.5rem',
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                }}
            >
                <img
                    src="../src/images/search-icon.svg"
                    alt="Search Icon"
                    style={{ height: '20px', width: '20px' }}
                />
            </span>
        </div>
    </div>
);

const Filters = () => {
    const years = ['2023', '2022', '2021', '2020', '2019', '2018'];
    const topics = ['Mobile Apps', 'Web Apps', 'Databases'];

    return (
        <div className="mb-4">
            <h3 className="text-dark fs-5 fw-bold mb-3">Filter Options</h3>
            <div className="d-flex gap-2">
                {/* Year Dropdown */}
                <div className="dropdown">
                    <button
                        className="btn btn-outline-primary dropdown-toggle"
                        type="button"
                        id="yearDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{
                            borderRadius: '15px',
                            padding: '0.3rem 1rem',
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        Year
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="yearDropdown">
                        {years.map((year) => (
                            <li key={year}>
                                <a
                                    className="dropdown-item"
                                    href="#"
                                    style={{
                                        transition: 'background-color 0.3s ease',
                                        fontSize: '0.9rem',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#e9ecef';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    {year}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Topic Dropdown */}
                <div className="dropdown">
                    <button
                        className="btn btn-outline-primary dropdown-toggle"
                        type="button"
                        id="topicDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{
                            borderRadius: '15px',
                            padding: '0.3rem 1rem',
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        Topic
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="topicDropdown">
                        {topics.map((topic) => (
                            <li key={topic}>
                                <a
                                    className="dropdown-item"
                                    href="#"
                                    style={{
                                        transition: 'background-color 0.3s ease',
                                        fontSize: '0.9rem',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#e9ecef';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    {topic}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const ProjectList = () => (
    <div className="d-flex flex-column gap-4">
        {projects.map((project, index) => (
            <div
                key={index}
                className="d-flex align-items-center justify-content-between  p-3 rounded shadow-sm transition-shadow hover:shadow-lg"
                style={{ cursor: 'default' }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                }}
            >
                <div className="d-flex flex-column flex-grow-1">
                    <p className="text-dark fw-bold mb-0">{project.title}</p>
                    <p className="text-secondary mb-0">Mentor: <span className="fw-medium">{project.mentor}</span></p>
                </div>
                <a className="text-primary fw-bold ms-3" href="#">View full summary</a>
            </div>
        ))}
    </div>
);

const Footer = () => (
    <footer className="py-4 mt-5">
        <div className="container text-center">
            <div className="d-flex flex-wrap justify-content-center gap-3 mb-3">
                {['Privacy Policy', 'Terms of Service', 'About us'].map((link) => (
                    <a key={link} className="text-secondary text-decoration-none" href="#">{link}</a>
                ))}
            </div>
            <p className="text-secondary mb-0">©2025 BUKSU IT Department. All rights and reserved.</p>
        </div>
    </footer>
);

const projects = [
    { title: 'AI for Climate Change', mentor: 'Bill Gates' },
    { title: 'E-commerce Platform', mentor: 'Tim Cook' },
    { title: 'Blockchain Voting System', mentor: 'Elon Musk' },
    { title: 'AR Training App', mentor: 'Jeff Bezos' },
    { title: 'Cybersecurity AI', mentor: 'Satya Nadella' },
    { title: 'Healthcare IoT', mentor: 'Sundar Pichai' },
    { title: 'Social Media Analytics', mentor: 'Jack Dorsey' },
    { title: 'EdTech AI Tutor', mentor: 'Susan Wojcicki' },
];

export default StudentDashboard;
    