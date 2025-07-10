import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Table, InputGroup, Form, Pagination, Card, Badge, Alert } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaExclamationTriangle, FaFileAlt, FaUser, FaKey, FaEnvelope, FaLink, FaInfoCircle, FaTimes, FaFolder, FaUserTie, FaCheckCircle, FaClipboardCheck, FaExclamationCircle, FaClock, FaSave, FaCheck, FaHistory } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminNavbar from '../Navbar/Admin-Navbar/AdminNavbar';

const CapstoneManagement2 = () => {
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
    const [reviewErrors, setReviewErrors] = useState({});
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
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [showArchiveToast, setShowArchiveToast] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [detailsSubmission, setDetailsSubmission] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    // Add state for archive error toast
    const [showArchiveErrorToast, setShowArchiveErrorToast] = useState(false);
    const [archiveErrorMessage, setArchiveErrorMessage] = useState('');

    // Extract the active section from the current route
    const activeSection = location.pathname.split('/').pop();

    const handleSectionChange = (section) => {
        navigate(`/admin-dashboard/${section}`);
    };

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

    const handleArchive = async () => {
        setIsArchiving(true);
        try {
            const response = await axios.put(
                `http://localhost:8080/api/thesis/delete/${selectedSubmission._id}`
            );
            if (response.data.status === 'success') {
                setShowArchiveToast(true);
                setTimeout(() => setShowArchiveToast(false), 3000);
                setSubmissions(prev => prev.filter(sub => sub._id !== selectedSubmission._id));
                setShowArchiveModal(false);
                setSelectedSubmission(null);
            }
        } catch (error) {
            console.error('Error archiving:', error);
            setError(error.response?.data?.message || 'Failed to archive. Please try again.');
        } finally {
            setIsArchiving(false);
        }
    };

    const confirmArchive = (submission) => {
        if (submission.status && submission.status.toLowerCase() === 'approved') {
            setArchiveErrorMessage('Approved capstones cannot be archived directly.');
            setShowArchiveErrorToast(true);
            setTimeout(() => setShowArchiveErrorToast(false), 3000);
            return;
        }
        setSelectedSubmission(submission);
        setShowArchiveModal(true);
        setError(null);
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
            bg: '#facc15', // yellow for Under Review
            text: 'UNDER REVIEW',
            color: '#b45309',
            icon: <FaClock className="me-1" size={12} />,
            fontSize: '0.75rem' // smaller for Under Review
        };
        switch(status?.toLowerCase()) {
            case 'approved':
                badgeProps = {
                    bg: '#22c55e', // green
                    text: 'APPROVED',
                    color: '#065f46',
                    icon: <FaCheckCircle className="me-1" size={12} />,
                    fontSize: '0.85rem'
                };
                break;
            case 'rejected':
                badgeProps = {
                    bg: '#ef4444', // red
                    text: 'REJECTED',
                    color: '#991b1b',
                    icon: <FaTimes className="me-1" size={12} />,
                    fontSize: '0.85rem'
                };
                break;
            case 'revision':
                badgeProps = {
                    bg: '#fb923c', // orange
                    text: 'NEEDS REVISION',
                    color: '#b45309',
                    icon: <FaExclamationCircle className="me-1" size={12} />,
                    fontSize: '0.85rem'
                };
                break;
            case 'pending':
                badgeProps = {
                    bg: '#facc15', // yellow
                    text: 'UNDER REVIEW',
                    color: '#b45309',
                    icon: <FaClock className="me-1" size={12} />,
                    fontSize: '0.75rem'
                };
                break;
        }
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: badgeProps.bg,
                        color: badgeProps.color,
                        borderRadius: '1.5rem',
                        boxShadow: '0 2px 8px rgba(30,41,59,0.10)',
                        fontWeight: 700,
                        fontSize: badgeProps.fontSize,
                        padding: '0.28em 1.1em',
                        minWidth: 90,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                        border: 'none',
                        margin: 0
                    }}
                >
                    {badgeProps.icon}
                    {badgeProps.text}
                </span>
                {reviewedBy && (
                    <div style={{ fontSize: '0.75rem', color: '#6c757d', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        by {reviewedBy}
                    </div>
                )}
            </div>
        );
    };

    const handleReviewInputChange = (field, value) => {
        setReviewData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        // Only require status
        if (!reviewData.status) {
            setError('Please select a review status.');
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
                setReviewErrors({});
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

    // Archive modal (no confirmation text input, just a simple confirm/cancel)
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
                    {error && (
                        <Alert variant="danger" className="mt-3">
                            <FaExclamationTriangle className="me-2" />
                            {error}
                        </Alert>
                    )}
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
                        onClick={handleArchive}
                        disabled={isArchiving}
                        style={{ minWidth: 110, fontWeight: 600, borderRadius: 8, boxShadow: '0 2px 8px rgba(37,99,235,0.15)', background: '#2563eb', border: 'none' }}
                        aria-label="Confirm archive"
                    >
                        {isArchiving ? 'Archiving...' : 'Confirm'}
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
            Archived Capstones
        </Button>
    );

    return (
        <div className="d-flex">
            <AdminNavbar 
                activeSection={activeSection} 
                handleSectionChange={handleSectionChange} 
            />
            
            <div className="flex-grow-1" style={{ marginLeft: '250px' }}>
                <div className="container-fluid" style={{ 
                    minWidth: '1200px',
                    minHeight: '100vh',
                    padding: '15px',
                    overflow: 'hidden'
                }}>
                    <div className="row h-100">
                        <div className="col-12 h-100">
                            <div className="card shadow h-100">
                                <div className="card-header bg-primary text-white py-3" style={{ minHeight: '70px' }}>
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                        <h3 className="mb-0">Capstone Management</h3>
                                        <div className="d-flex align-items-center justify-content-end" style={{ flex: 1, marginLeft: '24px' }}>
                                            <div className="search-container" style={{ minWidth: '280px', maxWidth: '400px' }}>
                                                <InputGroup style={{ height: '44px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                                    <InputGroup.Text style={{ 
                                                        background: '#fff', 
                                                        border: '1px solid #e5e7eb',
                                                        borderRight: 'none',
                                                        borderRadius: '8px 0 0 8px',
                                                        color: '#6b7280',
                                                        padding: '12px 16px',
                                                        height: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}>
                                                        <FaSearch size={16} />
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Search capstone titles..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        style={{ 
                                                            border: '1px solid #e5e7eb',
                                                            borderLeft: 'none',
                                                            borderRadius: '0 8px 8px 0',
                                                            padding: '12px 16px',
                                                            fontSize: '14px',
                                                            background: '#fff',
                                                            color: '#374151',
                                                            height: '100%'
                                                        }}
                                                    />
                                                </InputGroup>
                                            </div>
                                        </div>
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
                                            <div className="table-responsive capstone-table-responsive" style={{
                                                maxWidth: '100%',
                                                minWidth: 0,
                                                overflowX: 'auto',
                                                margin: '0 auto',
                                            }}>
                                                <Table striped bordered hover className="mt-3 mb-0 capstone-table text-sm" style={{ minWidth: 900, width: '100%' }}>
                                                    <thead className="table-dark position-sticky top-0 text-sm" style={{ zIndex: 1 }}>
                                                        <tr>
                                                            <th style={{ width: '18%', minWidth: 160, textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', padding: '8px 12px', fontSize: '0.97em' }}>Title</th>
                                                            <th style={{ width: '14%', minWidth: 110, textAlign: 'left', padding: '8px 12px', fontSize: '0.97em' }}>Members</th>
                                                            <th style={{ width: '10%', minWidth: 90, textAlign: 'left', padding: '8px 12px', fontSize: '0.97em' }}>Category</th>
                                                            <th style={{ width: '12%', minWidth: 120, maxWidth: 160, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '8px 12px', fontSize: '0.97em' }}>Email</th>
                                                            <th style={{ width: '10%', minWidth: 120, maxWidth: 140, textAlign: 'center', whiteSpace: 'nowrap', padding: '8px 12px', fontSize: '0.97em' }}>Status</th>
                                                            <th style={{ width: '13%', minWidth: 120, maxWidth: 150, textAlign: 'center', whiteSpace: 'nowrap', padding: '8px 12px', fontSize: '0.97em' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentSubmissions.map((submission, idx) => (
                                                            <tr key={submission._id} className={idx % 2 === 0 ? 'capstone-row-even' : 'capstone-row-odd'} style={{ fontSize: '0.97em' }}>
                                                                <td style={{ verticalAlign: 'middle', whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: 220, textAlign: 'left', fontWeight: 500, color: '#222', padding: '8px 12px' }}>{submission.title}</td>
                                                                <td style={{ verticalAlign: 'middle', maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '8px 12px' }}>{submission.members.join(', ')}</td>
                                                                <td style={{ verticalAlign: 'middle', maxWidth: 90, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '8px 12px' }}>
                                                                    <span style={{
                                                                        display: 'inline-block',
                                                                        background: '#e0e7ff',
                                                                        color: '#3730a3',
                                                                        borderRadius: '999px',
                                                                        fontWeight: 600,
                                                                        fontSize: '0.85em',
                                                                        padding: '0.18em 0.9em',
                                                                        letterSpacing: 0.5,
                                                                        textTransform: 'uppercase',
                                                                        border: 'none',
                                                                        margin: 0
                                                                    }}>{submission.category || 'N/A'}</span>
                                                                </td>
                                                                <td style={{ verticalAlign: 'middle', maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '8px 12px' }}>{submission.email}</td>
                                                                <td style={{ verticalAlign: 'middle', textAlign: 'center', maxWidth: 140, minWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '8px 12px' }}>{renderStatusBadge(submission.status)}</td>
                                                                <td style={{ verticalAlign: 'middle', textAlign: 'center', maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '8px 12px' }}>
                                                                    <div className="d-flex align-items-center justify-content-center gap-1 flex-wrap">
                                                                        <Button
                                                                            variant="outline-info"
                                                                            size="sm"
                                                                            className="px-2 py-1 text-sm fw-semibold"
                                                                            onClick={() => handleReview(submission)}
                                                                            style={{ minWidth: 60 }}
                                                                            title="Review Research Paper"
                                                                        >
                                                                            Review
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline-warning"
                                                                            size="sm"
                                                                            className="px-2 py-1 text-sm fw-semibold"
                                                                            onClick={() => confirmArchive(submission)}
                                                                            style={{ minWidth: 60 }}
                                                                            title="Archive Research Paper"
                                                                        >
                                                                            Archive
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
                    {showReviewModal && (
                        <div className={`custom-modal show`} onClick={() => { if (!loading) { setShowReviewModal(false); setReviewErrors({}); setError(null); } }}>
                            <div className="custom-modal-content" onClick={e => e.stopPropagation()} style={{ width: '95%', maxWidth: '1000px', position: 'relative', paddingBottom: 0, height: '90vh' }}>
                                <div className="custom-modal-header bg-gradient-primary text-white">
                                    <h3>
                                        <FaClipboardCheck className="me-2" />
                                        Review Capstone Project
                                    </h3>
                                    <button 
                                        onClick={() => { if (!loading) { setShowReviewModal(false); setReviewErrors({}); setError(null); } }} 
                                        className="close-button" 
                                        disabled={loading}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            color: '#fff', 
                                            fontSize: '24px', 
                                            fontWeight: 'bold',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            padding: '0',
                                            width: '30px',
                                            height: '30px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            transition: 'background-color 0.2s ease'
                                        }}
                                        onMouseOver={e => {
                                            if (!loading) {
                                                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                            }
                                        }}
                                        onMouseOut={e => {
                                            if (!loading) {
                                                e.target.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        &times;
                                    </button>
                                </div>
                                
                                            {/* Sticky Action Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 200,
                background: '#fff',
                borderBottom: '2px solid #e5e7eb',
                padding: '16px 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div className="text-center mb-2">
                    <h5 className="fw-bold mb-0" style={{ color: '#1f2937', fontSize: '0.95rem' }}>Select Review Decision</h5>
                                            </div>
                <div className="d-flex justify-content-center gap-2 flex-wrap">
                                        {[
                                            { value: 'approved', label: 'Approved', icon: <FaCheckCircle size={16} />, color: '#fff', bg: '#10b981', border: '#10b981', hover: '#059669' },
                                            { value: 'rejected', label: 'Rejected', icon: <FaTimes size={16} />, color: '#fff', bg: '#ef4444', border: '#ef4444', hover: '#dc2626' },
                                            { value: 'revision', label: 'Needs Revision', icon: <FaExclamationCircle size={16} />, color: '#fff', bg: '#f59e0b', border: '#f59e0b', hover: '#d97706' },
                                            { value: 'pending', label: 'Under Review', icon: <FaClock size={16} />, color: '#fff', bg: '#6b7280', border: '#6b7280', hover: '#4b5563' }
                                                            ].map((status) => (
                                                                    <button
                            key={status.value}
                            type="button"
                            className={`d-flex align-items-center gap-2 px-3 py-1.5 fw-semibold border-0`}
                                                                        style={{
                                background: reviewData.status === status.value ? status.bg : '#f8fafc',
                                color: reviewData.status === status.value ? status.color : '#64748b',
                                borderRadius: 20,
                                border: `2px solid ${reviewData.status === status.value ? status.border : '#e2e8f0'}`,
                                fontWeight: 600,
                                fontSize: 13,
                                minWidth: 130,
                                boxShadow: reviewData.status === status.value ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                                                                            transition: 'all 0.2s ease',
                                outline: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                                                            opacity: loading ? 0.7 : 1
                            }}
                                                onClick={() => !loading && setReviewData(prev => ({ ...prev, status: status.value }))}
                                                disabled={loading}
                                                onMouseOver={e => {
                                                    if (!loading && reviewData.status !== status.value) {
                                                        e.currentTarget.style.background = status.hover;
                                                        e.currentTarget.style.color = status.color;
                                                        e.currentTarget.style.borderColor = status.border;
                                                    }
                                                }}
                                                onMouseOut={e => {
                                                    if (!loading && reviewData.status !== status.value) {
                                                        e.currentTarget.style.background = '#f8fafc';
                                                        e.currentTarget.style.color = '#64748b';
                                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                                    }
                                                }}
                                            >
                                                                            {status.icon}
                                                                                {status.label}
                                                {reviewData.status === status.value && <FaCheckCircle className="ms-1" size={14} style={{ color: status.color }} />}
                                            </button>
                                        ))}
                                                                        </div>
                                                                    </div>
                                
                                <div className="custom-modal-body" style={{ background: '#f8fafc', borderRadius: '0 0 16px 16px', padding: 0, height: 'calc(90vh - 180px)', overflowY: 'auto' }}>
                                    {selectedSubmission && (
                                        <div className="review-content">
                                            {/* Capstone Details Section */}
                                            <div className="p-4">
                                                <div style={{ background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                                                    <h4 className="fw-bold mb-4" style={{ color: '#1f2937', lineHeight: '1.4', fontSize: '1.3rem' }}>
                                                        {selectedSubmission.title}
                                                    </h4>
                                                    
                                                    <div className="row g-4">
                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <label className="fw-semibold mb-2 d-block" style={{ color: '#374151', fontSize: '0.9rem' }}>Category</label>
                                                                <span style={{ background: '#dbeafe', color: '#1e40af', borderRadius: 6, fontWeight: 600, fontSize: 13, padding: '6px 12px', display: 'inline-block' }}>
                                                                    {selectedSubmission.category}
                                                                </span>
                                                                </div>
                                                            
                                                            <div className="mb-3">
                                                                <label className="fw-semibold mb-2 d-block" style={{ color: '#374151', fontSize: '0.9rem' }}>Student Email</label>
                                                                <div style={{ color: '#4b5563', fontSize: 14, padding: '8px 0' }}>{selectedSubmission.email}</div>
                                                            </div>
                                                            
                                                            <div className="mb-3">
                                                                <label className="fw-semibold mb-2 d-block" style={{ color: '#374151', fontSize: '0.9rem' }}>Team Members</label>
                                                                <div style={{ color: '#4b5563', fontSize: 14, lineHeight: '1.5' }}>
                                                                    {selectedSubmission.members?.map((member, index) => (
                                                                        <span key={index} style={{ 
                                                                            display: 'inline-block', 
                                                                            background: '#f3f4f6', 
                                                                            padding: '4px 10px', 
                                                                            borderRadius: 4, 
                                                                            margin: '2px 4px 2px 0',
                                                                            fontSize: 13
                                                                        }}>
                                                                            {member}
                                                                        </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                        </div>
                                                        
                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <label className="fw-semibold mb-2 d-block" style={{ color: '#374151', fontSize: '0.9rem' }}>Abstract</label>
                                                                <div style={{ 
                                                                    color: '#4b5563', 
                                                                    fontSize: 14, 
                                                                    textAlign: 'justify', 
                                                                    lineHeight: '1.6', 
                                                                    maxHeight: 250, 
                                                                    minHeight: 120,
                                                                    overflowY: 'auto',
                                                                    padding: '16px',
                                                                    background: '#f9fafb',
                                                                    borderRadius: 6,
                                                                    border: '1px solid #e5e7eb'
                                                                }}>
                                                                    {selectedSubmission.abstract}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Document Preview & Feedback Section */}
                                            <div className="px-4 pb-4">
                                                <div style={{ background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                                    <h5 className="fw-bold mb-4" style={{ color: '#1f2937', fontSize: '1.1rem' }}>Document & Feedback</h5>
                                                    
                                                    {/* Document Section */}
                                                    <div className="mb-4">
                                                        <label className="fw-semibold mb-2 d-block" style={{ color: '#374151', fontSize: '0.9rem' }}>Attached Document</label>
                                                        <div className="d-flex align-items-center gap-3 p-3" style={{ background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                                                            {selectedSubmission.docsLink ? (
                                                                <>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ color: '#1e40af', fontWeight: 600, fontSize: 14, marginBottom: '4px' }}>
                                                                            Capstone Document
                                                                        </div>
                                                                        <span className="badge" style={{ 
                                                                            background: '#dbeafe', 
                                                                            color: '#1e40af', 
                                                                            fontSize: 11, 
                                                                            borderRadius: 4, 
                                                                            padding: '3px 8px',
                                                                            fontWeight: 500
                                                                        }}>
                                                                            {selectedSubmission.docsLink.endsWith('.pdf') ? 'PDF Document' : 'External Link'}
                                                                        </span>
                                                                    </div>
                                                                    <Button
                                                                        variant="primary"
                                                                        size="sm"
                                                                        style={{ 
                                                                            fontWeight: 600, 
                                                                            borderRadius: 6, 
                                                                            background: '#2563eb',
                                                                            border: 'none',
                                                                            padding: '8px 16px',
                                                                            fontSize: 13
                                                                        }}
                                                                        onClick={() => window.open(selectedSubmission.docsLink, '_blank', 'noopener,noreferrer')}
                                                                    >
                                                                        <FaFileAlt className="me-1" />
                                                                        View File
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <div className="d-flex align-items-center gap-2" style={{ color: '#6b7280', fontSize: 14 }}>
                                                                    <FaInfoCircle size={16} />
                                                                    <span>No document attached</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Comments Section */}
                                                    <form onSubmit={handleReviewSubmit}>
                                                    <div className="mb-4">
                                                            <label className="fw-semibold mb-2 d-block" htmlFor="reviewComments" style={{ color: '#374151', fontSize: '0.9rem' }}>
                                                                Review Comments (Optional)
                                                            </label>
                                                        <textarea
                                                            id="reviewComments"
                                                            className={`form-control ${reviewErrors.comments ? 'is-invalid' : ''}`}
                                                                rows="4"
                                                                placeholder="Provide feedback, suggestions, or additional comments..."
                                                            value={reviewData.comments}
                                                            onChange={e => handleReviewInputChange('comments', e.target.value)}
                                                                style={{ 
                                                                    resize: 'none', 
                                                                    borderRadius: 6, 
                                                                    background: '#fff', 
                                                                    fontSize: 14, 
                                                                    border: '1px solid #e5e7eb',
                                                                    padding: '12px',
                                                                    lineHeight: '1.5'
                                                                }}
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                </form>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Success Modal */}
                                    {showSuccessModal && (
                                        <div style={{
                                            position: 'fixed',
                                            top: 0, left: 0, right: 0, bottom: 0,
                                            zIndex: 3000,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(0,0,0,0.08)'
                                        }}>
                                            <div style={{
                                                background: '#e6f9ed',
                                                border: '1.5px solid #22c55e',
                                                borderRadius: 14,
                                                boxShadow: '0 4px 24px rgba(34,197,94,0.10)',
                                                padding: '2rem 2.5rem',
                                                minWidth: 320,
                                                maxWidth: '90vw',
                                                textAlign: 'center',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 12
                                            }}>
                                                {successIcon}
                                                <div style={{ fontWeight: 700, fontSize: 18, color: '#15803d', marginBottom: 4 }}>{successTitle}</div>
                                                <div style={{ fontSize: 16, color: '#166534' }}>{successMessage}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Sticky Footer with Submit Button */}
                                <div style={{
                                    position: 'sticky',
                                    bottom: 0,
                                    left: 0,
                                    width: '100%',
                                    background: '#fff',
                                    borderTop: '1px solid #e5e7eb',
                                    padding: '16px 24px',
                                    boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
                                    zIndex: 100
                                }}>
                                    <div className="d-flex justify-content-end gap-3">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => { if (!loading) { setShowReviewModal(false); setReviewErrors({}); setError(null); } }}
                                            disabled={loading}
                                            style={{ 
                                                fontWeight: 600, 
                                                borderRadius: 6,
                                                padding: '8px 16px',
                                                fontSize: 13
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={handleReviewSubmit}
                                            disabled={loading || !reviewData.status}
                                            style={{ 
                                                fontWeight: 600, 
                                                borderRadius: 6, 
                                                background: '#2563eb', 
                                                border: 'none',
                                                padding: '8px 20px',
                                                fontSize: 13
                                            }}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <FaCheckCircle className="me-1" />
                                                    Submit Review
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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

                    {/* Toast Notification */}
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

                    {/* Details Modal */}
                    {showDetailsModal && (
                        <div className={`custom-modal show`} onClick={() => setShowDetailsModal(false)}>
                            <div className="custom-modal-content" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '1000px' }}>
                                <div className="custom-modal-header bg-gradient-primary text-white">
                                    <h3>
                                        <FaFileAlt className="me-2" />
                                        Capstone Details
                                    </h3>
                                    <button onClick={() => setShowDetailsModal(false)} className="close-button">&times;</button>
                                </div>
                                <div className="custom-modal-body">
                                    {detailsSubmission && (
                                        <div className="review-content">
                                            {/* Title Section */}
                                            <div className="p-4 bg-light border-bottom">
                                                <h6 className="text-primary mb-2" style={{ letterSpacing: '0.5px', fontSize: '0.85rem' }}>
                                                    RESEARCH PAPER DETAILS
                                                </h6>
                                                <h4 className="mb-0 fw-bold" style={{ color: '#2c3e50', lineHeight: '1.4' }}>
                                                    {detailsSubmission.title}
                                                </h4>
                                            </div>
                                            {/* Details Grid */}
                                            <div className="p-4">
                                                <div className="row g-4">
                                                    <div className="col-md-6">
                                                        <div className="mb-2"><strong>Category:</strong> <span style={{ display: 'inline-block', background: '#e0e7ff', color: '#3730a3', borderRadius: '999px', fontWeight: 600, fontSize: '0.85em', padding: '0.18em 0.9em', letterSpacing: 0.5, textTransform: 'uppercase', border: 'none', margin: 0 }}>{detailsSubmission.category || 'N/A'}</span></div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="mb-2"><strong>Email:</strong> {detailsSubmission.email}</div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="mb-2"><strong>Submission Date:</strong> {detailsSubmission.createdAt ? new Date(detailsSubmission.createdAt).toLocaleString() : 'N/A'}</div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="mb-2"><strong>Document:</strong> {detailsSubmission.docsLink ? (<a href={detailsSubmission.docsLink} target="_blank" rel="noopener noreferrer">View Document</a>) : 'No file attached.'}</div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <div className="mb-2"><strong>Members:</strong> {Array.isArray(detailsSubmission.members) && detailsSubmission.members.length > 0 ? detailsSubmission.members.map((m, i) => (<span key={i} style={{ display: 'inline-block', marginRight: 8, color: '#475569', fontSize: 15, wordBreak: 'break-word' }}>{m}</span>)) : <span style={{ color: '#64748b' }}>No members listed.</span>}</div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <div className="mb-2"><strong>Keywords:</strong> {Array.isArray(detailsSubmission.keywords) && detailsSubmission.keywords.length > 0 ? detailsSubmission.keywords.map((kw, i) => (<span key={i} style={{ display: 'inline-block', marginRight: 6, marginBottom: 2, background: '#e2e8f0', color: '#334155', borderRadius: 8, fontWeight: 500, fontSize: 13, padding: '0.18em 0.9em' }}>{kw}</span>)) : <span style={{ color: '#64748b' }}>No keywords.</span>}</div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <div className="mb-2"><strong>Abstract:</strong></div>
                                                        <div style={{ color: '#475569', fontSize: 15, whiteSpace: 'pre-line', marginTop: 2, wordBreak: 'break-word', background: '#f8fafc', borderRadius: 6, padding: '12px 16px', lineHeight: 1.7 }}>{detailsSubmission.abstract || 'No abstract provided.'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {showArchiveErrorToast && (
                        <div
                            style={{
                                position: 'fixed',
                                top: 24,
                                right: 24,
                                background: '#fff',
                                color: '#ef4444',
                                padding: '1rem 1.5rem 0.75rem 1.25rem',
                                borderRadius: 10,
                                boxShadow: '0 4px 24px rgba(239,68,68,0.10)',
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
                                <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '1rem', flex: 1 }}>
                                    Archive Error
                                </span>
                                <button
                                    onClick={() => setShowArchiveErrorToast(false)}
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
                                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowArchiveErrorToast(false); }}
                                >
                                    ×
                                </button>
                            </div>
                            <div style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 500, marginTop: 2 }}>
                                {archiveErrorMessage}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CapstoneManagement2; 