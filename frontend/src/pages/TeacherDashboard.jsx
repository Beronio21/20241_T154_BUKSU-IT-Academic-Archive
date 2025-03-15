import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const TeacherDashboard = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check for user information in local storage
        const data = localStorage.getItem('user-info');
        if (!data) {
            // Redirect to login if no user data is found
            navigate('/login', { replace: true });
            return;
        }

        const userData = JSON.parse(data);
        if (userData?.role !== 'teacher') {
            // Redirect to login if the user is not a teacher
            navigate('/login', { replace: true });
            return;
        }

        // Set user information if authenticated
        setUserInfo(userData);
        
        // Fetch thesis submissions
        fetchSubmissions(userData);
        
        // Redirect to the dashboard if on the base path
        if (location.pathname === '/teacher-dashboard') {
            navigate('/teacher-dashboard/dashboard', { replace: true });
        }
    }, [navigate, location]);

    const fetchSubmissions = async (userData) => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/thesis/submissions/adviser?email=${encodeURIComponent(userData.email)}`
            );
            const data = await response.json();
            
            if (data.status === 'success') {
                setSubmissions(data.data);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
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

    return (
        <div className="d-flex flex-column min-vh-100 bg-light" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
            <Header userInfo={userInfo} handleLogout={handleLogout} />
            <MainContent loading={loading} submissions={submissions} />
            <Footer />
        </div>
    );
};

const Header = ({ userInfo, handleLogout }) => (
    <header className="w-100 bg-white shadow-sm py-2 fixed-top">
        <div className="container d-flex align-items-center justify-content-between">
            <a href="#">
                <div className="d-flex align-items-center gap-2">
                    <img src="../src/Images/buksulogo.png" alt="Logo" className="logo" style={{ height: "40px" }} />
                    <h2 className="text-dark fs-5 fw-bold mb-0">IT Capstone Archive</h2>
                </div>
            </a>
            <nav className="d-none d-md-flex align-items-center gap-3">
                {['Home', 'Projects', 'Contact'].map((item) => (
                    <a key={item} className="text-dark text-decoration-none" href="#">{item}</a>
                ))}
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
                            <li><a className="dropdown-item" href="/profile">Profile Settings</a></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                        </ul>
                    </div>
                ) : (
                    <a className="text-dark text-decoration-none" href="/login">Login</a>
                )}
            </nav>
        </div>
    </header>
);

const MainContent = ({ loading, submissions }) => (
    <main className="flex-grow-1 p-3 p-md-4 mt-5">
        <div className="container">
            <Intro />
            <SearchBar />
            <Filters />
            <ProjectList loading={loading} submissions={submissions} />
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

const ProjectList = ({ loading, submissions }) => {
    if (loading) {
        return <div className="text-center">Loading submissions...</div>;
    }

    if (submissions.length === 0) {
        return (
            <div className="alert alert-info">
                No thesis submissions available at this time.
            </div>
        );
    }

    return (
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
                        <p className="text-secondary mb-1">Student Email: {submission.email || 'N/A'}</p>
                        <p className="text-secondary mb-0">
                            Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                        </p>
                        <span className={`badge bg-${getStatusColor(submission.status)} mt-2`}>
                            {submission.status}
                        </span>
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
                    </div>
                </div>
            ))}
        </div>
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
        
