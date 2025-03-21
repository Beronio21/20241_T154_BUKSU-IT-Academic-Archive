import React from 'react';
import { useNavigate } from 'react-router-dom';


const StudentTopbar = ({ userInfo, handleLogout }) => {
    const navigate = useNavigate();

    return (
        <header className="student-header bg-white shadow-sm py-2 fixed-top">
            <div className="container d-flex align-items-center justify-content-between">
                <a href="#" className="d-flex align-items-center gap-2 text-decoration-none">
                    <img src="../src/Images/buksulogo.png" alt="Logo" className="img-fluid" style={{ height: '40px' }} />
                    <h2 className="text-dark fs-5 fw-bold mb-0">IT Capstone Archive</h2>
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
                                <div className="rounded-circle overflow-hidden" style={{ width: '40px', height: '40px' }}>
                                    <img
                                        src={userInfo.image || '/default-avatar.png'}
                                        alt={userInfo.name || 'User Avatar'}
                                        className="img-fluid"
                                    />
                                </div>
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                <li><a className="dropdown-item" href="/student-profile">Profile Settings</a></li>
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
};

export default StudentTopbar;
