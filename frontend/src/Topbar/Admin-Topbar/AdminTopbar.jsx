import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminTopbar.css'; // External CSS

const AdminTopbar = ({ userInfo }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/', { replace: true });
        }
    };

    return (
        <nav className="admin-topbar navbar navbar-expand-lg bg-light shadow-sm">
            <div className="container-fluid d-flex justify-content-end align-items-center">
                
                {/* User Profile Dropdown */}
                <div className="dropdown">
                    <button className="p-0 dropdown-toggle d-flex align-items-center profile-btn"
                        type="button"
                        id="adminDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <img
                            src={userInfo?.image || 'https://via.placeholder.com/32'}
                            alt="Profile"
                            className="rounded-circle me-2"
                            width="32"
                            height="32"
                        />
                        <span>{userInfo?.name || 'Administrator'}</span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="adminDropdown">
                        <li>
                            <a className="dropdown-item" href="/admin-dashboard/profile">
                                <i className="bi bi-person me-2 fs-5"></i> Profile
                            </a>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                            <button className="dropdown-item text-danger" onClick={handleLogout}>
                                <i className="bi bi-box-arrow-right me-2 fs-5"></i> Logout
                            </button>
                        </li>
                    </ul>
                </div>

            </div>
        </nav>
    );
};

export default AdminTopbar;