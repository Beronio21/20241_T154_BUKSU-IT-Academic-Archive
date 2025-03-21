// StudentTopbar.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const StudentTopbar = () => {
    const [userInfo, setUserInfo] = useState(null);
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
    }, [navigate]);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/login', { replace: true });
        }
    };

    return (
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
};

export default StudentTopbar;
