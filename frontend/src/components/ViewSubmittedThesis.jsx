import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import StudentNavbar from '../Navbar/Student-Navbar/StudentNavbar';

const ViewSubmittedThesis = () => {
    const [theses, setTheses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState("docs"); // Track active section

    useEffect(() => {
        fetchSubmittedTheses();
    }, []);

    const fetchSubmittedTheses = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            if (!userInfo?.token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`http://localhost:8080/api/thesis/student-submissions/${encodeURIComponent(userInfo.email)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch submitted theses');
            }

            const data = await response.json();
            console.log('Fetched theses:', data); // Debugging log
            if (data.status === 'success') {
                setTheses(data.data || []);
            } else {
                throw new Error(data.message || 'Failed to fetch theses');
            }
        } catch (error) {
            console.error('Error fetching theses:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (thesisId) => {
        if (!window.confirm('Are you sure you want to delete this thesis?')) {
            return;
        }

        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const response = await fetch(`http://localhost:8080/api/thesis/${thesisId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.status === 'success') {
                alert('Thesis deleted successfully');
                fetchSubmittedTheses();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error deleting thesis:', error);
            alert('Failed to delete thesis: ' + error.message);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderFeedback = (feedback) => {
        if (!feedback || feedback.length === 0) return null;
        
        
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-warning';
            case 'approved':
                return 'bg-success';
            case 'rejected':
                return 'bg-danger';
            case 'revision needed':
                return 'bg-info';
            default:
                return 'bg-secondary';
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger m-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
            </div>
        );
    }

    return (
        <div className="d-flex">
            <StudentNavbar activeSection={activeSection} handleSectionChange={setActiveSection} />
            <div className="flex-grow-1">
                <div className="container" style={{ marginTop: '100px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="mb-0">My Submitted Theses</h2>
                        <div className="d-flex gap-2 align-items-center">
                            <Link to="/student-dashboard/submit-thesis" className="btn btn-primary">
                                <i className="bi bi-plus-lg me-2"></i>
                                Submit New Thesis
                            </Link>
                            <button 
                                className="btn btn-outline-primary"
                                onClick={fetchSubmittedTheses}
                            >
                                <i className="bi bi-arrow-clockwise me-2"></i>
                                Refresh
                            </button>
                        </div>
                    </div>

                    {theses.length === 0 ? (
                        <div className="text-center p-5 bg-light rounded-3">
                            <i className="bi bi-file-earmark-text display-1 text-muted mb-3"></i>
                            <h3 className="text-muted">No Theses Submitted Yet</h3>
                            <p className="text-muted mb-4">Start your academic journey by submitting your first thesis.</p>
                            <Link to="/student-dashboard/submit-thesis" className="btn btn-primary">
                                <i className="bi bi-plus-lg me-2"></i>
                                Submit New Thesis
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover border">
                                <thead className="table-light">
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
                                    {theses.map((thesis) => (
                                        <React.Fragment key={thesis._id}>
                                            <tr>
                                                <td className="fw-bold">{thesis.title}</td>
                                                <td>{thesis.members.join(', ')}</td>
                                                <td>{thesis.adviserEmail}</td>
                                                <td>{formatDate(thesis.createdAt || thesis.submissionDate)}</td>
                                                <td>
                                                    <span className={`badge ${getStatusBadgeClass(thesis.status)}`}>
                                                        {thesis.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="btn-group">
                                                        <a 
                                                            href={thesis.docsLink} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="btn btn-sm btn-primary"
                                                        >
                                                            <i className="bi bi-file-text me-1"></i>
                                                            View
                                                        </a>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDelete(thesis._id)}
                                                            disabled={thesis.status === 'approved'}
                                                        >
                                                            <i className="bi bi-trash me-1"></i>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {thesis.feedback && thesis.feedback.length > 0 && (
                                                <tr>
                                                    <td colSpan="6" className="bg-light">
                                                        <div className="p-3">
                                                            <h6 className="mb-3">
                                                                <i className="bi bi-chat-left-text me-2"></i>
                                                                Feedback History
                                                            </h6>
                                                            {renderFeedback(thesis.feedback)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewSubmittedThesis;