import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherTopbar.css'; // External CSS

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
        filterCapstones(searchTerm, yearFilter, topicFilter); // This function will handle filtering logic in the parent
    };

    const handleYearChange = (e) => {
        setYearFilter(e.target.value);
        filterCapstones(searchTerm, e.target.value, topicFilter); // Filter capstones
    };

    const handleTopicChange = (e) => {
        setTopicFilter(e.target.value);
        filterCapstones(searchTerm, yearFilter, e.target.value); // Filter capstones
    };

    return (
        <nav className="teacher-topbar navbar navbar-expand-lg bg-light shadow-sm">
            <div className="container-fluid d-flex justify-content-between align-items-center">
                
                {/* Search Bar & Filters */}
                <div className="d-flex align-items-center gap-3">
                    <input
                        type="text"
                        className="form-control form-control-sm search-bar"
                        placeholder="Search capstones..."
                        value={searchTerm}
                        onChange={handleSearchChange} // Updated to handle search change
                    />

                    <select
                        className="form-select form-select-sm filter-dropdown"
                        value={yearFilter}
                        onChange={handleYearChange} // Updated to handle year filter change
                    >
                        <option value="">All Years</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                    </select>

                    <select
                        className="form-select form-select-sm filter-dropdown"
                        value={topicFilter}
                        onChange={handleTopicChange} // Updated to handle topic filter change
                    >
                        {topics.map((topic) => (
                            <option key={topic} value={topic}>
                                {topic}
                            </option>
                        ))}
                    </select>
                </div>

                {/* User Profile Dropdown */}
                <div className="dropdown">
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
