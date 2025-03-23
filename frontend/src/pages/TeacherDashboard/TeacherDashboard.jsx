import React, { useEffect, useState, useMemo } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import { useNavigate } from "react-router-dom";
import TeacherNavbar from "../../Navbar/TeacherNavbar";
import TeacherTopBar from "../../Topbar/TeacherTopbar/TeacherTopbar";

const projectData = [
    { title: "AI for Climate Change", mentor: "Bill Gates", year: "2023", category: "Mobile Apps" },
    { title: "E-commerce Platform", mentor: "Tim Cook", year: "2022", category: "Web Apps" },
    { title: "Blockchain Voting System", mentor: "Elon Musk", year: "2021", category: "Databases" },
    { title: "AR Training App", mentor: "Sundar Pichai", year: "2020", category: "Mobile Apps" },
];

const TeacherDashboard = () => {
    const [userInfo, setUser] = useState(null);
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
        if (userData?.role !== "teacher" || !userData.token) {
            navigate("/login", { replace: true });
            return;
        }
        setUser (userData);
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
            <TeacherNavbar activeSection="dashboard" handleSectionChange={() => {}} />
            <div className="flex-grow-1">
                <TeacherTopBar userInfo={userInfo} />
                <div className="container mt-5" style={{ marginTop: "90px" }}>
                    <div className="mb-4 text-center">
                        <h1 className="fw-bold">Capstone IT Projects</h1>
                        <p className="text-secondary">
                            Explore and review IT capstone projects. Use the search bar or filters to find specific projects.
                        </p>
                    </div>

                    <div className="mb-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by project title or mentor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search projects"
                        />
                    </div>

                    <div className="mb-4">
                        <h5 className="fw-bold">Filter Options</h5>
                        <div className="d-flex align-items-center gap-2">
                            <select className="form-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                                <option value="">Year</option>
                                {years.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>

                            <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                                <option value="">Category</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>

                            <button className="btn btn-outline-secondary" onClick={() => { setSelectedYear(""); setSelectedCategory(""); }}>
                                Reset Filters
                            </button>
                        </div>
                    </div>

                    <div className="row">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project, index) => (
                                <div key={index} className="col-md-6 col-lg-4 mb-4">
                                    <div className="card shadow border-0" style={{ transition: "0.3s" }}>
                                        <div className="card-body">
                                            <h5 className="card-title fw-bold">{project.title}</h5>
                                            <p className="card-text">Mentor: {project.mentor}</p>
                                            <button className="btn btn-outline-primary">Review Project</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-secondary">No projects found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;