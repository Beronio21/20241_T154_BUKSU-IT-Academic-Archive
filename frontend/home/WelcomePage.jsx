import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, Form, Row, Col, Card, Spinner } from "react-bootstrap";
import { FaSearch, FaCalendarAlt } from "react-icons/fa";
import axios from 'axios';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [approvedCapstones, setApprovedCapstones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch approved capstones (same as StudentDashboard)
  useEffect(() => {
    const fetchApprovedCapstones = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/thesis/approved');
        if (response.data.status === 'success') {
          setApprovedCapstones(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching approved capstones:', error);
        setError('Failed to load research papers');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedCapstones();
  }, []);

  // Filter capstones based on search term, year, and category
  const filteredCapstones = approvedCapstones.filter(capstone => {
    const matchesTitle = capstone.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAuthor = capstone.members?.some(member => 
      member.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesYear = !selectedYear || 
      new Date(capstone.createdAt).getFullYear() === parseInt(selectedYear);
    const matchesCategory = selectedCategory === "All" || 
      capstone.category === selectedCategory;

    return (matchesTitle || matchesAuthor) && matchesYear && matchesCategory;
  });

  // Generate year options from available capstones
  const yearOptions = Array.from(
    new Set(
      approvedCapstones.map(capstone => 
        new Date(capstone.createdAt).getFullYear()
      )
    )
  ).sort((a, b) => b - a);

  // Extract unique categories from capstones
  const categories = ["All", ...new Set(
    approvedCapstones.map(capstone => capstone.category).filter(Boolean)
  )];

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      {/* Top Navigation Bar */}
      <Navbar bg="light" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand href="/" className="fw-bold">
            BUKSU IT Archive
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav>
              <Button 
                variant="outline-primary" 
                className="me-2"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button 
                variant="primary"
                onClick={() => navigate("/register")}
              >
                Sign Up
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content - Research Archive */}
      <main className="flex-grow-1 py-5 bg-light">
        <Container>
          {/* Research Archive Header */}
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold mb-3">Research Archive</h1>
            <p className="lead text-muted">
              Explore approved research papers and capstone projects
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white p-4 rounded shadow-sm mb-5">
            <Row className="g-3">
              <Col md={6}>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    placeholder="Search by title or author"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted" />
                </div>
              </Col>
              <Col md={3}>
                <Form.Select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="">Select Year</option>
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </div>

          {/* Research Items */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <div className="alert alert-danger">{error}</div>
              <Button variant="outline-primary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : filteredCapstones.length === 0 ? (
            <div className="text-center py-5">
              <h5>No research papers found</h5>
              <p className="text-muted">Try adjusting your search or filters</p>
            </div>
          ) : (
            <Row className="g-4">
              {filteredCapstones.map(capstone => (
                <Col key={capstone._id} md={6} lg={4}>
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <Card.Title>{capstone.title}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        {capstone.category} • {new Date(capstone.createdAt).getFullYear()}
                      </Card.Subtitle>
                      <Card.Text className="text-truncate">
                        {capstone.abstract}
                      </Card.Text>
                      {capstone.members?.length > 0 && (
                        <div className="d-flex flex-wrap gap-1 mb-3">
                          {capstone.members.slice(0, 3).map((member, index) => (
                            <span key={index} className="badge bg-light text-dark">
                              {member}
                            </span>
                          ))}
                          {capstone.members.length > 3 && (
                            <span className="badge bg-light text-dark">
                              +{capstone.members.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </Card.Body>
                    <Card.Footer className="bg-transparent">
                      <Button 
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/research/${capstone._id}`)}
                      >
                        View Details
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 border-top">
        <Container className="text-center text-muted">
          <p>© {new Date().getFullYear()} BUKSU IT Academic Archive</p>
        </Container>
      </footer>
    </div>
  );
};

export default WelcomePage;