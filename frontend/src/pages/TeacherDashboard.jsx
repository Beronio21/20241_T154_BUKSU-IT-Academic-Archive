import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const TeacherDashboard = () => {
    const [userInfo, setUserInfo] = useState(null);
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

        // Redirect to the dashboard if on the base path
        if (location.pathname === '/teacher-dashboard') {
            navigate('/teacher-dashboard/dashboard', { replace: true });
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
        <div className="d-flex flex-column min-vh-100 bg-light" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
            <Header userInfo={userInfo} handleLogout={handleLogout} />
            <MainContent />
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
    <div className="mb-4 position-relative"> {/* Added position-relative for absolute positioning of the icon */}
      <div className="input-group">
        <input
          type="text"
          className="form-control bg-light border border-secondary"
          placeholder="Search..."
          style={{
            borderWidth: '1px',
            borderColor: '#ced4da',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            padding: '0.5rem 2.5rem', // Add padding to the right for the icon
            paddingLeft: '3rem', // Increase left padding to make space for the icon
            transition: 'border-color 0.3s, box-shadow 0.3s', // Smooth transition for focus
            position: 'relative', // Ensure the input is positioned relative
            zIndex: 1, // Ensure the input is above the icon
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#80bdff'; // Change border color on focus
            e.currentTarget.style.boxShadow = '0 0 5px rgba(0, 123, 255, 0.5)'; // Add shadow on focus
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#ced4da'; // Reset border color on blur
            e.currentTarget.style.boxShadow = 'none'; // Remove shadow on blur
          }}
        />
        <span
          className="input-group-text bg-light border-0"
          style={{
            borderRadius: '0 0.375rem 0.375rem 0', // Rounded corners on the right
            padding: '0.5rem', // Padding for the icon
            position: 'absolute', // Position the icon inside the input
            left: '0.75rem', // Positioning from the left
            top: '50%', // Center vertically
            transform: 'translateY(-50%)', // Adjust for vertical centering
            zIndex: 2, // Ensure the icon is above the input field
          }}
        >
          <img
            src="../src/images/search-icon.svg" // Path to your SVG icon
            alt="Search Icon"
            style={{ height: '20px', width: '20px' }} // Adjust size as needed
          />
        </span>
      </div>
    </div>
  );

const Filters = () => {
    const badgeStyle = {
    transition: 'box-shadow 0.3s ease',
    cursor: 'pointer', // Change cursor to pointer
    };

    const badgeHoverStyle = {
    boxShadow: '0 0 10px rgba(0, 123, 255, 0.5)', // Glowing effect
    };

    return (
    <div className="mb-4">
        <h3 className="text-dark fs-5 fw-bold mb-3">Filter options</h3>
        <div className="d-flex flex-wrap gap-2">
        {['2023', '2022', '2021', '2020', '2019', '2018'].map((year) => (
            <span
            key={year}
            className="badge bg-light text-dark p-2"
            style={badgeStyle}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = badgeHoverStyle.boxShadow;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
            }}
            >
            {year}
            </span>
        ))}
        </div>
        <div className="d-flex flex-wrap gap-2 mt-3">
        {['Mobile Apps', 'Web Apps', 'Databases'].map((type) => (
            <span
            key={type}
            className="badge bg-light text-dark p-2"
            style={badgeStyle}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = badgeHoverStyle.boxShadow;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
            }}
            >
            {type}
            </span>
        ))}
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
          style={{ cursor: 'default' }} // Change cursor to default for non-clickable areas
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

export default TeacherDashboard;
        
