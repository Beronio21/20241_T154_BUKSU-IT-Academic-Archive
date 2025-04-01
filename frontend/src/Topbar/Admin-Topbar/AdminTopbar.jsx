import React from 'react';
import { useNavigate } from 'react-router-dom';

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
        <nav className="navbar fixed-top navbar-expand-lg">
            <div className="container-fluid">
                <div className="d-flex align-items-center ms-auto">
                
                    {/* User Profile Dropdown */}
                    <div className="dropdown">
                        <button 
                            className="btn p-0 dropdown-toggle d-flex align-items-center text-black"
                            type="button"
                            id="adminDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            style={{ background: 'none', border: 'none' }}
                        >
                            <img
                                src={userInfo?.image || '/path/to/local/image.png'}
                                alt="Profile"
                                className="rounded-circle me-2"
                                width="32"
                                height="32"
                            />
                            <span className="d-none d-md-inline">{userInfo?.name || 'Administrator'}</span>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="adminDropdown">
                            <li>
                                <button 
                                    className="dropdown-item" 
                                    onClick={() => navigate('/admin-dashboard/profile')}
                                >
                                    <i className="bi bi-person me-2 fs-5"></i>
                                    Profile
                                </button>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <button className="dropdown-item text-danger" onClick={handleLogout}>
                                    <i className="bi bi-box-arrow-right me-2 fs-5"></i>
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default AdminTopbar;
