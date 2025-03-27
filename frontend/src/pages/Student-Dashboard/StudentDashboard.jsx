import React, { useEffect, useState, useMemo } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from "react-router-dom";
import StudentNavbar from "../../Navbar/Student-Navbar/StudentNavbar";
import StudentTopBar from "../../Topbar/StudentTopbar/StudentTopbar";
import "./StudentDashboard.css"; // Ensure you include the updated CSS file

const projectData = [
    { title: "AI for Climate Change", mentor: "Bill Gates", year: "2023", category: "Mobile Apps" },
    { title: "E-commerce Platform", mentor: "Tim Cook", year: "2022", category: "Web Apps" },
    { title: "Blockchain Voting System", mentor: "Elon Musk", year: "2021", category: "Databases" },
    { title: "AR Training App", mentor: "Sundar Pichai", year: "2020", category: "Mobile Apps" },
];

const StudentDashboard = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const data = localStorage.getItem("user-info");
        if (!data) {
            navigate("/login", { replace: true });
            return;
        }
        const userData = JSON.parse(data);
        if (userData?.role !== "student" || !userData.token) {
            navigate("/login", { replace: true });
            return;
        }
        setUserInfo(userData);
    }, [navigate]);

    const years = ["2023", "2022", "2021", "2020", "2019", "2018"];
    const categories = ["Mobile Apps", "Web Apps", "Databases"];

    const filteredProjects = useMemo(() => {
        return projectData.filter((project) => {
            const matchesSearch =
                project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.mentor.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesYear = selectedYear ? project.year === selectedYear : true;
            const matchesCategory = selectedCategory ? project.category === selectedCategory : true;
            return matchesSearch && matchesYear && matchesCategory;
        });
    }, [searchQuery, selectedYear, selectedCategory]);

    return (
        <div className="d-flex">
            <StudentNavbar activeSection="dashboard" handleSectionChange={() => {}} />
            <div className="flex-grow-1">
                <StudentTopBar userInfo={userInfo} />
                <div className="container mt-4" style={{ marginLeft: "80px" }}>
                    {/* Header Section */}
                    <div className="mb-4 text-center">
                        <h1 className="fw-bold fs-3 text-primary">Capstone IT Projects</h1>
                        <p className="text-secondary fs-6">
                            Browse and explore innovative IT capstone projects. Use the search bar or filters to find specific projects.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="input-group mb-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="🔍 Search by project title or mentor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search projects"
                        />
                    </div>

                    {/* Filter Options */}
                    <div className="mb-4">
                        <h5 className="fw-bold">Filter Projects</h5>
                        <div className="d-flex flex-wrap gap-2">
                            <select className="form-select w-auto" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                                <option value="">📅 Year</option>
                                {years.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>

                            <select className="form-select w-auto" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                                <option value="">📂 Category</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>

                            <button className="btn btn-outline-danger" onClick={() => { setSelectedYear(""); setSelectedCategory(""); }}>
                                ❌ Reset Filters
                            </button>
                        </div>
                    </div>

                    {/* Project List - Modern Table Style */}
                    <div className="project-list-container">
                        {filteredProjects.length > 0 ? (
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Project Title</th>
                                        <th>Mentor</th>
                                        <th>Year</th>
                                        <th>Category</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProjects.map((project, index) => (
                                        <tr key={index}>
                                            <td>{project.title}</td>
                                            <td>{project.mentor}</td>
                                            <td>{project.year}</td>
                                            <td>{project.category}</td>
                                            <td>
                                                <button className="btn btn-primary btn-sm">📜 View Summary</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center text-muted">No projects found. Try adjusting the filters.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

<<<<<<< HEAD
export default StudentDashboard;

=======
export default StudentDashboard;
>>>>>>> f964dcad79e522c2f257446c8f42640a3e6ae2d3
