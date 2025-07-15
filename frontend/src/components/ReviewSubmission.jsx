import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Table, InputGroup, Form, Pagination, Card, Badge } from 'react-bootstrap';
import { FaSearch, FaFileAlt, FaComment, FaCalendarAlt, FaFilter } from 'react-icons/fa';
import Select from 'react-select';
import { FaChevronDown, FaRegCalendarAlt } from 'react-icons/fa';
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
    const [categorySearch, setCategorySearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categories] = useState(['IoT', 'AI', 'ML', 'Sound', 'Camera']);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [showFullAbstract, setShowFullAbstract] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState(null);
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 10 }, (_, i) => {
      const year = currentYear - i;
      return { value: year, label: year.toString() };
    });
    const categoryOptions = [
      { value: '', label: 'All Categories' },
      ...categories.map(cat => ({ value: cat, label: cat }))
    ];

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
        const matchesSearch =
            submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (Array.isArray(submission.members) && submission.members.some(member => member.toLowerCase().includes(searchTerm.toLowerCase())));
        const matchesYear = selectedYear ? new Date(submission.createdAt).getFullYear() === selectedYear.value : true;
        const matchesCategory = categorySearch ? submission.category === categorySearch : true;
        const matchesStatus = statusFilter ? submission.status === statusFilter : true;
        return matchesSearch && matchesYear && matchesCategory && matchesStatus;
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
                            <h3 className="mb-0">View Capstone Project Submissions</h3>  
                        </div>
                        <div className="card-body p-3" style={{ 
                            height: 'calc(100% - 60px)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* Filter Section - Unified Search, Modern, Responsive, with Status Dropdown */}
                            <div className="search-filter" style={{
                                background: '#fff',
                                padding: '16px 18px',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                marginBottom: 0,
                                width: '100%',
                                maxWidth: 1200,
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                zIndex: 2,
                            }}>
                                <div
                                    className="filter-row"
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'nowrap',
                                        gap: 16,
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                    }}
                                >
                                    {/* Unified Search Bar */}
                                    <div style={{ flex: 2, minWidth: 0, maxWidth: '50%', position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <FaSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 18, pointerEvents: 'none' }} />
                                        <input
                                            type="text"
                                            placeholder="Search by Title or Member Name"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="filter-input"
                                            style={{
                                                paddingLeft: 40,
                                                width: '100%',
                                                height: 40,
                                                borderRadius: 10,
                                                border: '1.2px solid #e5e7eb',
                                                boxShadow: '0 1px 4px rgba(30,41,59,0.04)',
                                                fontSize: '1rem',
                                                color: '#334155',
                                                background: '#f8fafc',
                                                outline: 'none',
                                                transition: 'border 0.18s, box-shadow 0.18s',
                                            }}
                                            aria-label="Search by Title or Member Name"
                                        />
                                    </div>
                                    {/* Select Year */}
                                    <div style={{ flex: 1, minWidth: 0, maxWidth: '25%', zIndex: 3 }}>
                                        <Select
                                            options={yearOptions}
                                            value={selectedYear}
                                            onChange={setSelectedYear}
                                            placeholder={<span style={{ color: '#64748b' }}><FaRegCalendarAlt style={{ marginRight: 6, marginBottom: -2 }} />Select Year</span>}
                                            isClearable
                                            classNamePrefix="filter-select"
                                            menuPortalTarget={document.body}
                                            styles={{
                                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                            }}
                                        />
                                    </div>
                                    {/* Category Dropdown */}
                                    <div style={{ flex: 1, minWidth: 0, maxWidth: '25%', zIndex: 3 }}>
                                        <Select
                                            options={categoryOptions}
                                            value={categoryOptions.find(opt => opt.value === categorySearch) || categoryOptions[0]}
                                            onChange={opt => setCategorySearch(opt.value)}
                                            placeholder={<span style={{ color: '#64748b' }}><FaChevronDown style={{ marginRight: 6, marginBottom: -2 }} />All Categories</span>}
                                            isSearchable={false}
                                            classNamePrefix="filter-select"
                                            menuPortalTarget={document.body}
                                            styles={{
                                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                            }}
                                        />
                                    </div>
                                    {/* Status Dropdown */}
                                    <div style={{ flex: 1, minWidth: 0, maxWidth: '25%', zIndex: 3 }}>
                                        <Select
                                            options={[
                                                { value: '', label: 'All Status' },
                                                { value: 'pending', label: 'Pending' },
                                                { value: 'approved', label: 'Approved' },
                                                { value: 'rejected', label: 'Rejected' },
                                                { value: 'revision', label: 'Revision' },
                                            ]}
                                            value={(() => {
                                                const opts = [
                                                    { value: '', label: 'All Status' },
                                                    { value: 'pending', label: 'Pending' },
                                                    { value: 'approved', label: 'Approved' },
                                                    { value: 'rejected', label: 'Rejected' },
                                                    { value: 'revision', label: 'Revision' },
                                                ];
                                                return opts.find(opt => opt.value === statusFilter) || opts[0];
                                            })()}
                                            onChange={opt => setStatusFilter(opt.value)}
                                            placeholder={<span style={{ color: '#64748b' }}><FaChevronDown style={{ marginRight: 6, marginBottom: -2 }} />All Status</span>}
                                            isSearchable={false}
                                            classNamePrefix="filter-select"
                                            menuPortalTarget={document.body}
                                            styles={{
                                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                            }}
                                        />
                                    </div>
                                </div>
                                {/* Responsive: stack on small screens */}
                                <style>{`
                                    .filter-input {
                                        width: 100%;
                                        height: 40px;
                                        padding: 0 14px 0 40px;
                                        border-radius: 10px;
                                        border: 1.2px solid #e5e7eb;
                                        box-shadow: 0 1px 4px rgba(30,41,59,0.04);
                                        font-size: 1rem;
                                        color: #334155;
                                        background: #f8fafc;
                                        outline: none;
                                        transition: border 0.18s, box-shadow 0.18s;
                                    }
                                    .filter-input:focus, .filter-input:hover {
                                        border-color: #2563eb;
                                        box-shadow: 0 2px 8px rgba(37,99,235,0.10);
                                    }
                                    .filter-select__control {
                                        min-height: 40px !important;
                                        height: 40px !important;
                                        border-radius: 10px !important;
                                        border-color: #e5e7eb !important;
                                        box-shadow: 0 1px 4px rgba(30,41,59,0.04) !important;
                                        background: #f8fafc !important;
                                        font-size: 1rem !important;
                                        outline: none !important;
                                        transition: border 0.18s !important;
                                    }
                                    .filter-select__control--is-focused, .filter-select__control:hover {
                                        border-color: #2563eb !important;
                                        box-shadow: 0 2px 8px rgba(37,99,235,0.10) !important;
                                    }
                                    .filter-select__value-container {
                                        height: 40px !important;
                                        padding: 0 8px !important;
                                    }
                                    .filter-select__input {
                                        margin: 0 !important;
                                        padding: 0 !important;
                                    }
                                    .filter-select__indicators {
                                        height: 40px !important;
                                    }
                                    .filter-select__placeholder {
                                        color: #64748b !important;
                                        font-weight: 500 !important;
                                    }
                                    .filter-select__dropdown-indicator {
                                        color: #64748b !important;
                                        padding-right: 6px !important;
                                    }
                                    @media (max-width: 900px) {
                                        .filter-row { flex-wrap: wrap !important; flex-direction: row !important; gap: 10px !important; }
                                        .filter-row > div { flex: 1 1 48% !important; max-width: 48% !important; min-width: 0 !important; }
                                    }
                                    @media (max-width: 600px) {
                                        .filter-row { flex-direction: column !important; gap: 10px !important; align-items: stretch !important; }
                                        .filter-row > div { max-width: 100% !important; min-width: 0 !important; flex: 1 1 100% !important; }
                                    }
                                `}</style>
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
                                                    className="btn btn-view-file px-4 py-2 fw-bold shadow-sm"
                                                    style={{ borderRadius: 6, fontSize: '1rem' }}
                                                    aria-label="View file in new tab"
                                                >
                                                    View File
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                        <div className="custom-modal-footer d-flex justify-content-end">
                            <button 
                                className="btn btn-close-modal-square"
                                onClick={() => setSelectedSubmission(null)}
                                style={{
                                  width: 96,
                                  height: 48,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  borderRadius: 8,
                                  background: '#2563eb',
                                  color: '#fff',
                                  border: 'none',
                                  fontSize: 18,
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
                                  transition: 'background 0.2s, box-shadow 0.2s, transform 0.12s',
                                  outline: 'none',
                                  marginRight: 0
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.background = '#174ea6';
                                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.13)';
                                  e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.background = '#2563eb';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.10)';
                                  e.currentTarget.style.transform = 'none';
                                }}
                                onFocus={e => {
                                  e.currentTarget.style.outline = '2px solid #174ea6';
                                  e.currentTarget.style.background = '#174ea6';
                                }}
                                onBlur={e => {
                                  e.currentTarget.style.outline = 'none';
                                  e.currentTarget.style.background = '#2563eb';
                                }}
                                aria-label="Close submission details modal"
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