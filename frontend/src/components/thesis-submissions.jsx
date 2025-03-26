import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import StudentList from '../components/StudentList';
import TeacherProfile from '../Profile/TeacherProfile/TeacherProfile';

const TeacherDashboard = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const data = localStorage.getItem('user-info');
        if (!data) {
            navigate('/login', { replace: true });
            return;
        }

        const userData = JSON.parse(data);
        if (userData?.role !== 'teacher') {
            navigate('/login', { replace: true });
            return;
        }

        setUserInfo(userData);
        fetchSubmissions(userData);
        
        if (location.pathname === '/teacher-dashboard') {
            navigate('/teacher-dashboard/dashboard', { replace: true });
        }
    }, [navigate, location]);

    const fetchSubmissions = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch all submissions
            const response = await fetch(
                'http://localhost:8080/api/thesis/submissions',
                {
                    headers: {
                        'Authorization': `Bearer ${userData.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = await response.json();
            
            if (data.status === 'success') {
                setSubmissions(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch submissions');
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setError('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/login', { replace: true });
        }
    };

    const filteredSubmissions = submissions.filter(submission => {
        const matchesSearch = submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            submission.members.some(member => member.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (submission.email && submission.email.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = selectedStatus === 'all' || submission.status?.toLowerCase() === selectedStatus;
        
        return matchesSearch && matchesStatus;
    });

    const handleAddFeedback = async (submissionId) => {
        // TODO: Implement feedback functionality
        console.log('Add feedback for submission:', submissionId);
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-light" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
            <Header userInfo={userInfo} handleLogout={handleLogout} />
            <div className="flex-grow-1 p-4">
                <Routes>
                    <Route path="/dashboard" element={<MainContent loading={loading} error={error} submissions={submissions} userInfo={userInfo} />} />
                    <Route path="/students" element={<StudentList />} />
                    <Route path="/profile" element={<TeacherProfile />} />
                </Routes>
            </div>
            <Footer />
        </div>
    );
};

const Header = ({ userInfo, handleLogout }) => (
    <header className="w-100 bg-white shadow-sm py-2 fixed-top">
        <div className="container d-flex align-items-center justify-content-between">
            <Link to="/teacher-dashboard/dashboard" className="text-decoration-none">
                <div className="d-flex align-items-center gap-2">
                    <img src="../src/Images/buksulogo.png" alt="Logo" className="logo" style={{ height: "40px" }} />
                    <h2 className="text-dark fs-5 fw-bold mb-0">IT Capstone Archive</h2>
                </div>
            </Link>
            <nav className="d-none d-md-flex align-items-center gap-3">
                <Link to="/teacher-dashboard/dashboard" className="text-dark text-decoration-none">Dashboard</Link>
                <Link to="/teacher-dashboard/thesis" className="text-dark text-decoration-none">All Thesis</Link>
                <Link to="/teacher-dashboard/students" className="text-dark text-decoration-none">Students</Link>
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
                            <li><Link className="dropdown-item" to="/teacher-dashboard/profile">Profile Settings</Link></li>
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

const MainContent = ({ loading, error, submissions, userInfo }) => {
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSubmissions = submissions.filter(submission => {
        const matchesSearch = submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            submission.members.some(member => member.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (submission.email && submission.email.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = selectedStatus === 'all' || submission.status?.toLowerCase() === selectedStatus;
        
        return matchesSearch && matchesStatus;
    });

    const handleAddFeedback = async (submissionId) => {
        // TODO: Implement feedback functionality
        console.log('Add feedback for submission:', submissionId);
    };

    return (
        <main className="flex-grow-1 p-3 p-md-4" style={{ marginTop: '8rem' }}>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="text-dark text display-6 fw-bold mb-3">All Thesis Submissions</h1>
                        <p className="text-secondary mb-0">
                            View and manage all student thesis submissions. Review documents and provide feedback.
                        </p>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="row mb-4">
                    <div className="col-md-8">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by title, student name, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <select 
                            className="form-select"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="revision">Needs Revision</option>
                        </select>
                    </div>
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
                ) : filteredSubmissions.length === 0 ? (
                    <div className="text-center p-5 bg-light rounded">
                        <i className="bi bi-file-earmark-text display-1 text-muted"></i>
                        <p className="mt-3 text-muted">No thesis submissions found.</p>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-4">
                        {filteredSubmissions.map((submission) => (
                            <div
                                key={submission._id}
                                className="d-flex align-items-center justify-content-between bg-white p-4 rounded shadow-sm transition-shadow hover:shadow-lg"
                                style={{ cursor: 'default' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                                }}
                            >
                                <div className="d-flex flex-column flex-grow-1">
                                    <h5 className="text-dark fw-bold mb-2">{submission.title}</h5>
                                    <p className="text-secondary mb-1">Members: {submission.members.join(', ')}</p>
                                    <p className="text-secondary mb-1">Student Email: {submission.email || 'N/A'}</p>
                                    <p className="text-secondary mb-1">Adviser: {submission.adviserEmail || 'N/A'}</p>
                                    <p className="text-secondary mb-0">
                                        Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                                    </p>
                                    {submission.status && (
                                        <div className="mt-2">
                                            <span className={`badge bg-${getStatusColor(submission.status)}`}>
                                                {submission.status}
                                            </span>
                                        </div>
                                    )}
                                    {submission.feedback && submission.feedback.length > 0 && (
                                        <div className="mt-3 p-3 bg-light rounded">
                                            <h6 className="mb-2">Latest Feedback</h6>
                                            <div className="feedback-item">
                                                <div className="feedback-header d-flex justify-content-between">
                                                    <span className="teacher-name">{submission.feedback[0].teacherName}</span>
                                                    <span className="feedback-date">
                                                        {new Date(submission.feedback[0].dateSubmitted).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="feedback-comment mb-0 mt-1">{submission.feedback[0].comment}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="d-flex flex-column gap-2">
                                    <a
                                        href={submission.docsLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                    >
                                        View Document
                                    </a>
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => handleAddFeedback(submission._id)}
                                    >
                                        Add Feedback
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};

const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'approved':
            return 'success';
        case 'rejected':
            return 'danger';
        case 'revision':
            return 'warning';
        default:
            return 'secondary';
    }
};

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

export default TeacherDashboard;
        
