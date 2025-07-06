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
        docsLink: '',
        email: '',
        category: '',
        id: null,
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
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [deletedSubmissions, setDeletedSubmissions] = useState([]);
    const [userEmail, setUserEmail] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showFullAbstract, setShowFullAbstract] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [showArchiveToast, setShowArchiveToast] = useState(false);

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
                const sortedSubmissions = data.data
                    .filter(submission => !submission.isDeleted)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

        // Required field validations
        if (!formData.title.trim()) {
            setError('Research title is required');
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
        if (!formData.keywords.some(keyword => keyword.trim())) {
            setError('At least one keyword is required');
            return;
        }
        if (!formData.members.some(member => member.trim())) {
            setError('At least one member is required');
            return;
        }
        if (!formData.docsLink.trim()) {
            setError('Document link is required');
            return;
        }

        // Show confirmation modal if all validations pass
        setShowConfirmModal(true);
    };

    const handleEdit = (submission) => {
        setFormData({
            title: submission.title,
            abstract: submission.abstract,
            keywords: submission.keywords,
            members: submission.members,
            docsLink: submission.docsLink,
            email: submission.email,
            category: submission.category,
            id: submission._id,
        });
        setIsEditing(true);
        setShowEditModal(true);
    };

    const handleDelete = async () => {
        if (deleteConfirmationText !== 'DELETE') {
            setError('Please type "DELETE" to confirm deletion.');
            return;
        }

        setIsDeleting(true);
        try {
            const response = await axios.put(
                `http://localhost:8080/api/thesis/delete/${selectedSubmission._id}`
            );

            if (response.data.status === 'success') {
                setShowArchiveToast(true);
                setTimeout(() => setShowArchiveToast(false), 3000);
                setSubmissions(prev => prev.filter(sub => sub._id !== selectedSubmission._id));
                setShowDeleteModal(false);
                setSelectedSubmission(null);
                setDeleteConfirmationText('');
            }
        } catch (error) {
            console.error('Error archiving:', error);
            setError(error.response?.data?.message || 'Failed to archive. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const confirmDelete = (submission) => {
        setSelectedSubmission(submission);
        setShowDeleteModal(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            abstract: '',
            keywords: [''],
            members: [''],
            docsLink: '',
            email: '',
            category: '',
            id: null,
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
            const submissionData = {
                title: formData.title,
                abstract: formData.abstract,
                keywords: formData.keywords.filter(k => k.trim()),
                members: formData.members.filter(m => m.trim()),
                docsLink: formData.docsLink,
                email: formData.email || userEmail,
                category: formData.category
            };
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

    // Add recovery function
    const recoverSubmission = async (submissionId) => {
        try {
            const response = await axios.put(
                `http://localhost:8080/api/thesis/recover/${submissionId}`,
                { isDeleted: false }
            );

            if (response.data.status === 'success') {
                showSuccess(
                    'Research Recovered',
                    'The research paper has been successfully recovered.',
                    <FaCheckCircle className="text-success" size={48} />
                );
                fetchSubmissions();
                setShowRecoveryModal(false);
            }
        } catch (error) {
            console.error('Error recovering submission:', error);
            setError(error.response?.data?.message || 'Failed to recover submission. Please try again.');
        }
    };

    // Add a modal for recovery
    const renderRecoveryModal = () => (
        <Modal show={showRecoveryModal} onHide={() => setShowRecoveryModal(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>Recover Deleted Research</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {deletedSubmissions.length === 0 ? (
                    <Alert variant="info">No deleted submissions found.</Alert>
                ) : (
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deletedSubmissions.map((submission) => (
                                <tr key={submission._id}>
                                    <td>{submission.title}</td>
                                    <td>
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => recoverSubmission(submission._id)}
                                        >
                                            Recover
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Modal.Body>
        </Modal>
    );

    // Replace delete modal with archive modal
    const renderArchiveModal = () => (
        <Modal
            show={showArchiveModal}
            onHide={() => setShowArchiveModal(false)}
            centered
            aria-labelledby="archive-modal-title"
            backdropClassName="custom-modal-backdrop"
            dialogClassName="custom-archive-modal-dialog"
        >
            <div style={{ position: 'relative' }}>
                <Modal.Header
                    closeButton={false}
                    style={{ borderBottom: 'none', borderTopLeftRadius: 16, borderTopRightRadius: 16, background: '#2563eb', color: '#fff', padding: '1.5rem 2rem' }}
                >
                    <Modal.Title id="archive-modal-title" style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: 0.5 }}>
                        Archive Research Paper
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '2rem', fontSize: '1.1rem', borderRadius: 16, background: 'transparent', color: '#334155', fontWeight: 500 }}>
                    Are you sure you want to archive this research paper? It will be moved to the Archived Capstones section and can be restored later if needed.
                </Modal.Body>
                <Modal.Footer style={{ borderTop: 'none', padding: '1.5rem 2rem', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, background: '#f8fafc' }}>
                    <Button
                        variant="secondary"
                        onClick={() => setShowArchiveModal(false)}
                        style={{ minWidth: 110, fontWeight: 600, borderRadius: 8, marginRight: 8 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        style={{ minWidth: 110, fontWeight: 600, borderRadius: 8, boxShadow: '0 2px 8px rgba(37,99,235,0.15)', background: '#2563eb', border: 'none' }}
                        aria-label="Confirm archive"
                    >
                        {isDeleting ? 'Archiving...' : 'Confirm'}
                    </Button>
                </Modal.Footer>
            </div>
        </Modal>
    );

    // Add a button to open the recovery modal
    const renderRecoveryButton = () => (
        <Button
            variant="outline-secondary"
            onClick={() => {
                fetchDeletedSubmissions();
                setShowRecoveryModal(true);
            }}
        >
            <FaTrash className="me-2" />
            Trash Archives
        </Button>
    );

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
                            {/* Filter Bar: Always visible, fixed spacing */}
                            <div className="d-flex align-items-center mb-3" style={{ minHeight: '48px' }}>
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
                            {/* Table and results */}
                            <div className="capstone-table-wrapper flex-grow-1 d-flex flex-column" style={{ minHeight: '400px' }}>
                                <div className="table-responsive capstone-table-responsive" style={{ width: '100%', minWidth: 0, flex: 1 }}>
                                    <Table className="capstone-table align-middle mb-0" hover bordered>
                                        <thead className="table-dark position-sticky top-0 capstone-table-header" style={{ zIndex: 1 }}>
                                            <tr>
                                                <th className="text-nowrap" style={{ minWidth: '200px' }}>Title</th>
                                                <th className="text-nowrap" style={{ minWidth: '120px' }}>Category</th>
                                                <th className="text-nowrap" style={{ minWidth: '120px' }}>Status</th>
                                                <th className="text-nowrap" style={{ minWidth: '120px' }}>Reviewer</th>
                                                <th className="text-nowrap" style={{ minWidth: '180px' }}>Members</th>
                                                <th className="text-nowrap" style={{ minWidth: '180px' }}>Student Email</th>
                                                <th className="text-nowrap" style={{ minWidth: '180px' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentSubmissions.length > 0 ? (
                                                currentSubmissions.map((submission, idx) => (
                                                    <tr key={submission._id} className={idx % 2 === 0 ? 'capstone-row-even' : 'capstone-row-odd'}>
                                                        <td className="fw-semibold text-dark">{submission.title}</td>
                                                        <td>{submission.category}</td>
                                                        <td>{renderStatusBadge(submission.status, submission.reviewedBy)}</td>
                                                        <td>{submission.reviewedBy || <span className="text-muted">—</span>}</td>
                                                        <td className="text-break">{submission.members.join(', ')}</td>
                                                        <td>
                                                            <a href={`mailto:${submission.email}`} className="text-primary text-decoration-underline" style={{ wordBreak: 'break-all' }}>{submission.email}</a>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center justify-content-start gap-2 flex-wrap">
                                                                <Button
                                                                    variant="outline-info"
                                                                    size="sm"
                                                                    className="d-inline-flex align-items-center justify-content-center capstone-action-btn"
                                                                    onClick={() => handleEdit(submission)}
                                                                    title="Edit Research Paper"
                                                                >
                                                                    <FaEdit className="me-1" size={14} />
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    variant="outline-warning"
                                                                    size="sm"
                                                                    className="d-inline-flex align-items-center justify-content-center capstone-action-btn"
                                                                    onClick={() => handleReview(submission)}
                                                                    title="Review Research Paper"
                                                                >
                                                                    <FaCheckCircle className="me-1" size={14} />
                                                                    Review
                                                                </Button>
                                                                <Button
                                                                    variant="outline-warning"
                                                                    size="sm"
                                                                    className="d-inline-flex align-items-center justify-content-center capstone-action-btn"
                                                                    onClick={() => confirmDelete(submission)}
                                                                    title="Archive Research Paper"
                                                                >
                                                                    <FaTrash className="me-1" size={14} />
                                                                    Archive
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="text-center text-muted py-5 bg-light" style={{ fontSize: '1.1em' }}>
                                                        No research papers found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                                <div className="mt-2" style={{ minHeight: '40px' }}>
                                    {renderPagination()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {renderArchiveModal()}
            {renderRecoveryModal()}

            {/* Edit/Add Modal */}
            <div className={`custom-modal ${showEditModal ? 'show' : ''}`} onClick={() => {
                setShowEditModal(false);
                resetForm();
            }}>
                <div className="custom-modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '1200px' }}>
                    <div className="custom-modal-header bg-primary text-white">
                        <h3>
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
                        </h3>
                        <button onClick={() => {
                            setShowEditModal(false);
                            resetForm();
                        }} className="close-button">
                            &times;
                        </button>
                    </div>
                    <div className="custom-modal-body">
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
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            <div className={`custom-modal ${showReviewModal ? 'show' : ''}`} onClick={() => {
                setShowReviewModal(false);
                setReviewErrors({ comments: '', reviewedBy: '' });
                setError(null);
            }}>
                <div className="custom-modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '1000px' }}>
                    <div className="custom-modal-header bg-gradient-primary text-white">
                        <h3>
                            <FaClipboardCheck className="me-2" />
                            Review Capstone Project
                        </h3>
                        <button onClick={() => {
                            setShowReviewModal(false);
                            setReviewErrors({ comments: '', reviewedBy: '' });
                            setError(null);
                        }} className="close-button">
                            &times;
                        </button>
                    </div>
                    <div className="custom-modal-body">
                        {selectedSubmission && (
                            <div className="review-content">
                                {/* Submission Details Section - Modern, Clean Layout */}
                                <section className="mb-4 w-100" aria-label="Submission Details">
                                    <div className="bg-white shadow-sm rounded-4 p-4 mb-3" style={{ maxWidth: 820, margin: '0 auto' }}>
                                        <h5 className="fw-semibold mb-4" style={{ letterSpacing: '0.5px', color: '#1a237e' }}>Submission Details</h5>
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
                                                <label className="fw-bold text-secondary">Student Email</label>
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
                                                                placeholder="er's name"
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
                    </div>
                    <div className="custom-modal-footer">
                        <Button variant="secondary" onClick={() => {
                            setShowReviewModal(false);
                            setError(null);
                            setReviewData({
                                status: '',
                                comments: '',
                                reviewedBy: '',
                                reviewDate: new Date()
                            });
                        }}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleReviewSubmit} disabled={loading}>
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
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <div className={`custom-modal ${showSuccessModal ? 'show' : ''}`} onClick={() => setShowSuccessModal(false)}>
                <div className="custom-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                    <div className="custom-modal-body text-center p-4">
                        <div className="mb-3">
                            {successIcon}
                        </div>
                        <h4 className="mb-3">{successTitle}</h4>
                        <p className="mb-0 text-muted">{successMessage}</p>
                    </div>
                    <div className="custom-modal-footer">
                        <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            </div>

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

            {/* Archive Toast */}
            {showArchiveToast && (
                <div
                    style={{
                        position: 'fixed',
                        top: 24,
                        right: 24,
                        background: '#fff',
                        color: '#334155',
                        padding: '1rem 1.5rem 0.75rem 1.25rem',
                        borderRadius: 10,
                        boxShadow: '0 4px 24px rgba(30,41,59,0.10)',
                        zIndex: 3000,
                        minWidth: 240,
                        maxWidth: '90vw',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 4,
                        fontFamily: 'inherit',
                    }}
                    role="status"
                    aria-live="polite"
                >
                    <div style={{ display: 'flex', width: '100%', alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, color: '#22c55e', fontSize: '1rem', flex: 1 }}>
                            Research archived
                        </span>
                        <button
                            onClick={() => setShowArchiveToast(false)}
                            aria-label="Close"
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#64748b',
                                fontSize: 18,
                                marginLeft: 8,
                                cursor: 'pointer',
                                lineHeight: 1,
                            }}
                            tabIndex={0}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowArchiveToast(false); }}
                        >
                            ×
                        </button>
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 500, marginTop: 2 }}>
                        You can find it in Archived Capstones.
                    </div>
                </div>
            )}
        </div>
    );
};

export default CapstoneManagement; 