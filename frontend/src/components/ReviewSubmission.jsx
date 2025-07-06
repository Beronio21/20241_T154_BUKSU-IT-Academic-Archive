import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Table, InputGroup, Form, Pagination, Card, Badge } from 'react-bootstrap';
import { FaSearch, FaFileAlt, FaComment, FaCalendarAlt, FaFilter } from 'react-icons/fa';
import '../Styles/ReviewSubmission.css';

const ViewSubmission = () => {
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
    const [memberSearch, setMemberSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categories] = useState(['IoT', 'AI', 'ML', 'Sound', 'Camera']);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [showFullAbstract, setShowFullAbstract] = useState(false);

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
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            if (!userInfo?.email) {
                setError('User email not found');
                return;
            }

            const response = await fetch(
                `http://localhost:8080/api/thesis/student-submissions/${encodeURIComponent(userInfo.email)}`
            );
            const data = await response.json();
            
            if (data.status === 'success') {
                // Sort submissions by createdAt in descending order (most recent first)
                const sortedSubmissions = data.data.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setSubmissions(sortedSubmissions);
            } else {
                setError(data.message || 'Failed to fetch submissions');
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
            pending: 'warning',
            approved: 'success',
            rejected: 'danger',
            revision: 'info'
        };
        return colors[status.toLowerCase()] || 'secondary';
    };

    const filteredSubmissions = submissions.filter(submission => {
        const matchesTitle = submission.title.toLowerCase().includes(titleSearch.toLowerCase());
        const matchesDate = dateSearch ? new Date(submission.createdAt).toLocaleDateString() === new Date(dateSearch).toLocaleDateString() : true;
        const matchesCategory = categorySearch ? submission.category === categorySearch : true;
        const matchesMember = memberSearch ? submission.members.some(member => 
            member.toLowerCase().includes(memberSearch.toLowerCase())
        ) : true;
        const matchesStatus = statusFilter ? submission.status === statusFilter : true;

        return matchesTitle && matchesDate && matchesCategory && matchesMember && matchesStatus;
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSubmissions = filteredSubmissions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderPagination = () => {
        let items = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            items.push(
                <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
                    1
                </Pagination.Item>
            );
            if (startPage > 2) {
                items.push(<Pagination.Ellipsis key="start-ellipsis" />);
            }
        }

        for (let number = startPage; number <= endPage; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => handlePageChange(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                items.push(<Pagination.Ellipsis key="end-ellipsis" />);
            }
            items.push(
                <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
                    {totalPages}
                </Pagination.Item>
            );
        }

        return (
            <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="d-flex align-items-center">
                    <span className="me-2">Page {currentPage} of {totalPages}</span>
                    <span className="me-2">|</span>
                    <span>Total Items: {filteredSubmissions.length}</span>
                </div>
                <Pagination className="mb-0">
                    <Pagination.Prev
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    />
                    {items}
                    <Pagination.Next
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                    />
                </Pagination>
            </div>
        );
    };

    return (
        <div className="container-fluid" style={{ 
            minWidth: '1200px',
            minHeight: '100vh',
            padding: '15px',
            overflow: 'hidden'
        }}>
            <div className="row h-100">
                <div className="col-12 h-100">
                    <div className="card shadow h-100">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-2" style={{ minHeight: '60px' }}>
                            <h3 className="mb-0">View Capstone Research Paper Submissions</h3>
                        </div>
                        <div className="card-body p-3" style={{ 
                            height: 'calc(100% - 60px)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div className="row mb-3">
                                <div className="col-md-3">
                                    <InputGroup>
                                        <InputGroup.Text>
                                            <FaSearch />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by title..."
                                            value={titleSearch}
                                            onChange={(e) => setTitleSearch(e.target.value)}
                                        />
                                    </InputGroup>
                                </div>
                                <div className="col-md-3">
                                    <InputGroup>
                                        <InputGroup.Text>
                                            <FaSearch />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by member name..."
                                            value={memberSearch}
                                            onChange={(e) => setMemberSearch(e.target.value)}
                                        />
                                    </InputGroup>
                                </div>
                                <div className="col-md-2">
                                    <InputGroup>
                                        <InputGroup.Text>
                                            <FaCalendarAlt />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="date"
                                            value={dateSearch}
                                            onChange={(e) => setDateSearch(e.target.value)}
                                        />
                                    </InputGroup>
                                </div>
                                <div className="col-md-2">
                                    <InputGroup>
                                        <InputGroup.Text>
                                            <FaFilter />
                                        </InputGroup.Text>
                                        <Form.Select
                                            value={categorySearch}
                                            onChange={(e) => setCategorySearch(e.target.value)}
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </Form.Select>
                                    </InputGroup>
                                </div>
                                <div className="col-md-2">
                                    <InputGroup>
                                        <InputGroup.Text>
                                            <FaFilter />
                                        </InputGroup.Text>
                                        <Form.Select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                            <option value="revision">Revision</option>
                                        </Form.Select>
                                    </InputGroup>
                                </div>
                            </div>

                            {loading ? (
                                <div className="d-flex justify-content-center align-items-center" style={{ flex: 1 }}>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            ) : (
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div className="table-responsive" style={{ 
                                        maxHeight: 'calc(100vh - 300px)', 
                                        minHeight: 'calc(100vh - 300px)',
                                        minWidth: '1100px',
                                        overflow: 'auto'
                                    }}>
                                        <Table striped bordered hover className="mt-3 mb-0">
                                            <thead className="table-dark position-sticky top-0" style={{ zIndex: 1 }}>
                                                <tr>
                                                    <th style={{ width: '200px' }}>Title</th>
                                                    <th style={{ width: '150px' }}>Category</th>
                                                    <th style={{ width: '150px' }}>Members</th>
                                                    <th style={{ width: '150px' }}>Submitted Date</th>
                                                    <th style={{ width: '100px' }}>Status</th>
                                                    <th style={{ width: '150px' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentSubmissions.map((submission) => (
                                                    <tr key={submission._id}>
                                                        <td>{submission.title}</td>
                                                        <td>{submission.category}</td>
                                                        <td>{Array.isArray(submission.members) ? submission.members.join(', ') : 'No members'}</td>
                                                        <td>{new Date(submission.createdAt).toLocaleDateString()}</td>
                                                        <td>
                                                            <Badge bg={getStatusColor(submission.status)}>
                                                                {submission.status}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <Button
                                                                variant="info"
                                                                size="sm"
                                                                className="me-2"
                                                                onClick={() => handleViewSubmission(submission)}
                                                            >
                                                                <FaFileAlt />
                                                            </Button>
                                                            
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                    <div className="mt-2" style={{ minHeight: '40px' }}>
                                        {renderPagination()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton={false} className="bg-primary text-white">
                    <Modal.Title>Submit Feedback</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="mb-3">
                                <label className="form-label required">Feedback Comment</label>
                                <textarea
                                    className="form-control"
                                    value={feedbackForm.comment}
                                    onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                                    placeholder="Enter your feedback..."
                                    rows="4"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label required">Status</label>
                                <select
                                    className="form-select"
                                    value={feedbackForm.status}
                                    onChange={(e) => setFeedbackForm({ ...feedbackForm, status: e.target.value })}
                                    required
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approve</option>
                                    <option value="rejected">Reject</option>
                                    <option value="revision">Needs Revision</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSubmitFeedback}
                        disabled={!feedbackForm.comment.trim()}
                    >
                        Submit Feedback
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* View Submission Modal */}
            {selectedSubmission && (
                <div className={`custom-modal ${selectedSubmission ? 'show' : ''}`} onClick={() => setSelectedSubmission(null)}>
                    <div className="custom-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 820, width: '95%' }}>
                        <div className="custom-modal-header bg-gradient-primary text-white d-flex justify-content-between align-items-center">
                            <h3 className="mb-0 fw-semibold" style={{ letterSpacing: '0.5px' }}>Submission Details</h3>
                            <button onClick={() => setSelectedSubmission(null)} className="close-button" aria-label="Close submission details modal">
                                &times;
                            </button>
                        </div>
                        <div className="custom-modal-body p-0">
                            {/* Submission Details Section */}
                            <section className="w-100" aria-label="Submission Details">
                                <div className="bg-white shadow-sm rounded-4 p-4 mb-3" style={{ maxWidth: 820, margin: '0 auto' }}>
                                    <div className="row g-3">
                                        <div className="col-md-12 mb-2">
                                            <label className="fw-bold text-secondary" htmlFor="submission-title">Title</label>
                                            <div id="submission-title" className="fs-5 text-dark fw-semibold" style={{ wordBreak: 'break-word' }}>{selectedSubmission.title}</div>
                                        </div>
                                        <div className="col-md-12 mb-2">
                                            <label className="fw-bold text-secondary" htmlFor="submission-abstract">Abstract</label>
                                            <div id="submission-abstract" className="text-dark" style={{ wordBreak: 'break-word', position: 'relative' }}>
                                                {showFullAbstract ? selectedSubmission.abstract :
                                                    selectedSubmission.abstract.length > 220
                                                        ? <>
                                                            {selectedSubmission.abstract.slice(0, 220)}...{' '}
                                                            <button type="button" className="btn btn-link p-0 align-baseline" style={{ fontSize: '1rem' }} onClick={() => setShowFullAbstract(true)} aria-label="Read full abstract">Read more</button>
                                                        </>
                                                        : selectedSubmission.abstract
                                                }
                                                {showFullAbstract && selectedSubmission.abstract.length > 220 && (
                                                    <button type="button" className="btn btn-link p-0 align-baseline ms-2" style={{ fontSize: '1rem' }} onClick={() => setShowFullAbstract(false)} aria-label="Show less">Show less</button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <label className="fw-bold text-secondary">Category</label>
                                            <div className="text-dark">{selectedSubmission.category}</div>
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <label className="fw-bold text-secondary">Teacher's Email</label>
                                            <div>
                                                <a href={`mailto:${selectedSubmission.email}`} className="text-primary text-decoration-underline" style={{ wordBreak: 'break-all' }}>{selectedSubmission.email}</a>
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <label className="fw-bold text-secondary">Members</label>
                                            <ul className="mb-0 ps-3" style={{ listStyle: 'disc', color: '#333', fontSize: '1rem' }}>
                                                {selectedSubmission.members && selectedSubmission.members.map((member, idx) => (
                                                    <li key={idx}>{member}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <label className="fw-bold text-secondary">Keywords</label>
                                            <div className="d-flex flex-wrap gap-2">
                                                {selectedSubmission.keywords && selectedSubmission.keywords.map((kw, idx) => (
                                                    <span key={idx} className="badge bg-info text-dark fw-normal" style={{ fontSize: '0.95rem', background: '#e3f2fd' }}>{kw}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            {/* Submitted Document Section - No Inline Preview */}
                            {selectedSubmission.docsLink && (
                                <section className="mb-4 w-100" aria-label="Submitted Document">
                                    <div className="d-flex flex-column align-items-center justify-content-center w-100">
                                        <div className="d-flex w-100 justify-content-between align-items-center mb-2 px-4">
                                            <h5 className="mb-0 fw-semibold" style={{ letterSpacing: '0.5px' }}>Submitted Document</h5>
                                            <div className="d-flex gap-2">
                                                <a
                                                    href={selectedSubmission.docsLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-primary px-4 py-2 fw-bold shadow-sm"
                                                    style={{ borderRadius: 6, fontSize: '1rem' }}
                                                    aria-label="View file in new tab"
                                                >
                                                    View File in New Tab
                                                </a>
                                                <a
                                                    href={selectedSubmission.docsLink}
                                                    download
                                                    className="btn btn-outline-primary px-4 py-2 fw-bold shadow-sm"
                                                    style={{ borderRadius: 6, fontSize: '1rem' }}
                                                    aria-label="Download file"
                                                >
                                                    Download File
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                        <div className="custom-modal-footer d-flex justify-content-end">
                            <button 
                                className="btn btn-secondary"
                                onClick={() => setSelectedSubmission(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewSubmission; 