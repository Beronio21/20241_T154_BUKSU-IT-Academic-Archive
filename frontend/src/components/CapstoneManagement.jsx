import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Table, InputGroup, Form, Pagination, Card, Badge, Alert } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaExclamationTriangle, FaFileAlt, FaUser, FaKey, FaEnvelope, FaLink, FaInfoCircle, FaTimes, FaFolder, FaUserTie, FaCheckCircle, FaClipboardCheck, FaExclamationCircle, FaClock, FaSave, FaCheck, FaHistory } from 'react-icons/fa';

const CapstoneManagement = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        abstract: '',
        keywords: [''],
        members: [''],
        adviserEmail: '',
        docsLink: '',
        email: '',
        category: '',
        id: null,
        objective: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [showObjectiveModal, setShowObjectiveModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({
        status: '',
        comments: '',
        reviewedBy: '',
        reviewDate: new Date(),
    });
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [successIcon, setSuccessIcon] = useState(null);
    const [successTitle, setSuccessTitle] = useState('');
    const [reviewErrors, setReviewErrors] = useState({
        comments: '',
        reviewedBy: ''
    });
    const [showRevisionHistoryModal, setShowRevisionHistoryModal] = useState(false);
    const [revisionHistory, setRevisionHistory] = useState([]);
    const [revisionHistoryLoading, setRevisionHistoryLoading] = useState(false);
    const [revisionCurrentPage, setRevisionCurrentPage] = useState(1);
    const [revisionTotalPages, setRevisionTotalPages] = useState(1);

    const categories = ['IoT', 'AI', 'ML', 'Sound', 'Camera'];

    const statusStyles = {
        statusContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '4px'
        },
        badge: {
            fontSize: '0.8rem',
            padding: '4px 8px',
            width: '100%',
            textAlign: 'center',
            textTransform: 'uppercase'
        },
        reviewerText: {
            fontSize: '0.75rem',
            color: '#6c757d',
            textAlign: 'center',
            whiteSpace: 'nowrap'
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/thesis/submissions');
            const data = await response.json();
            if (data.status === 'success') {
                // Sort submissions by createdAt in descending order (most recent first)
                const sortedSubmissions = data.data.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setSubmissions(sortedSubmissions);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e, index = null) => {
        const { name, value } = e.target;

        if ((name === 'members' || name === 'keywords') && index !== null) {
            const updatedArray = [...formData[name]];
            updatedArray[index] = value;
            setFormData(prev => ({
                ...prev,
                [name]: updatedArray
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const addMember = () => {
        setFormData(prev => ({
            ...prev,
            members: [...prev.members, '']
        }));
    };

    const removeMember = (index) => {
        setFormData(prev => ({
            ...prev,
            members: prev.members.filter((_, i) => i !== index)
        }));
    };

    const addKeyword = () => {
        setFormData(prev => ({
            ...prev,
            keywords: [...prev.keywords, '']
        }));
    };

    const removeKeyword = (index) => {
        setFormData(prev => ({
            ...prev,
            keywords: prev.keywords.filter((_, i) => i !== index)
        }));
    };

    const showSuccess = (title, message, icon = <FaCheckCircle className="text-success" size={48} />) => {
        setSuccessTitle(title);
        setSuccessMessage(message);
        setSuccessIcon(icon);
        setShowSuccessModal(true);
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            setShowSuccessModal(false);
        }, 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate required fields
        if (!formData.title.trim()) {
            setError('Research Title is required');
            return;
        }
        if (!formData.objective.trim()) {
            setError('Research Objective is required');
            return;
        }
        if (!formData.abstract.trim()) {
            setError('Abstract is required');
            return;
        }
        if (!formData.category) {
            setError('Category is required');
            return;
        }
        if (!formData.members[0].trim()) {
            setError('At least one member is required');
            return;
        }
        if (!formData.keywords[0].trim()) {
            setError('At least one keyword is required');
            return;
        }
        if (!formData.adviserEmail.trim()) {
            setError('Adviser Email is required');
            return;
        }
        if (!formData.docsLink.trim()) {
            setError('Document Link is required');
            return;
        }

        try {
            if (isEditing) {
                await axios.put(`http://localhost:8080/api/thesis/${formData.id}`, formData);
                showSuccess(
                    'Research Updated',
                    'The research paper has been successfully updated.',
                    <FaEdit className="text-primary" size={48} />
                );
            } else {
                await axios.post('http://localhost:8080/api/thesis/submit', formData);
                showSuccess(
                    'Research Added',
                    'The research paper has been successfully added.',
                    <FaPlus className="text-success" size={48} />
                );
            }
            fetchSubmissions();
            resetForm();
            setShowEditModal(false);
        } catch (error) {
            console.error('Error submitting thesis:', error);
            setError(error.response?.data?.message || 'Failed to submit thesis. Please try again.');
        }
    };

    const handleEdit = (submission) => {
        setFormData({
            title: submission.title,
            abstract: submission.abstract,
            keywords: submission.keywords,
            members: submission.members,
            adviserEmail: submission.adviserEmail,
            docsLink: submission.docsLink,
            email: submission.email,
            category: submission.category,
            id: submission._id,
            objective: submission.objective,
        });
        setIsEditing(true);
        setShowEditModal(true);
    };

    const handleDelete = async () => {
        if (selectedSubmission) {
            try {
                await axios.delete(`http://localhost:8080/api/thesis/delete/${selectedSubmission._id}`);
                showSuccess(
                    'Research Deleted',
                    'The research paper has been successfully deleted.',
                    <FaTrash className="text-danger" size={48} />
                );
                fetchSubmissions();
                setShowDeleteModal(false);
                setSelectedSubmission(null);
            } catch (error) {
                console.error('Error deleting thesis:', error);
                setError(error.response?.data?.message || 'Failed to delete thesis. Please try again.');
            }
        }
    };

    const confirmDelete = (submission) => {
        // Ensure members array exists
        const submissionWithMembers = {
            ...submission,
            members: submission.members || []
        };
        setSelectedSubmission(submissionWithMembers);
        setShowDeleteModal(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            abstract: '',
            keywords: [''],
            members: [''],
            adviserEmail: '',
            docsLink: '',
            email: '',
            category: '',
            id: null,
            objective: '',
        });
        setIsEditing(false);
    };

    // Filter and pagination logic
    const filteredSubmissions = submissions.filter(submission =>
        submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(submission.members) && submission.members.some(member => 
            member.toLowerCase().includes(searchTerm.toLowerCase())
        ))
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSubmissions = filteredSubmissions.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        const pages = Math.ceil(filteredSubmissions.length / itemsPerPage);
        setTotalPages(pages);
    }, [filteredSubmissions, itemsPerPage]);

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

    const fetchRevisionHistory = async (thesisId) => {
        try {
            setRevisionHistoryLoading(true);
            const response = await axios.get(
                `http://localhost:8080/api/thesis/submissions/${thesisId}/reviews?page=${revisionCurrentPage}&limit=5`
            );
            
            if (response.data.status === 'success') {
                setRevisionHistory(response.data.data.feedback.items);
                setRevisionTotalPages(response.data.data.feedback.pagination.pages);
            }
        } catch (error) {
            console.error('Error fetching revision history:', error);
            setError('Failed to fetch revision history');
        } finally {
            setRevisionHistoryLoading(false);
        }
    };

    const handleReview = async (submission) => {
        setSelectedSubmission(submission);
        setReviewData({
            status: submission.status || 'pending',
            comments: submission.reviewComments || '',
            reviewedBy: submission.reviewedBy || '',
            reviewDate: submission.reviewDate ? new Date(submission.reviewDate) : new Date(),
        });
        
        // Fetch revision history when opening review modal
        await fetchRevisionHistory(submission._id);
        setShowReviewModal(true);
    };

    const renderStatusBadge = (status, reviewedBy = null) => {
        let badgeProps = {
            bg: 'info',
            icon: <FaClock className="me-1" size={12} />,
            text: 'PENDING'
        };

        switch(status?.toLowerCase()) {
            case 'approved':
                badgeProps = {
                    bg: 'success',
                    icon: <FaCheckCircle className="me-1" size={12} />,
                    text: 'APPROVED'
                };
                break;
            case 'rejected':
                badgeProps = {
                    bg: 'danger',
                    icon: <FaTimes className="me-1" size={12} />,
                    text: 'REJECTED'
                };
                break;
            case 'revision':
                badgeProps = {
                    bg: 'warning',
                    icon: <FaExclamationCircle className="me-1" size={12} />,
                    text: 'NEEDS REVISION'
                };
                break;
            case 'pending':
                badgeProps = {
                    bg: 'info',
                    icon: <FaClock className="me-1" size={12} />,
                    text: 'UNDER REVIEW'
                };
                break;
        }

        return (
            <div style={statusStyles.statusContainer}>
                <Badge 
                    bg={badgeProps.bg}
                    style={statusStyles.badge}
                    className="d-flex align-items-center justify-content-center"
                >
                    {badgeProps.icon}
                    {badgeProps.text}
                </Badge>
                {reviewedBy && (
                    <div style={statusStyles.reviewerText}>
                        by {reviewedBy}
                    </div>
                )}
            </div>
        );
    };

    const validateReviewerName = (name) => {
        if (!name.trim()) {
            return 'Reviewer name is required';
        }
        if (name.trim().length < 3) {
            return 'Reviewer name must be at least 3 characters long';
        }
        if (!/^[a-zA-Z\s.]+$/.test(name)) {
            return 'Reviewer name should only contain letters, spaces, and dots';
        }
        return '';
    };

    const validateComments = (comments) => {
        if (!comments.trim()) {
            return 'Review comments are required';
        }
        if (comments.trim().length < 2) {
            return 'Review comments must be at least 10 characters long';
        }
        if (comments.length > 1000) {
            return 'Review comments cannot exceed 1000 characters';
        }
        return '';
    };

    const handleReviewInputChange = (field, value) => {
        setReviewData(prev => ({
            ...prev,
            [field]: value
        }));

        // Real-time validation
        if (field === 'reviewedBy') {
            setReviewErrors(prev => ({
                ...prev,
                reviewedBy: validateReviewerName(value)
            }));
        } else if (field === 'comments') {
            setReviewErrors(prev => ({
                ...prev,
                comments: validateComments(value)
            }));
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        // Validate all fields
        const commentsError = validateComments(reviewData.comments);
        const reviewerError = validateReviewerName(reviewData.reviewedBy);

        setReviewErrors({
            comments: commentsError,
            reviewedBy: reviewerError
        });

        if (commentsError || reviewerError || !reviewData.status) {
            setError('Please correct all errors before submitting.');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.put(
                `http://localhost:8080/api/thesis/submissions/${selectedSubmission._id}/status`,
                {
                    status: reviewData.status,
                    reviewComments: reviewData.comments,
                    reviewedBy: reviewData.reviewedBy,
                    reviewDate: reviewData.reviewDate.toISOString()
                }
            );

            if (response.data.status === 'success') {
                showSuccess(
                    'Review Submitted',
                    `The research paper has been successfully ${reviewData.status}.`,
                    reviewData.status === 'approved' ? 
                        <FaCheckCircle className="text-success" size={48} /> :
                        reviewData.status === 'rejected' ?
                        <FaTimes className="text-danger" size={48} /> :
                        <FaExclamationCircle className="text-warning" size={48} />
                );
                
                await fetchSubmissions();
                setShowReviewModal(false);
                setSelectedSubmission(null);
                setReviewData({
                    status: '',
                    comments: '',
                    reviewedBy: '',
                    reviewDate: new Date()
                });
                setReviewErrors({
                    comments: '',
                    reviewedBy: ''
                });
            } else {
                setError('Failed to update review. Please try again.');
            }
        } catch (error) {
            console.error('Error updating review:', error);
            setError(error.response?.data?.message || 'Failed to update review. Please try again.');
        } finally {
            setLoading(false);
        }
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
                            <h3 className="mb-0">Capstone Management</h3>
                            <div className="d-flex align-items-center">
                                <InputGroup style={{ width: '300px' }}>
                                    <InputGroup.Text>
                                        <FaSearch />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by title or members..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                                <Button 
                                    variant="light" 
                                    className="ms-3"
                                    onClick={() => {
                                        resetForm();
                                        setShowEditModal(true);
                                    }}
                                >
                                    Add New Research Paper
                                </Button>
                            </div>
                        </div>
                        <div className="card-body p-3" style={{ 
                            height: 'calc(100% - 60px)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {loading ? (
                                <div className="loading">Loading submissions...</div>
                            ) : (
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div className="table-responsive" style={{ 
                                        maxHeight: 'calc(100vh - 250px)', 
                                        minHeight: 'calc(100vh - 250px)',
                                        minWidth: '1100px',
                                        overflow: 'auto'
                                    }}>
                                        <Table striped bordered hover className="mt-3 mb-0">
                                            <thead className="table-dark position-sticky top-0" style={{ zIndex: 1 }}>
                                                <tr>
                                                    <th style={{ width: '25%', minWidth: '200px' }}>Title</th>
                                                    <th style={{ width: '25%', minWidth: '200px' }}>Objective</th>
                                                    <th style={{ width: '20%', minWidth: '200px' }}>Members</th>
                                                    <th style={{ width: '15%', minWidth: '150px' }}>Email</th>
                                                    <th style={{ width: '8%', minWidth: '100px' }}>Status</th>
                                                    <th style={{ width: '20%', minWidth: '300px' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentSubmissions.map((submission) => (
                                                    <tr key={submission._id}>
                                                        <td>
                                                            <div className="text-truncate" style={{ maxWidth: '200px' }} title={submission.title}>
                                                                {submission.title}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ position: 'relative' }}>
                                                                <div 
                                                                    className="objective-preview" 
                                                                    style={{ 
                                                                        maxWidth: '200px',
                                                                        maxHeight: '60px',
                                                                        overflow: 'hidden',
                                                                        position: 'relative'
                                                                    }}
                                                                >
                                                                    <p className="mb-0" style={{ fontSize: '0.9rem' }}>
                                                                        {submission.objective}
                                                                    </p>
                                                                    {submission.objective.length > 100 && (
                                                                        <div 
                                                                            className="objective-fade"
                                                                            style={{
                                                                                position: 'absolute',
                                                                                bottom: 0,
                                                                                left: 0,
                                                                                right: 0,
                                                                                height: '20px',
                                                                                background: 'linear-gradient(transparent, white)'
                                                                            }}
                                                                        />
                                                                    )}
                                                                </div>
                                                                {submission.objective.length > 100 && (
                                                                    <Button
                                                                        variant="link"
                                                                        size="sm"
                                                                        className="p-0 mt-1"
                                                                        onClick={() => {
                                                                            setSelectedSubmission(submission);
                                                                            setShowObjectiveModal(true);
                                                                        }}
                                                                        style={{ fontSize: '0.8rem' }}
                                                                    >
                                                                        Read More...
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="text-truncate" style={{ maxWidth: '200px' }} title={Array.isArray(submission.members) ? submission.members.join(', ') : 'No members'}>
                                                                {Array.isArray(submission.members) ? submission.members.join(', ') : 'No members'}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="text-truncate" style={{ maxWidth: '150px' }} title={submission.email}>
                                                                {submission.email}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {renderStatusBadge(submission.status, submission.reviewedBy)}
                                                            {submission.status === 'revision' && (
                                                                <Button
                                                                    variant="link"
                                                                    size="sm"
                                                                    className="p-0 mt-1 d-block"
                                                                    onClick={() => {
                                                                        setSelectedSubmission(submission);
                                                                        fetchRevisionHistory(submission._id);
                                                                        setShowRevisionHistoryModal(true);
                                                                    }}
                                                                >
                                                                    View History
                                                                </Button>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center justify-content-start gap-2">
                                                                <Button
                                                                    variant="outline-info"
                                                                    size="sm"
                                                                    className="d-inline-flex align-items-center justify-content-center"
                                                                    onClick={() => handleEdit(submission)}
                                                                    style={{
                                                                        minWidth: '90px',
                                                                        padding: '6px 12px',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.85rem',
                                                                        border: '1px solid #0dcaf0'
                                                                    }}
                                                                    title="Edit Research Paper"
                                                                >
                                                                    <FaEdit className="me-1" size={14} />
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    variant="outline-warning"
                                                                    size="sm"
                                                                    className="d-inline-flex align-items-center justify-content-center"
                                                                    onClick={() => handleReview(submission)}
                                                                    style={{
                                                                        minWidth: '90px',
                                                                        padding: '6px 12px',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.85rem',
                                                                        border: '1px solid #ffc107'
                                                                    }}
                                                                    title="Review Research Paper"
                                                                >
                                                                    <FaCheckCircle className="me-1" size={14} />
                                                                    Review
                                                                </Button>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    className="d-inline-flex align-items-center justify-content-center"
                                                                    onClick={() => confirmDelete(submission)}
                                                                    style={{
                                                                        minWidth: '90px',
                                                                        padding: '6px 12px',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.85rem',
                                                                        border: '1px solid #dc3545'
                                                                    }}
                                                                    title="Delete Research Paper"
                                                                >
                                                                    <FaTrash className="me-1" size={14} />
                                                                    Delete
                                                                </Button>
                                                            </div>
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

            {/* Delete Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="lg">
                <Modal.Header className="bg-danger text-white">
                    <Modal.Title>
                        <FaTrash className="me-2" />
                        Confirm Delete Research Paper
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="delete-confirmation-content">
                        <Alert variant="warning" className="mb-4">
                            <FaExclamationTriangle className="me-2" />
                            Are you sure you want to delete this research paper? This action cannot be undone.
                        </Alert>

                        {selectedSubmission && (
                            <div className="research-details">
                                <Card className="mb-3">
                                    <Card.Header className="bg-light">
                                        <h5 className="mb-0">Research Information</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <h6 className="text-muted mb-2">Title</h6>
                                                <p className="mb-3">{selectedSubmission.title}</p>
                                                
                                                <h6 className="text-muted mb-2">Category</h6>
                                                <p className="mb-3">
                                                    <Badge bg="info">{selectedSubmission.category}</Badge>
                                                </p>

                                                <h6 className="text-muted mb-2">Status</h6>
                                                <p className="mb-3">
                                                    {renderStatusBadge(selectedSubmission.status, selectedSubmission.reviewedBy)}
                                                </p>
                                            </div>
                                            <div className="col-md-6">
                                                <h6 className="text-muted mb-2">Members</h6>
                                                <p className="mb-3">
                                                    {selectedSubmission.members?.map((member, index) => (
                                                        <Badge 
                                                            key={index} 
                                                            bg="secondary" 
                                                            className="me-1 mb-1"
                                                        >
                                                            {member}
                                                        </Badge>
                                                    ))}
                                                </p>

                                                <h6 className="text-muted mb-2">Adviser Email</h6>
                                                <p className="mb-3">{selectedSubmission.adviserEmail}</p>

                                                <h6 className="text-muted mb-2">Submission Date</h6>
                                                <p className="mb-0">
                                                    {new Date(selectedSubmission.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <h6 className="text-muted mb-2">Objective</h6>
                                            <div className="objective-preview p-3 bg-light rounded">
                                                <p className="mb-0" style={{ lineHeight: '1.6', textAlign: 'justify' }}>
                                                    {selectedSubmission.objective}
                                                </p>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        <FaTrash className="me-2" />
                        Delete Research Paper
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit/Add Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="xl" centered>
                <Modal.Header closeButton={false} className="bg-primary text-white">
                    <Modal.Title>
                        {isEditing ? (
                            <>
                                <FaEdit className="me-2" />
                                Edit Research Paper
                            </>
                        ) : (
                            <>
                                <FaPlus className="me-2" />
                                Add New Research Paper
                            </>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6">
                                <Card className="mb-4">
                                    <Card.Header className="bg-light">
                                        <h6 className="mb-0">Basic Information</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="mb-3">
                                            <label className="form-label required">
                                                <FaFileAlt className="me-2" />
                                                Research Title
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                placeholder="Enter research title"
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label required">
                                                <FaFileAlt className="me-2" />
                                                Research Objective
                                            </label>
                                            <div className="objective-input-wrapper">
                                                <textarea
                                                    className="form-control"
                                                    name="objective"
                                                    value={formData.objective}
                                                    onChange={handleInputChange}
                                                    rows="5"
                                                    placeholder="Enter a clear and concise research objective that describes the main goal of your study..."
                                                    required
                                                    style={{ resize: 'vertical', minHeight: '120px' }}
                                                />
                                                <small className="text-muted mt-2 d-block">
                                                    <FaInfoCircle className="me-1" />
                                                    Write a clear, specific, and measurable objective that outlines the main purpose of your research.
                                                </small>
                                                <div className="mt-2 d-flex justify-content-between">
                                                    <small className="text-muted">
                                                        Characters: {formData.objective.length}
                                                    </small>
                                                    {formData.objective.length > 500 && (
                                                        <small className="text-warning">
                                                            <FaExclamationTriangle className="me-1" />
                                                            Consider making the objective more concise
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label required">
                                                <FaFileAlt className="me-2" />
                                                Abstract
                                            </label>
                                            <textarea
                                                className="form-control"
                                                name="abstract"
                                                value={formData.abstract}
                                                onChange={handleInputChange}
                                                rows="4"
                                                placeholder="Enter research abstract"
                                                required
                                            />
                                        </div>

                                        <div className="mb-0">
                                            <label className="form-label required">
                                                <FaFileAlt className="me-2" />
                                                Category
                                            </label>
                                            <select
                                                className="form-select"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select a category</option>
                                                {categories.map((cat) => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Card>
                                    <Card.Header className="bg-light">
                                        <h6 className="mb-0">Document Information</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="mb-3">
                                            <label className="form-label required">
                                                <FaEnvelope className="me-2" />
                                                Adviser Email
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="adviserEmail"
                                                value={formData.adviserEmail}
                                                onChange={handleInputChange}
                                                placeholder="Enter adviser's email"
                                                required
                                            />
                                        </div>

                                        <div className="mb-0">
                                            <label className="form-label required">
                                                <FaLink className="me-2" />
                                                Document Link
                                            </label>
                                            <input
                                                type="url"
                                                className="form-control"
                                                name="docsLink"
                                                value={formData.docsLink}
                                                onChange={handleInputChange}
                                                placeholder="Enter document link"
                                                required
                                            />
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>

                            <div className="col-md-6">
                                <Card className="mb-4">
                                    <Card.Header className="bg-light">
                                        <h6 className="mb-0">Team Members</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="members-container mb-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {formData.members.map((member, index) => (
                                                <div key={index} className="d-flex mb-2 align-items-center">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="members"
                                                        value={member}
                                                        onChange={(e) => handleInputChange(e, index)}
                                                        placeholder={`Member ${index + 1}`}
                                                        required
                                                    />
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        className="ms-2"
                                                        onClick={() => removeMember(index)}
                                                        disabled={formData.members.length === 1}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm" 
                                            onClick={addMember}
                                            className="w-100"
                                        >
                                            <FaPlus className="me-1" /> Add Member
                                        </Button>
                                    </Card.Body>
                                </Card>

                                <Card>
                                    <Card.Header className="bg-light">
                                        <h6 className="mb-0">Keywords</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="keywords-container mb-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {formData.keywords.map((keyword, index) => (
                                                <div key={index} className="d-flex mb-2 align-items-center">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="keywords"
                                                        value={keyword}
                                                        onChange={(e) => handleInputChange(e, index)}
                                                        placeholder={`Keyword ${index + 1}`}
                                                        required
                                                    />
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        className="ms-2"
                                                        onClick={() => removeKeyword(index)}
                                                        disabled={formData.keywords.length === 1}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm" 
                                            onClick={addKeyword}
                                            className="w-100"
                                        >
                                            <FaPlus className="me-1" /> Add Keyword
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </div>
                        </div>

                        {error && (
                            <Alert variant="danger" className="mt-4">
                                <FaExclamationTriangle className="me-2" />
                                {error}
                            </Alert>
                        )}

                        <div className="d-flex justify-content-end mt-4">
                            <Button 
                                variant="secondary" 
                                className="me-2" 
                                onClick={() => {
                                    setShowEditModal(false);
                                    resetForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="primary" 
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        {isEditing ? 'Updating...' : 'Submitting...'}
                                    </>
                                ) : (
                                    <>
                                        {isEditing ? (
                                            <>
                                                <FaEdit className="me-2" />
                                                Update Research Paper
                                            </>
                                        ) : (
                                            <>
                                                <FaPlus className="me-2" />
                                                Submit Research Paper
                                            </>
                                        )}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>

            {/* Objective View Modal */}
            <Modal 
                show={showObjectiveModal} 
                onHide={() => setShowObjectiveModal(false)}
                centered
                size="lg"
                backdrop="static"
                className="research-details-modal"
            >
                <Modal.Header className="bg-gradient-primary text-white border-0" 
                    style={{ 
                        borderRadius: '0',
                        background: 'linear-gradient(135deg, #0062cc 0%, #0044cc 100%)',
                        padding: '1.5rem'
                    }}
                >
                    <Modal.Title className="w-100">
                        <div className="d-flex align-items-center">
                            <div className="modal-icon-wrapper bg-white bg-opacity-25 rounded-circle p-2 me-3">
                                <FaFileAlt className="text-white" size={24} />
                            </div>
                            <div>
                                <h4 className="mb-1 fw-bold">Research Details</h4>
                                <p className="mb-0" style={{ fontSize: '0.95rem', opacity: '0.9', letterSpacing: '0.3px' }}>
                                    Comprehensive overview of the research paper
                                </p>
                            </div>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    {selectedSubmission && (
                        <div className="research-objective-detail">
                            {/* Title Section */}
                            <div className="p-4 bg-light border-bottom">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="research-title-section" style={{ maxWidth: '80%' }}>
                                        <h6 className="text-primary mb-3" style={{ letterSpacing: '0.5px', fontSize: '0.85rem', fontWeight: '600' }}>
                                            RESEARCH TITLE
                                        </h6>
                                        <h3 className="mb-0" style={{ 
                                            color: '#2c3e50', 
                                            lineHeight: '1.4',
                                            fontWeight: '700',
                                            letterSpacing: '0.2px'
                                        }}>
                                            {selectedSubmission.title}
                                        </h3>
                                    </div>
                                    <Badge 
                                        bg={selectedSubmission.status?.toLowerCase() === 'approved' ? 'success' : 'warning'}
                                        className="px-3 py-2 ms-3"
                                        style={{ fontSize: '0.9rem', minWidth: '100px', textAlign: 'center' }}
                                    >
                                        {selectedSubmission.status || 'Pending'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="p-4">
                                {/* Abstract Section */}
                                <div className="mb-4">
                                    <h6 className="text-primary mb-3" style={{ letterSpacing: '0.5px', fontSize: '0.85rem', fontWeight: '600' }}>
                                        ABSTRACT
                                    </h6>
                                    <div className="abstract-content p-4 bg-white rounded-3 border" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                        <p style={{ 
                                            lineHeight: '1.8', 
                                            textAlign: 'justify',
                                            color: '#2c3e50',
                                            fontSize: '1rem',
                                            marginBottom: '0'
                                        }}>
                                            {selectedSubmission.abstract}
                                        </p>
                                    </div>
                                </div>

                                {/* Objective Section */}
                                <div className="mb-4">
                                    <h6 className="text-primary mb-3" style={{ letterSpacing: '0.5px', fontSize: '0.85rem', fontWeight: '600' }}>
                                        RESEARCH OBJECTIVE
                                    </h6>
                                    <div className="objective-content p-4 bg-white rounded-3 border" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                        <p style={{ 
                                            lineHeight: '1.8', 
                                            textAlign: 'justify',
                                            color: '#2c3e50',
                                            fontSize: '1rem',
                                            marginBottom: '0'
                                        }}>
                                            {selectedSubmission.objective}
                                        </p>
                                    </div>
                                </div>

                                {/* Category and Keywords */}
                                <div className="row g-4 mb-4">
                                    <div className="col-md-4">
                                        <h6 className="text-primary mb-3" style={{ letterSpacing: '0.5px', fontSize: '0.85rem', fontWeight: '600' }}>
                                            CATEGORY
                                        </h6>
                                        <div className="category-card bg-white p-3 rounded-3 border d-flex align-items-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                            <div className="category-icon-wrapper bg-info bg-opacity-10 rounded-circle p-2 me-2">
                                                <FaFolder className="text-info" size={16} />
                                            </div>
                                            <span className="fw-medium" style={{ color: '#2c3e50', fontSize: '0.95rem' }}>
                                                {selectedSubmission.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-md-8">
                                        <h6 className="text-primary mb-3" style={{ letterSpacing: '0.5px', fontSize: '0.85rem', fontWeight: '600' }}>
                                            KEYWORDS
                                        </h6>
                                        <div className="keywords-card bg-white p-3 rounded-3 border" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                            {selectedSubmission.keywords?.map((keyword, index) => (
                                                <Badge 
                                                    key={index} 
                                                    bg="primary" 
                                                    className="me-2 mb-2 px-3 py-2"
                                                    style={{ 
                                                        fontSize: '0.85rem',
                                                        fontWeight: '500',
                                                        backgroundColor: '#3498db'
                                                    }}
                                                >
                                                    {keyword}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Team Section */}
                                <div className="team-section bg-light rounded-3 p-4 mb-4">
                                    <h6 className="text-primary mb-3" style={{ letterSpacing: '0.5px', fontSize: '0.85rem' }}>
                                        RESEARCH TEAM
                                    </h6>
                                    <div className="row g-3">
                                        {selectedSubmission.members?.map((member, index) => (
                                            <div key={index} className="col-md-6">
                                                <div className="member-card bg-white rounded-3 p-3 border d-flex align-items-center">
                                                    <div className="member-avatar bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                                        <FaUser className="text-primary" size={16} />
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0" style={{ color: '#2c3e50' }}>{member}</h6>
                                                        <small className="text-muted">Team Member</small>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Adviser Section */}
                                {selectedSubmission.adviserEmail && (
                                    <div className="adviser-section">
                                        <h6 className="text-primary mb-3" style={{ letterSpacing: '0.5px', fontSize: '0.85rem' }}>
                                            RESEARCH ADVISER
                                        </h6>
                                        <div className="adviser-card bg-light rounded-3 p-3 border d-flex align-items-center">
                                            <div className="adviser-avatar bg-success bg-opacity-10 rounded-circle p-2 me-3">
                                                <FaUserTie className="text-success" size={16} />
                                            </div>
                                            <div>
                                                <h6 className="mb-1" style={{ color: '#2c3e50' }}>Research Adviser</h6>
                                                <a 
                                                    href={`mailto:${selectedSubmission.adviserEmail}`}
                                                    className="text-decoration-none d-flex align-items-center"
                                                    style={{ color: '#3498db' }}
                                                >
                                                    <FaEnvelope className="me-2" size={14} />
                                                    {selectedSubmission.adviserEmail}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons Section */}
                                <div className="action-buttons-section mt-4">
                                    <h6 className="text-primary mb-3" style={{ letterSpacing: '0.5px', fontSize: '0.85rem', fontWeight: '600' }}>
                                        ACTIONS
                                    </h6>
                                    <div className="action-buttons-container bg-white p-4 rounded-3 border" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <Button
                                                    variant="outline-primary"
                                                    className="w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                                                    onClick={() => handleEdit(selectedSubmission)}
                                                    style={{
                                                        borderWidth: '2px',
                                                        transition: 'all 0.2s ease',
                                                        fontSize: '0.95rem'
                                                    }}
                                                >
                                                    <FaEdit size={16} />
                                                    <span>Edit Research</span>
                                                </Button>
                                            </div>
                                            <div className="col-md-4">
                                                <Button
                                                    variant="outline-warning"
                                                    className="w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                                                    onClick={() => {
                                                        setShowObjectiveModal(false);
                                                        handleReview(selectedSubmission);
                                                    }}
                                                    style={{
                                                        borderWidth: '2px',
                                                        transition: 'all 0.2s ease',
                                                        fontSize: '0.95rem'
                                                    }}
                                                >
                                                    <FaClipboardCheck size={16} />
                                                    <span>Review Paper</span>
                                                </Button>
                                            </div>
                                            <div className="col-md-4">
                                                <Button
                                                    variant="outline-danger"
                                                    className="w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                                                    onClick={() => {
                                                        setShowObjectiveModal(false);
                                                        confirmDelete(selectedSubmission);
                                                    }}
                                                    style={{
                                                        borderWidth: '2px',
                                                        transition: 'all 0.2s ease',
                                                        fontSize: '0.95rem'
                                                    }}
                                                >
                                                    <FaTrash size={16} />
                                                    <span>Delete Paper</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-light border-0 p-4">
                    <Button 
                        variant="primary" 
                        size="lg"
                        className="px-4 d-flex align-items-center"
                        onClick={() => setShowObjectiveModal(false)}
                        style={{ 
                            background: 'linear-gradient(135deg, #0062cc 0%, #0044cc 100%)',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            padding: '10px 24px',
                            fontSize: '0.95rem',
                            fontWeight: '500'
                        }}
                    >
                        Close Details
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Review Modal */}
            <Modal 
                show={showReviewModal} 
                onHide={() => {
                    setShowReviewModal(false);
                    setReviewErrors({ comments: '', reviewedBy: '' });
                    setError(null);
                }}
                centered
                size="lg"
                backdrop="static"
                className="review-modal"
            >
                <Modal.Header 
                    closeButton={false}
                    className="bg-gradient-primary text-white border-0" 
                    style={{ 
                        borderRadius: '0',
                        background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
                        padding: '1.5rem'
                    }}
                >
                    <Modal.Title className="w-100">
                        <div className="d-flex align-items-center">
                            <div className="modal-icon-wrapper bg-white bg-opacity-25 rounded-circle p-2 me-3">
                                <FaClipboardCheck className="text-white" size={24} />
                            </div>
                            <div>
                                <h4 className="mb-1 fw-bold">Review Capstone Project</h4>
                                <p className="mb-0" style={{ fontSize: '0.95rem', opacity: '0.9', letterSpacing: '0.3px' }}>
                                    Evaluate and provide feedback on the research paper
                                </p>
                            </div>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    {selectedSubmission && (
                        <div className="review-content">
                            {/* Title Section */}
                            <div className="p-4 bg-light border-bottom">
                                <h6 className="text-primary mb-2" style={{ letterSpacing: '0.5px', fontSize: '0.85rem' }}>
                                    RESEARCH PAPER UNDER REVIEW
                                </h6>
                                <h4 className="mb-0 fw-bold" style={{ color: '#2c3e50', lineHeight: '1.4' }}>
                                    {selectedSubmission.title}
                                </h4>
                            </div>

                            {/* Review Form */}
                            <div className="p-4">
                                <form onSubmit={handleReviewSubmit}>
                                    {/* Status Section */}
                                    <div className="mb-4">
                                        <h6 className="text-primary mb-3" style={{ letterSpacing: '0.5px', fontSize: '0.85rem' }}>
                                            REVIEW STATUS
                                        </h6>
                                        <div className="status-options">
                                            <div className="row g-3">
                                                {[
                                                    {
                                                        value: 'approved',
                                                        label: 'Approved',
                                                        icon: <FaCheckCircle size={20} />,
                                                        color: '#198754',
                                                        bgColor: '#19875420',
                                                        description: 'Research paper meets all requirements and standards'
                                                    },
                                                    {
                                                        value: 'rejected',
                                                        label: 'Rejected',
                                                        icon: <FaTimes size={20} />,
                                                        color: '#dc3545',
                                                        bgColor: '#dc354520',
                                                        description: 'Research paper does not meet the required standards'
                                                    },
                                                    {
                                                        value: 'revision',
                                                        label: 'Needs Revision',
                                                        icon: <FaExclamationCircle size={20} />,
                                                        color: '#ffc107',
                                                        bgColor: '#ffc10720',
                                                        description: 'Research paper needs modifications before approval'
                                                    },
                                                    {
                                                        value: 'pending',
                                                        label: 'Under Review',
                                                        icon: <FaClock size={20} />,
                                                        color: '#0dcaf0',
                                                        bgColor: '#0dcaf020',
                                                        description: 'Research paper is currently under review process'
                                                    }
                                                ].map((status) => (
                                                    <div key={status.value} className="col-md-6">
                                                        <div 
                                                            className={`status-card rounded-3 p-3 cursor-pointer ${
                                                                reviewData.status === status.value ? 'selected' : ''
                                                            }`}
                                                            onClick={() => setReviewData(prev => ({ ...prev, status: status.value }))}
                                                            style={{
                                                                border: `2px solid ${reviewData.status === status.value ? status.color : '#dee2e6'}`,
                                                                backgroundColor: reviewData.status === status.value ? status.bgColor : 'white',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            <div className="d-flex align-items-center mb-2">
                                                                <div 
                                                                    className="status-icon rounded-circle p-2 me-3"
                                                                    style={{ 
                                                                        backgroundColor: status.bgColor,
                                                                        color: status.color
                                                                    }}
                                                                >
                                                                    {status.icon}
                                                                </div>
                                                                <div>
                                                                    <h6 
                                                                        className="mb-1"
                                                                        style={{ 
                                                                            color: reviewData.status === status.value ? status.color : '#2c3e50'
                                                                        }}
                                                                    >
                                                                        {status.label}
                                                                    </h6>
                                                                    <small className="text-muted">
                                                                        {status.description}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Review Summary Section */}
                                    <div className="mb-4">
                                        <h6 className="text-primary mb-3" style={{ letterSpacing: '0.5px', fontSize: '0.85rem' }}>
                                            REVIEW SUMMARY
                                        </h6>
                                        <div className="review-summary bg-light rounded-3 p-4">
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <div className="summary-item">
                                                        <label className="text-muted mb-1">Current Status</label>
                                                        <div className="d-flex align-items-center">
                                                            <Badge 
                                                                bg={
                                                                    reviewData.status === 'approved' ? 'success' :
                                                                    reviewData.status === 'rejected' ? 'danger' :
                                                                    reviewData.status === 'revision' ? 'warning' :
                                                                    'info'
                                                                }
                                                                className="px-3 py-2"
                                                                style={{ fontSize: '0.9rem' }}
                                                            >
                                                                {reviewData.status.toUpperCase() || 'PENDING'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="summary-item">
                                                        <label className="text-muted mb-1">Last Updated</label>
                                                        <div style={{ fontSize: '0.9rem' }}>
                                                            {reviewData.reviewDate.toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comments Section with Enhanced Error Handling */}
                                    <div className="mb-4">
                                        <h6 className="text-primary mb-3" style={{ letterSpacing: '0.5px', fontSize: '0.85rem' }}>
                                            REVIEW COMMENTS
                                        </h6>
                                        <div className="comments-section bg-light rounded-3 p-4">
                                            <div className={`form-group ${reviewErrors.comments ? 'has-error' : ''}`}>
                                                <textarea
                                                    className={`form-control border ${reviewErrors.comments ? 'border-danger' : 'border-0'} bg-white`}
                                                    rows="6"
                                                    placeholder="Provide detailed feedback and suggestions for improvement..."
                                                    value={reviewData.comments}
                                                    onChange={(e) => handleReviewInputChange('comments', e.target.value)}
                                                    style={{ 
                                                        resize: 'none',
                                                        borderWidth: reviewErrors.comments ? '2px' : '1px'
                                                    }}
                                                />
                                                {reviewErrors.comments && (
                                                    <div className="text-danger mt-2 d-flex align-items-center">
                                                        <FaExclamationTriangle className="me-2" size={14} />
                                                        <small>{reviewErrors.comments}</small>
                                                    </div>
                                                )}
                                                <div className="mt-3 d-flex justify-content-between align-items-center">
                                                    <small className="text-muted">
                                                        <FaInfoCircle className="me-2" />
                                                        Please provide constructive feedback
                                                    </small>
                                                    <small className={`${
                                                        reviewData.comments.length > 900 ? 'text-warning' :
                                                        reviewData.comments.length > 800 ? 'text-info' :
                                                        'text-muted'
                                                    }`}>
                                                        {reviewData.comments.length}/1000 characters
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reviewer Information with Enhanced Error Handling */}
                                    <div className="mb-4">
                                        <h6 className="text-primary mb-3" style={{ letterSpacing: '0.5px', fontSize: '0.85rem' }}>
                                            REVIEWER INFORMATION
                                        </h6>
                                        <div className="reviewer-info bg-light rounded-3 p-4">
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <div className={`form-group ${reviewErrors.reviewedBy ? 'has-error' : ''}`}>
                                                        <label className="form-label required">Reviewer Name</label>
                                                        <input
                                                            type="text"
                                                            className={`form-control ${reviewErrors.reviewedBy ? 'border-danger' : ''}`}
                                                            placeholder="Enter reviewer's name"
                                                            value={reviewData.reviewedBy}
                                                            onChange={(e) => handleReviewInputChange('reviewedBy', e.target.value)}
                                                            style={{ 
                                                                borderWidth: reviewErrors.reviewedBy ? '2px' : '1px'
                                                            }}
                                                        />
                                                        {reviewErrors.reviewedBy && (
                                                            <div className="text-danger mt-2 d-flex align-items-center">
                                                                <FaExclamationTriangle className="me-2" size={14} />
                                                                <small>{reviewErrors.reviewedBy}</small>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label required">Review Date</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        value={reviewData.reviewDate.toISOString().split('T')[0]}
                                                        onChange={(e) => handleReviewInputChange('reviewDate', new Date(e.target.value))}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-light border-0 p-4">
                    <Button 
                        variant="secondary" 
                        className="me-2 px-4"
                        onClick={() => {
                            setShowReviewModal(false);
                            setError(null);
                            setReviewData({
                                status: '',
                                comments: '',
                                reviewedBy: '',
                                reviewDate: new Date()
                            });
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        className="px-4 d-flex align-items-center"
                        onClick={handleReviewSubmit}
                        disabled={loading}
                        style={{ 
                            background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <FaSave className="me-2" />
                                Submit Review
                            </>
                        )}
                    </Button>
                </Modal.Footer>

                {/* Error Alert */}
                {error && (
                    <div className="px-4 pb-4">
                        <Alert 
                            variant="danger" 
                            className="mb-0 d-flex align-items-center"
                            onClose={() => setError(null)}
                            dismissible
                        >
                            <FaExclamationTriangle className="me-2" size={18} />
                            {error}
                        </Alert>
                    </div>
                )}
            </Modal>

            {/* Success Modal */}
            <Modal 
                show={showSuccessModal} 
                onHide={() => setShowSuccessModal(false)}
                centered
                size="sm"
                className="success-modal"
            >
                <Modal.Body className="text-center p-4">
                    <div className="mb-3">
                        {successIcon}
                    </div>
                    <h4 className="mb-3">{successTitle}</h4>
                    <p className="mb-0 text-muted">{successMessage}</p>
                </Modal.Body>
            </Modal>

            {/* Revision History Modal */}
            <Modal
                show={showRevisionHistoryModal}
                onHide={() => {
                    setShowRevisionHistoryModal(false);
                    setRevisionCurrentPage(1);
                }}
                centered
                size="lg"
                className="revision-history-modal"
            >
                <Modal.Header className="bg-primary text-white">
                    <Modal.Title>
                        <FaHistory className="me-2" />
                        Revision History
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {revisionHistoryLoading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {revisionHistory.length === 0 ? (
                                <Alert variant="info">
                                    <FaInfoCircle className="me-2" />
                                    No revision history available
                                </Alert>
                            ) : (
                                <div className="revision-timeline">
                                    {revisionHistory.map((revision, index) => (
                                        <div key={index} className="revision-item mb-4">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    {renderStatusBadge(revision.status)}
                                                </div>
                                                <small className="text-muted">
                                                    {new Date(revision.reviewDate).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </small>
                                            </div>
                                            <Card className="bg-light">
                                                <Card.Body>
                                                    <div className="mb-2">
                                                        <strong>Reviewer:</strong> {revision.reviewedBy}
                                                    </div>
                                                    <div>
                                                        <strong>Comments:</strong>
                                                        <p className="mb-0 mt-1">{revision.comment}</p>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {revisionTotalPages > 1 && (
                                <div className="d-flex justify-content-center mt-4">
                                    <Pagination>
                                        <Pagination.Prev
                                            disabled={revisionCurrentPage === 1}
                                            onClick={() => {
                                                setRevisionCurrentPage(prev => prev - 1);
                                                fetchRevisionHistory(selectedSubmission._id);
                                            }}
                                        />
                                        {[...Array(revisionTotalPages)].map((_, idx) => (
                                            <Pagination.Item
                                                key={idx + 1}
                                                active={revisionCurrentPage === idx + 1}
                                                onClick={() => {
                                                    setRevisionCurrentPage(idx + 1);
                                                    fetchRevisionHistory(selectedSubmission._id);
                                                }}
                                            >
                                                {idx + 1}
                                            </Pagination.Item>
                                        ))}
                                        <Pagination.Next
                                            disabled={revisionCurrentPage === revisionTotalPages}
                                            onClick={() => {
                                                setRevisionCurrentPage(prev => prev + 1);
                                                fetchRevisionHistory(selectedSubmission._id);
                                            }}
                                        />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        setShowRevisionHistoryModal(false);
                        setRevisionCurrentPage(1);
                    }}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CapstoneManagement; 