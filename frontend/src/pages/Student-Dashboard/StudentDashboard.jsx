<<<<<<< HEAD
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import StudentProfile from "../../Profile/StudentProfile";
import SubmitThesis from "../../components/SubmitThesis";
import Docs from "../../components/Docs";
import Calendar from "../../components/Calendar";
import SendGmail from "../../Communication/SendGmail";
import ScheduleTable from "../../components/ScheduleTable";
import Topbar from "../../Topbar/Student-Topbar/StudentTopbar";
import StudentNavbar from "../../Navbar/Student-Navbar/StudentNavbar";
import { Button, Container, Row, Col, Table, Alert, Dropdown } from "react-bootstrap";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [userInfo, setUserInfo] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();
  const location = useLocation();

  // Ensure user authentication
  useEffect(() => {
    const data = localStorage.getItem("user-info");
    if (!data) {
      navigate("/login");
      return;
    }
    const userData = JSON.parse(data);
    if (userData?.role !== "student" || !userData.token) {
      navigate("/login");
      return;
    }
    setUserInfo(userData);

    if (location.pathname === "/student-dashboard") {
      navigate("/student-dashboard/dashboard");
    }
  }, [navigate, location]);

  // Fetch submissions
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const userInfo = JSON.parse(localStorage.getItem("user-info"));
      if (!userInfo || !userInfo.email) {
        throw new Error("User  info not found");
      }

      const response = await fetch(
        `http://localhost:8080/api/thesis/student-submissions/${encodeURIComponent(userInfo.email)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch submissions");
      }

      const data = await response.json();
      if (data.status === "success") {
        setSubmissions(data.data);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login", { replace: true });
    }
  };

  // Filter submissions based on search term and status
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearchTerm =
      submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.members.some((member) =>
        member.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "All" || submission.status === statusFilter;

    return matchesSearchTerm && matchesStatus;
  });

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <StudentProfile userInfo={userInfo} />;
      case "submit-thesis":
        return <SubmitThesis />;
      case "dashboard":
      default:
        return (
          <Container>
            <h2 className="text-left mb-4">Capstone Archive</h2>

            {/* Search Bar and Filters */}
            <Row className="mb-3 justify-content-center">
              <Col md={4}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col md={4}>
                <Dropdown>
                  <Dropdown.Toggle variant="success" id="dropdown-basic">
                    {statusFilter}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setStatusFilter("All")}>All</Dropdown.Item>
                    <Dropdown.Item onClick={() => setStatusFilter("approved")}>Approved</Dropdown.Item>
                    <Dropdown.Item onClick={() => setStatusFilter("pending")}>Pending</Dropdown.Item>
                    <Dropdown.Item onClick={() => setStatusFilter("rejected")}>Rejected</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            </Row>

            {/* Submissions Table */}
            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : filteredSubmissions.length === 0 ? (
              <Alert variant="info">No submissions found</Alert>
            ) : (
              <div className="table-responsive">
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Members</th>
                      <th>Adviser</th>
                      <th>Submission Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((submission) => (
                      <tr key={submission._id}>
                        <td>{submission.title}</td>
                        <td>{submission.members.join(", ")}</td>
                        <td>{submission.adviserEmail}</td>
                        <td>{new Date(submission.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge bg-${submission.status === "approved" ? "success" : "warning"}`}>
                            {submission.status}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex justify-content-between">
                            <a
                              href={submission.docsLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary btn-sm"
                            >
                              View
                            </a>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(submission._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Container>
        );
    }
  };

  return (
    <div className="d-flex flex-column" style={{ height: "100vh" }}>
      {/* Topbar */}
      <Topbar userInfo={userInfo} />

      {/* Navbar */}
      <StudentNavbar activeSection={activeSection} handleSectionChange={setActiveSection} />

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ marginLeft: "250px", marginTop: "60px" }}>
        <Routes>
          <Route path="/dashboard" element={renderContent()} />
          <Route path="/profile" element={<StudentProfile userInfo={userInfo} />} />
          <Route path="/submit-thesis" element={<SubmitThesis />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/send-gmail" element={<SendGmail />} />
          <Route path="/schedule" element={<ScheduleTable />} />
          <Route path="*" element={<Navigate to="/student-dashboard/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;
=======
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

export default StudentDashboard;
>>>>>>> 0bd4427c7055338431092cdd4fd9689cfd1a57a9
