import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useLocation } from 'react-router-dom';
import StudentTopbar from '../../Topbar/StudentTopbar/StudentTopbar';

const projectData = [
    { title: "AI for Climate Change", mentor: "Bill Gates", year: "2023", category: "Mobile Apps" },
    { title: "E-commerce Platform", mentor: "Tim Cook", year: "2022", category: "Web Apps" },
    { title: "Blockchain Voting System", mentor: "Elon Musk", year: "2021", category: "Databases" },
    { title: "AR Training App", mentor: "Sundar Pichai", year: "2020", category: "Mobile Apps" },
];

const StudentDashboard = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
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

    const years = ["2023", "2022", "2021", "2020", "2019", "2018"];
    const categories = ["Mobile Apps", "Web Apps", "Databases"];

    const filteredProjects = projectData.filter((project) => {
        const matchesSearch =
            project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.mentor.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesYear = selectedYear ? project.year === selectedYear : true;
        const matchesCategory = selectedCategory ? project.category === selectedCategory : true;
        return matchesSearch && matchesYear && matchesCategory;
    });

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleYearChange = (e) => {
        setSelectedYear(e.target.value);
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    return (
        <div>
            <StudentTopbar userInfo={userInfo} />
            <div className="container mt-5" style={{ marginTop: '80px' }}>
                {/* Header Section */}
                <div className="mb-4 text-center">
                    <h1 className="fw-bold">Capstone IT Projects</h1>
                    <p className="text-secondary">
                        Explore the best IT capstone projects from 2010 to present. Use the search bar to find a specific project, or use the filters to browse by year or type.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-4 pt-5">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>

                {/* Filter Options */}
                <div className="mb-4">
                    <h5 className="fw-bold">Filter options</h5>
                    <div className="d-flex ">
                        <div className="me-2">
                            <select className="form-select" value={selectedYear} onChange={handleYearChange}>
                                <option value="">Year</option>
                                {years.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <select className="form-select" value={selectedCategory} onChange={handleCategoryChange}>
                                <option value="">Category</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Project List */}
                <div>
                    {filteredProjects.length > 0 ? (
                        filteredProjects.map((project, index) => (
                            <div
                                key={index}
                                className="p-3 mb-3 bg-white border rounded shadow-sm d-flex flex-column"
                            >
                                <div>
                                    <h5 className="mb-1">{project.title}</h5>
                                    <p className="mb-0 text-secondary">Mentor: {project.mentor}</p>
                                </div>
                                <button className="btn btn-outline-primary mt-2 align-self-start">View full summary</button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-secondary">No projects found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
