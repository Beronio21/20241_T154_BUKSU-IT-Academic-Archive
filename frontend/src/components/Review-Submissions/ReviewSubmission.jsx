import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React, { useState, useEffect } from "react";
import { Modal, Form, Container, Row, Col, Alert, ListGroup, Spinner } from "react-bootstrap";
import axios from "axios";

const ReviewSubmission = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ thesisId: "", comment: "", status: "pending" });
  const [userInfo, setUserInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [titleSearch, setTitleSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [yearSearch, setYearSearch] = useState("");
  const [categories] = useState(["IoT", "AI", "ML", "Sound", "Camera"]);
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i); // For last 10 years

  useEffect(() => {
    const data = localStorage.getItem("user-info");
    if (data) {
      setUserInfo(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
    if (userInfo?.email) {
      fetchSubmissions();
    }
  }, [userInfo]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/thesis/submissions/adviser?email=${encodeURIComponent(userInfo.email)}`);
      const data = await response.json();
      if (data.status === "success") {
        setSubmissions(data.data);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setError("There was an issue fetching the submissions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeedback = (submission) => {
    setFeedbackForm({ ...feedbackForm, thesisId: submission._id });
    setShowModal(true);
  };

  const handleSubmitFeedback = async () => {
    try {
      if (!feedbackForm.comment.trim()) {
        alert("Please enter feedback");
        return;
      }

      const userInfo = JSON.parse(localStorage.getItem("user-info"));
      await axios.post(
        `http://localhost:8080/api/thesis/feedback/${feedbackForm.thesisId}`,
        feedbackForm,
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      alert("Feedback submitted successfully");
      fetchSubmissions();
      setShowModal(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again later.");
    }
  };

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesTitle = submission.title.toLowerCase().includes(titleSearch.toLowerCase());
    const matchesCategory = categorySearch ? submission.category === categorySearch : true;
    const matchesYear = yearSearch ? new Date(submission.createdAt).getFullYear().toString() === yearSearch : true;
    return matchesTitle && matchesCategory && matchesYear;
  });

  return (
    <Container className="review-submission-container" style={{ textAlign: "right" }}>
      <header className="review-header mb-4">
        <h2>Review Thesis Submissions</h2>
      </header>

      {/* Search Bar Section */}
      <Row className="mb-4">
        <Col>
          <Form.Control
            type="text"
            placeholder="Search by title"
            value={titleSearch}
            onChange={(e) => setTitleSearch(e.target.value)}
          />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Form.Select value={yearSearch} onChange={(e) => setYearSearch(e.target.value)}>
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Select value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Loading/Error Messages */}
      {loading ? (
        <div className="loading-container text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <ListGroup>
          {filteredSubmissions.length === 0 ? (
            <ListGroup.Item variant="info">No submissions to review</ListGroup.Item>
          ) : (
            filteredSubmissions.map((submission) => (
              <ListGroup.Item key={submission._id} className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5>{submission.title}</h5>
                  <p>
                    <strong>Status:</strong> {submission.status}
                  </p>
                  <p>
                    <strong>Abstract:</strong> {submission.abstract}
                  </p>
                  <p>
                    <strong>Keywords:</strong> {submission.keywords.join(", ")}
                  </p>
                  <p>
                    <strong>Members:</strong> {submission.members.join(", ")}
                  </p>
                  <p>
                    <strong>Submitted:</strong> {new Date(submission.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <a href={submission.docsLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary mb-2">
                    View Document
                  </a>
                  <button
                    className="btn btn-link"
                    onClick={() => handleAddFeedback(submission)}
                  >
                    Add Feedback
                  </button>
                </div>
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      )}

      {/* Feedback Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} className="feedback-modal">
        <Modal.Header closeButton>
          <Modal.Title>Provide Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Your Feedback</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={feedbackForm.comment}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                placeholder="Enter feedback here..."
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={feedbackForm.status}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, status: e.target.value })}
                required
              >
                <option value="pending">Pending</option>
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
                <option value="revision">Needs Revision</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={handleSubmitFeedback} className="btn btn-primary" disabled={!feedbackForm.comment.trim()}>
            Submit Feedback
          </button>
          <button onClick={() => setShowModal(false)} className="btn btn-secondary">
            Cancel
          </button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ReviewSubmission;
