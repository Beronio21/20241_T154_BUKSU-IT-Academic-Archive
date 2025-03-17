import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import StudentProfile from '../Profile/StudentProfile';
import StudentTopbar from '../Topbar/StudentTopbar';
import '../Styles/StudentDashboard.css';

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
                    <Route path="/dashboard" element={<MainContent />} />
                    <Route path="/student-profile" element={<StudentProfile />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </div>
            <Footer />
        </div>
    );
};

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