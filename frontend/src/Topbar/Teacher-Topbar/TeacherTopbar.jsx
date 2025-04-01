import React from 'react';
import { useNavigate } from 'react-router-dom';


const TeacherTopbar = ({ 
    userInfo, 
    searchTerm, 
    setSearchTerm, 
    yearFilter, 
    setYearFilter, 
    topicFilter, 
    setTopicFilter, 
    filterCapstones
}) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/', { replace: true });
        }
    };

    const topics = ["All Topics", "IoT", "AI", "ML", "Sound", "Camera"];

    // Pass the filter parameters to the parent (dashboard or other component) to filter the capstones
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        filterCapstones(searchTerm, yearFilter, topicFilter);
    };

    const handleYearChange = (e) => {
        setYearFilter(e.target.value);
        filterCapstones(searchTerm, e.target.value, topicFilter);
    };

    const handleTopicChange = (e) => {
        setTopicFilter(e.target.value);
        filterCapstones(searchTerm, yearFilter, e.target.value);
    };

    return (
        <nav className="teacher-topbar navbar navbar-expand-lg">
            <div className="container-fluid d-flex justify-content-end align-items-center">
                {/* User Profile Dropdown */}
                <div className="dropdown d-flex align-items-center">
                    <button className="p-0 dropdown-toggle d-flex align-items-center profile-btn"
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
                        <span>{userInfo?.name || 'Teacher'}</span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                        <li>
                            <a className="dropdown-item" href="/teacher-dashboard/profile">
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

export default TeacherTopbar;
