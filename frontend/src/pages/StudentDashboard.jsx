import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import StudentProfile from '../Profile/StudentProfile';
<<<<<<< HEAD
import StudentTopbar from '../Topbar/StudentTopbar';
import '../Styles/StudentDashboard.css';
=======
import SubmitThesis from '../components/SubmitThesis';
import ViewSubmittedThesis from '../components/ViewSubmittedThesis';
>>>>>>> 375fdbbe141288e6c9f85154043766799cceeb7a

const StudentDashboard = () => {
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchUserInfo = () => {
            const data = localStorage.getItem('user-info');
            if (!data) {
                navigate('/login', { replace: true });
                return;
            }
            try {
                const userData = JSON.parse(data);
                if (userData?.role !== 'student' || !userData.token) {
                    navigate('/login', { replace: true });
                    return;
                }
                setUserInfo(userData);
            } catch (error) {
                console.error('Failed to parse user info:', error);
                navigate('/login', { replace: true });
            }
        };

        fetchUserInfo();

        if (location.pathname === '/student-dashboard') {
            navigate('/student-dashboard/dashboard', { replace: true });
        }
    }, [navigate, location]);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/login', { replace: true });
        }
    };

    return (
        <div className="student-dashboard d-flex flex-column min-vh-100 bg-light">
            <StudentTopbar userInfo={userInfo} handleLogout={handleLogout} />
            <div className="student-main-content flex-grow-1 p-4" style={{ paddingTop: '70px' }}>
                <Routes>
                    <Route path="/dashboard" element={<MainContent userInfo={userInfo} />} />
                    <Route path="/student-profile" element={<StudentProfile />} />
                    <Route path="/submit-thesis" element={<SubmitThesis />} />
                    <Route path="/my-theses" element={<ViewSubmittedThesis />} />
                    <Route path="/home" element={<MainContent userInfo={userInfo} />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </div>
            <Footer />
        </div>
    );
};

<<<<<<< HEAD
const MainContent = () => (
    <main className="student-main-content flex-grow-1 p-3 p-md-4">
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
        <h1 className="text-dark display-6 fw-bold mb-3">Capstone IT Projects</h1>
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
                className="form-control bg-light border-secondary"
                placeholder="Search..."
                style={{ paddingLeft: '3rem' }}
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
                    className="img-fluid"
                    style={{ height: '20px', width: '20px' }}
                />
            </span>
        </div>
    </div>
);
=======
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
                <Link className="text-dark text-decoration-none" to="/student-dashboard/home">Home</Link>
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

const MainContent = ({ userInfo }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (userInfo?.email) {
            fetchSubmissions();
        }
    }, [userInfo]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            setError(null);
>>>>>>> 375fdbbe141288e6c9f85154043766799cceeb7a

            const response = await fetch(
                `http://localhost:8080/api/thesis/student-submissions/${encodeURIComponent(userInfo.email)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${userInfo.token}`,
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
                fetchSubmissions();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error deleting thesis:', error);
            alert('Failed to delete thesis: ' + error.message);
        }
    };

    return (
<<<<<<< HEAD
        <div className="mb-4">
            <h3 className="text-dark fs-5 fw-bold mb-3">Filter Options</h3>
            <div className="d-flex gap-2">
                <div className="dropdown">
                    <button
                        className="btn btn-outline-primary dropdown-toggle"
                        type="button"
                        id="yearDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        Year
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="yearDropdown">
                        {years.map((year) => (
                            <li key={year}>
                                <a className="dropdown-item" href="#">{year}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="dropdown">
                    <button
                        className="btn btn-outline-primary dropdown-toggle"
                        type="button"
                        id="topicDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        Topic
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="topicDropdown">
                        {topics.map((topic) => (
                            <li key={topic}>
                                <a className="dropdown-item" href="#">{topic}</a>
                            </li>
=======
        <main className="flex-grow-1 p-3 p-md-4" style={{ marginTop: '1200px' }}>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="text-dark text display-6 fw-bold mb-3">My Thesis Submissions</h1>
                        <p className="text-secondary mb-0">
                            View and manage your thesis submissions. You can submit new thesis, track their status, and view feedback.
                        </p>
                    </div>
                    <Link to="/student-dashboard/submit-thesis" className="btn btn-primary d-flex align-items-center gap-2">
                        <i className="bi bi-plus-circle"></i>
                        Submit New Thesis
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
                    <div className="d-flex flex-column gap-4">
                        {submissions.map((submission) => (
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
                                    <p className="text-secondary mb-1">Adviser: {submission.adviserEmail || 'N/A'}</p>
                                    <p className="text-secondary mb-0">
                                        Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                                    </p>
                                    {submission.status && (
                                        <div className="mt-2">

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
                                    {submission.status !== 'approved' && (
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={() => handleDelete(submission._id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
>>>>>>> 375fdbbe141288e6c9f85154043766799cceeb7a
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};

<<<<<<< HEAD
const ProjectList = () => (
    <div className="d-flex flex-column gap-4">
        {projects.map((project, index) => (
            <div
                key={index}
                className="d-flex align-items-center justify-content-between p-3 rounded shadow-sm transition-shadow hover:shadow-lg"
                style={{ cursor: 'default' }}
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
=======
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
>>>>>>> 375fdbbe141288e6c9f85154043766799cceeb7a

const Footer = () => (
    <footer className="student-footer py-4 mt-5 bg-light">
        <div className="container text-center">
            <div className="d-flex flex-wrap justify-content-center gap-3 mb-3">
                {['Privacy Policy', 'Terms of Service', 'About us'].map((link) => (
                    <a key={link} className="text-secondary text-decoration-none" href="#">{link}</a>
                ))}
            </div>
            <p className="text-secondary mb-0">©2025 BUKSU IT Department. All rights reserved.</p>
        </div>
    </footer>
);

<<<<<<< HEAD
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
=======
export default StudentDashboard;
    
>>>>>>> 375fdbbe141288e6c9f85154043766799cceeb7a
