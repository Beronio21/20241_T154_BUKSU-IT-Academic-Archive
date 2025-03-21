import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useLocation } from 'react-router-dom';
import StudentTopbar from '../../Topbar/StudentTopbar/StudentTopbar';
import './StudentDashboard.css';

const projectData = [
    { title: "E-Commerce Product Recommendation System", year: "2023", author: "John Doe" },
    { title: "Personal Finance Tracker", year: "2023", author: "Jane Smith" },
    { title: "Dog Breed Classifier", year: "2023", author: "Bob Johnson" },
    { title: "Local Restaurant Food Delivery App", year: "2023", author: "Alice Williams" },
    { title: "Social Media Brand Awareness Analysis", year: "2023", author: "James Brown" },
    { title: "Small Business Inventory Management System", year: "2023", author: "Emma Davis" },
];

const StudentDashboard = () => {
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
        if (location.pathname === '/student-dashboard') {
            navigate('/student-dashboard/dashboard', { replace: true });
        }
    }, [navigate, location]);

    return (
        <div className="dashboard-container d-flex flex-column min-vh-100">
            <StudentTopbar userInfo={userInfo} />
            <div className="layout-container flex-grow-1 mt-5">
                <div className="dashboard-content container">
                    <Header />
                    <SearchBar />
                    <ProjectList />
                </div>
            </div>
            <Footer />
        </div>
    );
};

const Header = () => (
    <div className="text-center mb-4">
        <h1 className="text-dark font-weight-bold">Capstone IT Projects</h1>
    </div>
);

const SearchBar = () => (
    <div className="mb-4">
        <div className="input-group">
            <input
                type="text"
                className="form-control"
                placeholder="Search by title, student, or technology"
            />
            <div className="input-group-append">
                <button className="btn btn-outline-secondary" type="button">
                    <i className="fas fa-search"></i>
                </button>
            </div>
        </div>
    </div>
);

const ProjectList = () => (
    <div className="table-responsive">
        <table className="table table-striped">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Year</th>
                    <th>Author</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {projectData.map((project, index) => (
                    <tr key={index}>
                        <td>{project.title}</td>
                        <td>{project.year}</td>
                        <td>{project.author}</td>
                        <td>
                            <button className="btn btn-primary btn-sm">View</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const Footer = () => (
    <footer className="text-center py-4">
        <a href="#" className="text-muted">Privacy Policy</a> | 
        <a href="#" className="text-muted">Terms of Service</a>
        <p className="text-muted mt-2">2023 BUKSU IT Department. All rights reserved.</p>
    </footer>
);

export default StudentDashboard;
