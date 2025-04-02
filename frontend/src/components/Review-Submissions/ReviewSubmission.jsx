import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Spinner, Alert, Container, Row, Col, Form, Card } from 'react-bootstrap';
import './ReviewSubmission.css'; // Ensure you have this CSS file for custom styles

const ReviewSubmission = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feedbackForm, setFeedbackForm] = useState({ thesisId: '', comment: '', status: 'pending' });
    const [userInfo, setUserInfo] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [titleSearch, setTitleSearch] = useState('');
    const [dateSearch, setDateSearch] = useState('');
    const [categorySearch, setCategorySearch] = useState('');
    const [categories] = useState(['IoT', 'AI', 'ML', 'Sound', 'Camera']);

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
            const response = await fetch(
                `http://localhost:8080/api/thesis/submissions/adviser?email=${encodeURIComponent(userInfo.email)}`
            );
            const data = await response.json();
            if (data.status === 'success') {
                setSubmissions(data.data);
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
                        'Authorization': `Bearer ${userInfo.token}`
                    }
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
            revision: '#2196f3'
        };
        return colors[status.toLowerCase()] || '#757575';
    };

    const filteredSubmissions = submissions.filter(submission => {
        const matchesTitle = submission.title.toLowerCase().includes(titleSearch.toLowerCase());
        const matchesDate = dateSearch ? new Date(submission.createdAt).toLocaleDateString() === new Date(dateSearch).toLocaleDateString() : true;
        const matchesCategory = categorySearch ? submission.category === categorySearch : true;

        return matchesTitle && matchesDate && matchesCategory;
    });

    return (
        <Container fluid className="review-submission-container vh-100">
            <header className="text-center mb-4">
                <h2>Review Capstone Research Paper Submissions</h2>
            </header>

            <div className="search-bar mb-4">
                <Row>
                    <Col md={4}>
                        <Form.Control
                            type="text"
                            placeholder="Search by title"
                            value={titleSearch}
                            onChange={(e) => setTitleSearch(e.target.value)}
                        />
                    </Col>
                    <Col md={4}>
                        <Form.Control
                            type="date"
                            value={dateSearch}
                            onChange={(e) => setDateSearch(e.target.value)}
                        />
                    </Col>
                    <Col md={4}>
                        <Form.Select
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
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
                <Row>
                    {filteredSubmissions.length === 0 ? (
                        <Col className="text-center">
                            <i className="bi bi-inbox text-muted" style={{ fontSize: '2rem' }}></i>
                            <p>No submissions to review</p>
                        </Col>
                    ) : (
                        filteredSubmissions.map((submission) => (
                            <Col md={4} key={submission._id} className="mb-4">
                                <Card className="shadow-sm border-light">
                                    <Card.Body>
                                        <Card.Title className="text-primary">{submission.title}</Card.Title>
                                        <Card.Text><strong>Status:</strong> <span style={{ color: getStatusColor(submission.status) }}>{submission.status}</span></Card.Text>
                                        <Card.Text><strong>Abstract:</strong> {submission.abstract}</Card.Text>
                                        <Card.Text><strong>Keywords:</strong> {submission.keywords.join(', ')}</Card.Text>
                                        <Card.Text><strong>Members:</strong> {submission.members.join(', ')}</Card.Text>
                                        <Card.Text><strong>Submitted:</strong> {new Date(submission.createdAt).toLocaleDateString()}</Card.Text>
                                        <a href={submission.docsLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary w-100">View Document</a>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    )}
                </Row>
            )}

                <Modal show={showModal} onHide={() => setShowModal(false)} className="feedback-modal" size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Submit Feedback</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="feedback-form">
                            <div className="mb-3">
                                <label>Your Feedback</label>
                                <textarea
                                    value={feedbackForm.comment}
                                    onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                                    placeholder="Enter your feedback..."
                                    rows="6" // Increased rows for a larger textarea
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label>Status</label>
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
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button 
                            onClick={handleSubmitFeedback} 
                            variant="primary" 
                            disabled={!feedbackForm.comment.trim()}
                        >
                            Submit Feedback
                        </Button>
                        <Button 
                            onClick={() => setShowModal(false)} 
                            variant="secondary"
                        >
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>
        </Container>
    );
};

export default ReviewSubmission;