import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal } from 'react-bootstrap';

const ReviewSubmission = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
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
        try {
            const response = await fetch(`http://localhost:8080/api/thesis/submissions/adviser?email=${encodeURIComponent(userInfo.email)}`);
            const data = await response.json();

            if (data.status === 'success') {
                setSubmissions(data.data);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setError('There was an issue fetching the submissions. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewSubmission = (submission) => {
        setSelectedSubmission(submission);
        setFeedbackForm({
            ...feedbackForm,
            thesisId: submission._id
        });
    };

    const handleAddFeedback = (submission) => {
        setFeedbackForm({ ...feedbackForm, thesisId: submission._id });
        setShowModal(true);
    };

    const handleSubmitFeedback = async () => {
        try {
            if (!feedbackForm.comment.trim()) {
                alert('Please enter feedback');
                return;
            }

            const userInfo = JSON.parse(localStorage.getItem('user-info'));
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
            setShowModal(false);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again later.');
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
        <div className="review-submission-container">
            <header className="review-header">
                <h2>Review Thesis Submissions</h2>
            </header>

            {/* Search Bar Section */}
            <div className="d-flex justify-content-between mb-4">
                <div className="d-flex align-items-center">
                    <input
                        type="text"
                        className="form-control me-2"
                        placeholder="Search by title"
                        value={titleSearch}
                        onChange={(e) => setTitleSearch(e.target.value)}
                    />
                    <input
                        type="date"
                        className="form-control me-2"
                        value={dateSearch}
                        onChange={(e) => setDateSearch(e.target.value)}
                    />
                    <select
                        className="form-control"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                    >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Loading/Error Messages */}
            {loading ? (
                <div className="loading-container">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading thesis submissions...</p>
                </div>
            ) : error ? (
                <div className="error-message alert alert-danger">
                    {error} 
                    <button onClick={fetchSubmissions} className="btn btn-link">Retry</button>
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-md-3 g-4">
                    {filteredSubmissions.length === 0 ? (
                        <div className="col-12">
                            <div className="no-submissions text-center">
                                <i className="bi bi-inbox text-muted"></i>
                                <p>No submissions to review</p>
                            </div>
                        </div>
                    ) : (
                        filteredSubmissions.map((submission) => (
                            <div key={submission._id} className="col">
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h5 className="card-title">{submission.title}</h5>
                                        <span
                                            className="badge text-bg-primary"
                                            style={{ backgroundColor: getStatusColor(submission.status) }}
                                        >
                                            {submission.status}
                                        </span>
                                        <p className="card-text mt-3">{submission.abstract}</p>
                                    </div>
                                    <div className="card-footer d-flex justify-content-between">
                                        <a
                                            href={submission.docsLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-link"
                                        >
                                            <i className="bi bi-eye-fill me-2"></i> View Document
                                        </a>
                                        <button
                                            className="btn btn-link"
                                            onClick={() => handleAddFeedback(submission)}
                                        >
                                            <i className="bi bi-chat-left-text-fill me-2"></i> Add Feedback
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Feedback Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} className="feedback-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Provide Feedback</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="feedback-form">
                        <div className="form-group">
                            <label>Your Feedback</label>
                            <textarea
                                value={feedbackForm.comment}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                                placeholder="Enter feedback here..."
                                rows="4"
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={feedbackForm.status}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, status: e.target.value })}
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
                        className="btn btn-primary"
                        disabled={!feedbackForm.comment.trim()}
                    >
                        Submit Feedback
                    </button>
                    <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                        Cancel
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReviewSubmission;