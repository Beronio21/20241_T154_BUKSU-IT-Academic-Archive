import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import StudentProfile from "../../Profile/StudentProfile";
import SubmitThesis from "../../components/SubmitThesis";
import Docs from "../../components/Docs";
import Calendar from "../../components/Calendar";
import SendGmail from "../../Communication/SendGmail";
import ScheduleTable from "../../components/ScheduleTable";
import Topbar from "../../Topbar/Student-Topbar/StudentTopbar";
import StudentNavbar from "../../Navbar/Student-Navbar/StudentNavbar";
import { Button, Container, Row, Col, Table, Alert } from "react-bootstrap";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [userInfo, setUserInfo] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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
        throw new Error("User info not found");
      }

      const response = await fetch(
        `http://localhost:8080/api/thesis/student-submissions/${encodeURIComponent(
          userInfo.email
        )}`
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

  // Filter submissions based on search term
  const filteredSubmissions = submissions.filter(
    (submission) =>
      submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.members.some((member) =>
        member.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

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

            {/* Search Bar */}
            <Row className="mb-3 justify-content-center">
              <Col md={8} className="d-flex">
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Search by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="primary">Search</Button>
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
                        <span
                          className={`badge bg-${
                            submission.status === "approved"
                              ? "success"
                              : "warning"
                          }`}
                        >
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
      <StudentNavbar
        activeSection={activeSection}
        handleSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <div
        className="flex-grow-1 p-4"
        style={{ marginLeft: "250px", marginTop: "60px" }}
      >
        <Routes>
          <Route path="/dashboard" element={renderContent()} />
          <Route path="/profile" element={<StudentProfile userInfo={userInfo} />} />
          <Route path="/submit-thesis" element={<SubmitThesis />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/send-gmail" element={<SendGmail />} />
          <Route path="/schedule" element={<ScheduleTable />} />
          {/* Redirect unknown routes */}
          <Route
            path="*"
            element={<Navigate to="/student-dashboard/dashboard" replace />}
          />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;
