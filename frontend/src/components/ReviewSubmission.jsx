import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReviewSubmission.css';

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

    const handleSubmitFeedback = async () => {
        try {
            if (!feedback.comment.trim()) {
                alert('Please enter feedback comment');
                return;
            }

            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            await axios.post(
                `http://localhost:8080/api/thesis/feedback/${selectedSubmission._id}`,
                feedback,
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
        }
    };

    return (
        <div className="review-submission-container">
            <header className="review-header">
                <h2>Review Thesis Submissions</h2>
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
                                            <a 
                                                href={submission.docsLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-view"
                                            >
                                                View
                                            </a>
                                            <button 
                                                className="btn-feedback"
                                                onClick={() => setFeedbackForm({ ...feedbackForm, thesisId: submission._id })}
                                            >
                                                Add Feedback
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {selectedSubmission && (
                        <div className="feedback-modal">
                            <div className="feedback-content">
                                <h3>Submit Feedback</h3>
                                <textarea
                                    value={feedback.comment}
                                    onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
                                    placeholder="Enter your feedback..."
                                    rows="4"
                                    required
                                />
                                <select
                                    value={feedback.status}
                                    onChange={(e) => setFeedback({...feedback, status: e.target.value})}
                                    required
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approve</option>
                                    <option value="rejected">Reject</option>
                                    <option value="revision">Needs Revision</option>
                                </select>
                                <div className="button-group">
                                    <button 
                                        onClick={handleSubmitFeedback}
                                        className="btn-submit"
                                        disabled={!feedback.comment.trim()}
                                    >
                                        Submit Feedback
                                    </button>
                                    <button 
                                        onClick={() => setSelectedSubmission(null)}
                                        className="btn-cancel"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default ReviewSubmission; 