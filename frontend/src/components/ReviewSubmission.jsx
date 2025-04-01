import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Styles/ReviewSubmission.css';
import { Modal } from 'react-bootstrap';

const ReviewSubmission = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [feedback, setFeedback] = useState({
        comment: '',
        status: 'pending'
    });
    const [userInfo, setUserInfo] = useState(null);
    const [feedbackForm, setFeedbackForm] = useState({ thesisId: '', comment: '', status: '' });
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
            const response = await fetch(
                `http://localhost:8080/api/thesis/submissions/adviser?email=${encodeURIComponent(userInfo.email)}`
            );
            const data = await response.json();
            
            if (data.status === 'success') {
                setSubmissions(data.data);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setError('Failed to fetch submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleViewSubmission = (submission) => {
        setSelectedSubmission(submission);
        setFeedback({
            comment: '',
            status: 'pending'
        });
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
            setSelectedSubmission(null);
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
        <div className="review-submission-container">
            <header className="review-header">
                <h2>Review Capstone Research Paper Submissions</h2>
            </header>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by title"
                    value={titleSearch}
                    onChange={(e) => setTitleSearch(e.target.value)}
                />
                <input
                    type="date"
                    value={dateSearch}
                    onChange={(e) => setDateSearch(e.target.value)}
                />
               
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="error-message">
                    {error}
                </div>
            ) : (
                <div className="submissions-grid">
                    {filteredSubmissions.length === 0 ? (
                        <div className="no-submissions">
                            <i className="bi bi-inbox text-muted"></i>
                            <p>No submissions to review</p>
                        </div>
                    ) : (
                        filteredSubmissions.map((submission) => (
                            <div key={submission._id} className="submission-card">
                                <div className="submission-header">
                                    <h3>{submission.title}</h3>
                                    <span 
                                        className="status-badge"
                                        style={{ backgroundColor: getStatusColor(submission.status) }}
                                    >
                                        {submission.status}
                                    </span>
                                </div>
                                <div className="submission-content">
                                    <div className="info-group">
                                        <label>Abstract:</label>
                                        <p className="abstract-text">{submission.abstract}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Keywords:</label>
                                        <p className="keywords-list">{submission.keywords ? submission.keywords.join(', ') : 'No keywords available'}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Members:</label>
                                        <p>{submission.members ? submission.members.join(', ') : 'No members listed'}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Student Email:</label>
                                        <p>{submission.email || 'N/A'}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Submitted:</label>
                                        <p>{new Date(submission.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Objective:</label>
                                        <p>{submission.objective || 'No objective available'}</p>
                                    </div>
                                </div>
                                <div className="submission-actions">
                                    <a 
                                        href={submission.docsLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-view"
                                    >
                                        <i className="bi bi-eye-fill me-2"></i>
                                        View Document
                                    </a>
                                    <button 
                                        className="btn-feedback"
                                        onClick={() => handleAddFeedback(submission)}
                                    >
                                        <i className="bi bi-chat-left-text-fill me-2"></i>
                                        Add Feedback
                                    </button>
                                </div>
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
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
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