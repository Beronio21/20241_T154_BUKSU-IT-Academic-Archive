import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentTopbar.css'; // External CSS

const StudentTopbar = ({
    userInfo,
    titleSearch,
    setTitleSearch,
    dateSearch,
    setDateSearch,
    categorySearch,
    setCategorySearch,
    categories = [] // Default to an empty array
}) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/', { replace: true });
        }
    };

    return (
        <nav className="student-topbar navbar navbar-expand-lg bg-light shadow-sm">
            <div className="container-fluid d-flex justify-content-between align-items-center">
                {/* Search Bar */}
                <div className="search-bar d-flex gap-3">
                    <input
                        type="text"
                        placeholder="Search by title"
                        value={titleSearch}
                        onChange={(e) => setTitleSearch(e.target.value)}
                        className="form-control"
                    />
                    <input
                        type="date"
                        value={dateSearch}
                        onChange={(e) => setDateSearch(e.target.value)}
                        className="form-control"
                    />
                    <select
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="form-control"
                    >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* User Profile Dropdown */}
                <div className="dropdown">
                    <button
                        className="p-0 dropdown-toggle d-flex align-items-center profile-btn"
                        type="button"
                        id="userDropdown"
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
                        <span>{userInfo?.name || 'User'}</span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                        <li>
                            <a className="dropdown-item" href="/student-dashboard/profile">
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

export default StudentTopbar;
