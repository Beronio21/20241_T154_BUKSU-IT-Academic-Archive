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

    return (
        <div className="review-submission-container">
            <header className="review-header">
                <h2>Review Capstone Research Paper Submissions</h2>
            </header>

            {loading ? (
                <p>Loading submissions...</p>
            ) : (
                <section className="submissions-section">
                    <table className="submissions-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Members</th>
                                <th>Student Email</th>
                                <th>Submission Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{textAlign: 'center'}}>
                                        No submissions to review
                                    </td>
                                </tr>
                            ) : (
                                submissions.map((submission) => (
                                    <tr key={submission._id}>
                                        <td>{submission.title}</td>
                                        <td>{submission.members.join(', ')}</td>
                                        <td>{submission.email || 'N/A'}</td>
                                        <td>{new Date(submission.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-${submission.status.toLowerCase()}`}>
                                                {submission.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <a 
                                                    href={submission.docsLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-primary btn-md me-2"
                                                >
                                                    View
                                                </a>
                                                <button 
                                                    className="btn btn-secondary btn-md"
                                                    onClick={() => handleAddFeedback(submission)}
                                                >
                                                    Add Feedback
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <Modal show={showModal} onHide={() => setShowModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Submit Feedback</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <textarea
                                value={feedbackForm.comment}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                                placeholder="Enter your feedback..."
                                rows="4"
                                required
                            />
                            <select
                                value={feedbackForm.status}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, status: e.target.value })}
                                required
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approve</option>
                                <option value="rejected">Reject</option>
                                <option value="revision">Needs Revision</option>
                            </select>
                        </Modal.Body>
                        <Modal.Footer>
                            <button onClick={handleSubmitFeedback} className="btn-submit" disabled={!feedbackForm.comment.trim()}>
                                Submit Feedback
                            </button>
                            <button onClick={() => setShowModal(false)} className="btn-cancel">
                                Cancel
                            </button>
                        </Modal.Footer>
                    </Modal>
                </section>
            )}
        </div>
    );
};

export default ReviewSubmission; 