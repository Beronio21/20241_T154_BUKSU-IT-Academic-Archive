import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Card, Alert, Spinner, Row, Col, Form } from 'react-bootstrap';
import './ReviewSubmission.css';

const ReviewSubmission = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    thesisId: '',
    comment: '',
    status: 'pending',
  });
  const [showModal, setShowModal] = useState(false);
  const [titleSearch, setTitleSearch] = useState('');
  const [dateSearch, setDateSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [categories] = useState(['IoT', 'AI', 'ML', 'Sound', 'Camera']);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('user-info');
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
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/thesis/submissions/adviser?email=${encodeURIComponent(userInfo.email)}`
      );
      if (response.data.status === 'success') {
        setSubmissions(response.data.data);
      } else {
        setError('Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to fetch submissions');
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
        alert('Please enter feedback comment');
        return;
      }

      await axios.post(
        `http://localhost:8080/api/thesis/feedback/${feedbackForm.thesisId}`,
        feedbackForm,
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      alert('Feedback submitted successfully');
      fetchSubmissions();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback');
    } finally {
      setShowModal(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      approved: '#4caf50',
      rejected: '#f44336',
      revision: '#2196f3',
    };
    return colors[status.toLowerCase()] || '#757575';
  };

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesTitle = submission.title.toLowerCase().includes(titleSearch.toLowerCase());
    const matchesDate = dateSearch
      ? new Date(submission.createdAt).toLocaleDateString() === new Date(dateSearch).toLocaleDateString()
      : true;
    const matchesCategory = categorySearch ? submission.category === categorySearch : true;

    return matchesTitle && matchesDate && matchesCategory;
  });

  return (
    <div className="review-submission-container">
      <header className="review-header">
        <h2>Review Capstone Research Paper Submissions</h2>
      </header>

      <div className="search-bar mb-4">
        <Row className="mb-3">
          <Col>
            <Form.Control
              type="text"
              placeholder="Search by title"
              value={titleSearch}
              onChange={(e) => setTitleSearch(e.target.value)}
              className="long-search"
            />
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={3} lg={2}>
            <Form.Select value={dateSearch} onChange={(e) => setDateSearch(e.target.value)}>
              <option value="">All Dates</option>
            </Form.Select>
          </Col>
          <Col md={3} lg={2}>
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
      </div>

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      ) : (
        <div className="submissions-list grid">
          {filteredSubmissions.length === 0 ? (
            <Alert variant="info" className="text-center">
              No submissions to review
            </Alert>
          ) : (
            filteredSubmissions.map((submission) => (
              <div className="submission-card" key={submission._id}>
                <Card className="shadow-sm border-light">
                  <Card.Body>
                    <Card.Title className="text-primary">{submission.title}</Card.Title>
                    <Card.Text>
                      <strong>Status:</strong>{' '}
                      <span style={{ color: getStatusColor(submission.status) }}>
                        {submission.status}
                      </span>
                    </Card.Text>
                    <Card.Text>
                      <strong>Abstract:</strong> {submission.abstract}
                    </Card.Text>
                    <Card.Text>
                      <strong>Keywords:</strong> {submission.keywords.join(', ')}
                    </Card.Text>
                    <Card.Text>
                      <strong>Members:</strong> {submission.members.join(', ')}
                    </Card.Text>
                    <Card.Text>
                      <strong>Submitted:</strong>{' '}
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </Card.Text>
                    <div className="d-flex justify-content-between">
                      <a
                        href={submission.docsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary"
                      >
                        View Document
                      </a>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => handleAddFeedback(submission)}
                      >
                        Add Feedback
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))
          )}
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} className="feedback-modal">
        <Modal.Header closeButton>
          <Modal.Title>Submit Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="feedback-form">
            <div className="form-group">
              <label>Your Feedback</label>
              <textarea
                value={feedbackForm.comment}
                onChange={(e) =>
                  setFeedbackForm({ ...feedbackForm, comment: e.target.value })
                }
                placeholder="Enter your feedback..."
                rows="4"
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={feedbackForm.status}
                onChange={(e) =>
                  setFeedbackForm({ ...feedbackForm, status: e.target.value })
                }
                className="form-control"
                required
              >
                <option value="pending">Pending</option>
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
                <option value="revision">Needs Revision</option>
              </select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={handleSubmitFeedback}
            className="btn-submit"
            disabled={!feedbackForm.comment.trim()}
          >
            Submit Feedback
          </button>
          <button
            onClick={() => setShowModal(false)}
            className="btn-cancel"
          >
            Cancel
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReviewSubmission;
