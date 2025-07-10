import React, { useEffect, useState } from 'react';
import { Table, Button, Alert, Badge, Modal, Card, Form, InputGroup } from 'react-bootstrap';
import { FaTrash, FaUndo, FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminNavbar from '../Navbar/Admin-Navbar/AdminNavbar';
import '../Styles/CapstoneManagement.css';

const categories = ['IoT', 'AI', 'ML', 'Sound', 'Camera'];

const ArchivedCapstones = () => {
    const [deletedSubmissions, setDeletedSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showRestoreSuccess, setShowRestoreSuccess] = useState(false);
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
    const [deletePermanentModal, setDeletePermanentModal] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [selectedPermanentDeleteId, setSelectedPermanentDeleteId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Extract the active section from the current route
    const activeSection = location.pathname.split('/').pop();

    useEffect(() => {
        fetchDeletedSubmissions();
        // Inject responsive modal grid CSS only once
        const styleId = 'archived-modal-grid-responsive-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                .archived-modal-grid-responsive {
                  display: grid;
                  grid-template-columns: 1fr;
                  gap: 1.5rem 2rem;
                  width: 100%;
                }
                @media (min-width: 600px) {
                  .archived-modal-grid-responsive {
                    grid-template-columns: 1fr 1fr;
                  }
                  .archived-modal-grid-responsive > div[style] {
                    grid-column: unset !important;
                  }
                  .archived-modal-grid-responsive > div[style*='grid-column: 1 / span 1'] {
                    grid-column: 1 / span 1 !important;
                  }
                  .archived-modal-grid-responsive > div[style*='grid-column: 2 / span 1'] {
                    grid-column: 2 / span 1 !important;
                  }
                  .archived-modal-grid-responsive > div[style*='grid-column: 1 / span 2'] {
                    grid-column: 1 / span 2 !important;
                  }
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    const fetchDeletedSubmissions = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/thesis/trash');
            if (response.data.status === 'success') {
                setDeletedSubmissions(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching trash:', error);
            setError('Failed to fetch deleted submissions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSectionChange = (section) => {
        navigate(`/admin-dashboard/${section}`);
    };

    const handleRecover = async (submissionId) => {
        try {
            const response = await axios.put(`http://localhost:8080/api/thesis/recover/${submissionId}`);
            if (response.data.status === 'success') {
                setShowRestoreSuccess(true);
                setTimeout(() => setShowRestoreSuccess(false), 2500);
                fetchDeletedSubmissions();
                setShowRecoveryModal(false);
            }
        } catch (error) {
            console.error('Error recovering submission:', error);
            setError('Failed to recover submission. Please try again.');
        }
    };

    const confirmRecover = (submission) => {
        setSelectedSubmission(submission);
        setShowRecoveryModal(true);
    };

    const confirmPermanentDelete = (submissionId) => {
        setSelectedPermanentDeleteId(submissionId);
        setDeletePermanentModal(true);
        setDeleteConfirmationText(''); // Reset confirmation text
    };

    const handlePermanentDelete = async (submissionId) => {
        if (deleteConfirmationText !== 'DELETE') {
            setError('Please type "DELETE" to confirm permanent deletion.');
            return;
        }
        try {
            const response = await axios.delete(
                `http://localhost:8080/api/thesis/permanent-delete/${submissionId}`
            );
            if (response.data.status === 'success') {
                setShowDeleteSuccess(true);
                setTimeout(() => setShowDeleteSuccess(false), 2500);
                fetchDeletedSubmissions();
                setDeletePermanentModal(false);
            }
        } catch (error) {
            console.error('Error permanently deleting submission:', error);
            setError('Failed to permanently delete submission. Please try again.');
        }
    };

    const renderDeletePermanentModal = () => (
        <Modal show={deletePermanentModal} onHide={() => setDeletePermanentModal(false)} centered backdropClassName="custom-modal-backdrop" dialogClassName="custom-archive-modal-dialog">
            <div style={{
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 8px 32px rgba(30,41,59,0.18)',
                maxWidth: 420,
                width: '98vw',
                margin: 'auto',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                overflowX: 'hidden',
            }}>
                <Modal.Header style={{ borderBottom: 'none', padding: '1.2rem 1.2rem 0.5rem 1.2rem', background: 'transparent', borderTopLeftRadius: 16, borderTopRightRadius: 16, justifyContent: 'center' }}>
                    <Modal.Title style={{ fontWeight: 700, fontSize: '1.2rem', color: '#1e293b', letterSpacing: 0.1, textAlign: 'center', width: '100%', wordBreak: 'break-word' }}>
                        Confirm permanent deletion
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '1rem 1.2rem 0.5rem 1.2rem', color: '#334155', fontSize: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <div style={{ color: '#64748b', fontSize: 15, marginBottom: 16, textAlign: 'center', maxWidth: 340, wordBreak: 'break-word' }}>
                        To proceed, type "DELETE" in the box below. This action is irreversible.
                    </div>
                    <input
                        type="text"
                        placeholder="Type DELETE to confirm"
                        value={deleteConfirmationText}
                        onChange={e => setDeleteConfirmationText(e.target.value)}
                        style={{
                            width: '100%',
                            maxWidth: 320,
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            fontSize: 15,
                            marginBottom: 24,
                            outline: 'none',
                            color: '#1e293b',
                            background: '#f8fafc',
                            boxSizing: 'border-box',
                            wordBreak: 'break-word',
                        }}
                    />
                </Modal.Body>
                <Modal.Footer style={{ borderTop: 'none', padding: '1rem 1.2rem 1.2rem 1.2rem', background: '#f8fafc', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, display: 'flex', justifyContent: 'flex-end', gap: 12, width: '100%' }}>
                    <Button
                        variant="outline-secondary"
                        className="capstone-action-btn capstone-action-btn--sm"
                        onClick={() => setDeletePermanentModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        className="capstone-action-btn capstone-action-btn--sm"
                        onClick={() => handlePermanentDelete(selectedPermanentDeleteId)}
                        disabled={deleteConfirmationText !== 'DELETE'}
                    >
                        <FaTrash className="me-1" size={14} />
                        Delete Permanently
                    </Button>
                </Modal.Footer>
            </div>
        </Modal>
    );

    const filteredSubmissions = deletedSubmissions.filter(sub => {
        const matchesTitle = sub.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter ? sub.category === categoryFilter : true;
        return matchesTitle && matchesCategory;
    });

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
                                        <h3 className="mb-0">
                                            <FaTrash className="me-2" />
                                            Archived Capstones
                                        </h3>
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
                                                        placeholder="Search by title..."
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
                                            <div className="position-relative" style={{ marginLeft: 16 }}>
                                                <Form.Select
                                                    style={{ 
                                                        width: 180, 
                                                        fontSize: 15,
                                                        height: '44px',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '8px',
                                                        background: '#fff',
                                                        color: '#374151',
                                                        padding: '0 12px',
                                                        paddingRight: '35px',
                                                        appearance: 'none',
                                                        WebkitAppearance: 'none',
                                                        MozAppearance: 'none'
                                                    }}
                                                    value={categoryFilter}
                                                    onChange={e => setCategoryFilter(e.target.value)}
                                                >
                                                    <option value="">All Categories</option>
                                                    {categories.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </Form.Select>
                                                <div style={{
                                                    position: 'absolute',
                                                    right: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    pointerEvents: 'none',
                                                    color: '#6b7280'
                                                }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="6,9 12,15 18,9"></polyline>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body p-3" style={{ 
                                    height: 'calc(100% - 60px)',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    {error && (
                                        <Alert variant="danger" className="mb-4">
                                            <FaExclamationTriangle className="me-2" />
                                            {error}
                                        </Alert>
                                    )}

                                    {loading ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
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
                                                            <th style={{ width: '25%', minWidth: '200px' }}>Category</th>
                                                            <th style={{ width: '20%', minWidth: '200px' }}>Archived On</th>
                                                            <th style={{ width: '30%', minWidth: '300px' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredSubmissions.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="4" className="text-center py-4">
                                                                    No archived submissions found.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            filteredSubmissions.map((submission) => (
                                                                <tr key={submission._id}>
                                                                    <td>{submission.title}</td>
                                                                    <td><span style={{
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
                                                                    }}>{submission.category}</span></td>
                                                                    <td>
                                                                        {new Date(submission.deletedAt).toLocaleDateString('en-US', {
                                                                            year: 'numeric',
                                                                            month: 'long',
                                                                            day: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                        })}
                                                                    </td>
                                                                    <td>
                                                                        <div className="d-flex gap-2">
                                                                            <Button
                                                                                variant="outline-info"
                                                                                size="sm"
                                                                                className="d-inline-flex align-items-center justify-content-center capstone-action-btn capstone-action-btn--sm"
                                                                                onClick={() => confirmRecover(submission)}
                                                                            >
                                                                                <FaUndo className="me-1" size={14} />
                                                                                Restore
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline-danger"
                                                                                size="sm"
                                                                                className="d-inline-flex align-items-center justify-content-center capstone-action-btn capstone-action-btn--sm"
                                                                                onClick={() => confirmPermanentDelete(submission._id)}
                                                                            >
                                                                                <FaTrash className="me-1" size={14} />
                                                                                Delete Permanently
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showRecoveryModal && (
                <div className={`custom-modal show`} onClick={() => setShowRecoveryModal(false)}>
                    <div className="custom-modal-content" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '1000px' }}>
                        <div className="custom-modal-header bg-gradient-primary text-white">
                            <h3>
                                <FaUndo className="me-2" />
                                Restore Capstone Details
                            </h3>
                            <button 
                                onClick={() => setShowRecoveryModal(false)} 
                                className="close-button"
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: '#fff', 
                                    fontSize: '24px', 
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
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
                                    e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                }}
                                onMouseOut={e => {
                                    e.target.style.backgroundColor = 'transparent';
                                }}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="custom-modal-body">
                            {selectedSubmission && (
                                <div className="review-content">
                                    {/* Title Section */}
                                    <div className="p-4 bg-light border-bottom">
                                        <h6 className="text-primary mb-2" style={{ letterSpacing: '0.5px', fontSize: '0.85rem' }}>
                                            ARCHIVED CAPSTONE DETAILS
                                        </h6>
                                        <h4 className="mb-0 fw-bold" style={{ color: '#2c3e50', lineHeight: '1.4' }}>
                                            {selectedSubmission.title}
                                        </h4>
                                    </div>
                                    {/* Details Grid */}
                                    <div className="p-4">
                                        <div className="row g-4">
                                            <div className="col-md-6">
                                                <div className="mb-2"><strong>Category:</strong> <span style={{ display: 'inline-block', background: '#e0e7ff', color: '#3730a3', borderRadius: '999px', fontWeight: 600, fontSize: '0.85em', padding: '0.18em 0.9em', letterSpacing: 0.5, textTransform: 'uppercase', border: 'none', margin: 0 }}>{selectedSubmission.category || 'N/A'}</span></div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-2"><strong>Student Email:</strong> {selectedSubmission.email}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-2"><strong>Submission Date:</strong> {selectedSubmission.createdAt ? new Date(selectedSubmission.createdAt).toLocaleString() : 'N/A'}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-2"><strong>Attached File:</strong> {selectedSubmission.docsLink ? (<a href={selectedSubmission.docsLink} target="_blank" rel="noopener noreferrer">View Document</a>) : 'No file attached.'}</div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="mb-2"><strong>Group Members:</strong> {Array.isArray(selectedSubmission.members) && selectedSubmission.members.length > 0 ? selectedSubmission.members.map((m, i) => (<span key={i} style={{ display: 'inline-block', marginRight: 8, color: '#475569', fontSize: 15, wordBreak: 'break-word' }}>{m}</span>)) : <span style={{ color: '#64748b' }}>No members listed.</span>}</div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="mb-2"><strong>Keywords:</strong> {Array.isArray(selectedSubmission.keywords) && selectedSubmission.keywords.length > 0 ? selectedSubmission.keywords.map((kw, i) => (<span key={i} style={{ display: 'inline-block', marginRight: 6, marginBottom: 2, background: '#e2e8f0', color: '#334155', borderRadius: 8, fontWeight: 500, fontSize: 13, padding: '0.18em 0.9em' }}>{kw}</span>)) : <span style={{ color: '#64748b' }}>No keywords.</span>}</div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="mb-2"><strong>Abstract:</strong></div>
                                                <div style={{ color: '#475569', fontSize: 15, whiteSpace: 'pre-line', marginTop: 2, wordBreak: 'break-word', background: '#f8fafc', borderRadius: 6, padding: '12px 16px', lineHeight: 1.7 }}>{selectedSubmission.abstract || 'No abstract provided.'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Action Buttons */}
                                    <div className="d-flex justify-content-end gap-3 p-3" style={{ background: '#f8fafc', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
                                        <Button
                                            variant="primary"
                                            className="capstone-action-btn capstone-action-btn--sm"
                                            onClick={() => handleRecover(selectedSubmission?._id)}
                                            style={{ minWidth: 120, fontWeight: 600, borderRadius: 8, boxShadow: '0 2px 8px rgba(37,99,235,0.15)', background: '#2563eb', border: 'none' }}
                                        >
                                            <FaUndo className="me-1" size={14} />
                                            Restore
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            className="capstone-action-btn capstone-action-btn--sm"
                                            onClick={() => setShowRecoveryModal(false)}
                                            style={{ minWidth: 120, fontWeight: 600, borderRadius: 8 }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {renderDeletePermanentModal()}

            {/* Success Pop-up Modals */}
            {showRestoreSuccess && (
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
                        <span style={{ fontSize: 38, color: '#22c55e', marginBottom: 8 }}>✔️</span>
                        <div style={{ fontWeight: 700, fontSize: 18, color: '#15803d', marginBottom: 4 }}>Capstone successfully restored and moved back to active records.</div>
                        <button onClick={() => setShowRestoreSuccess(false)} style={{ marginTop: 8, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Close</button>
                    </div>
                </div>
            )}
            {showDeleteSuccess && (
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
                        background: '#fbeaea',
                        border: '1.5px solid #ef4444',
                        borderRadius: 14,
                        boxShadow: '0 4px 24px rgba(239,68,68,0.10)',
                        padding: '2rem 2.5rem',
                        minWidth: 320,
                        maxWidth: '90vw',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <span style={{ fontSize: 38, color: '#ef4444', marginBottom: 8 }}>🗑️</span>
                        <div style={{ fontWeight: 700, fontSize: 18, color: '#b91c1c', marginBottom: 4 }}>Capstone has been permanently deleted and cannot be recovered.</div>
                        <button onClick={() => setShowDeleteSuccess(false)} style={{ marginTop: 8, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArchivedCapstones;
