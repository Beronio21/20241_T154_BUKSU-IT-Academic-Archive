import React, { useEffect, useState } from 'react';
import { Table, Button, Alert, Badge, Modal, Card, Form, InputGroup } from 'react-bootstrap';
import { FaTrash, FaUndo, FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminNavbar from '../Navbar/Admin-Navbar/AdminNavbar';
import '../Styles/CapstoneManagement.css';

const ArchivedCapstones = () => {
    const [deletedSubmissions, setDeletedSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [deletePermanentModal, setDeletePermanentModal] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [selectedPermanentDeleteId, setSelectedPermanentDeleteId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
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
                setSuccessMessage('Submission recovered successfully!');
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
                setSuccessMessage('Submission permanently deleted!');
                fetchDeletedSubmissions(); // Refresh the list
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
                                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-2" style={{ minHeight: '60px' }}>
                                    <h3 className="mb-0">
                                        <FaTrash className="me-2" />
                                        Archived Capstones
                                    </h3>
                                    <div className="d-flex align-items-center">
                                        <InputGroup style={{ width: '300px' }}>
                                            <InputGroup.Text>
                                                <FaSearch />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Search by title..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </InputGroup>
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

                                    {successMessage && (
                                        <Alert variant="success" className="mb-4" onClose={() => setSuccessMessage('')} dismissible>
                                            {successMessage}
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
                                                        {deletedSubmissions.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="4" className="text-center py-4">
                                                                    No archived submissions found.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            deletedSubmissions.map((submission) => (
                                                                <tr key={submission._id}>
                                                                    <td>{submission.title}</td>
                                                                    <td><Badge bg="info">{submission.category}</Badge></td>
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

            <Modal show={showRecoveryModal} onHide={() => setShowRecoveryModal(false)} centered size="md" backdropClassName="custom-modal-backdrop" dialogClassName="custom-archive-modal-dialog">
                <div style={{
                    position: 'relative',
                    background: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 8px 32px rgba(30,41,59,0.18)',
                    maxWidth: 600,
                    width: '100%',
                    margin: 'auto',
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflowX: 'hidden',
                }}>
                    <Modal.Header style={{ borderBottom: 'none', padding: '1.5rem 2rem 0.5rem 2rem', background: 'transparent', color: '#2563eb', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                        <Modal.Title style={{ fontWeight: 700, fontSize: '1.3rem', letterSpacing: 0.5, color: '#2563eb' }}>
                            Archived capstone details
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '2rem', maxHeight: '70vh', overflowY: 'auto', background: 'transparent', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
                        {selectedSubmission && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr',
                                gap: '1.5rem 2rem',
                                width: '100%',
                            }}
                            className="archived-modal-grid-responsive"
                            >
                                {/* Title */}
                                <div style={{ gridColumn: '1 / span 1', wordBreak: 'break-word' }}>
                                    <div style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>Title</div>
                                    <div style={{ color: '#1e293b', fontSize: 16, fontWeight: 500, marginTop: 2, wordBreak: 'break-word' }}>{selectedSubmission.title}</div>
                                </div>
                                {/* Category */}
                                <div style={{ gridColumn: '1 / span 1', wordBreak: 'break-word' }}>
                                    <div style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>Category</div>
                                    <Badge bg="info" style={{ fontSize: 14, marginTop: 2 }}>{selectedSubmission.category}</Badge>
                                </div>
                                {/* Student Email */}
                                <div style={{ gridColumn: '1 / span 1', wordBreak: 'break-word' }}>
                                    <div style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>Student email</div>
                                    <div style={{ color: '#475569', fontSize: 15, marginTop: 2, wordBreak: 'break-word' }}>{selectedSubmission.email}</div>
                                </div>
                                {/* Submission Date */}
                                <div style={{ gridColumn: '1 / span 1', wordBreak: 'break-word' }}>
                                    <div style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>Submission date</div>
                                    <div style={{ color: '#475569', fontSize: 15, marginTop: 2, wordBreak: 'break-word' }}>
                                        {selectedSubmission.createdAt ? new Date(selectedSubmission.createdAt).toLocaleString('en-US', {
                                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        }) : 'N/A'}
                                    </div>
                                </div>
                                {/* Abstract (full width) */}
                                <div style={{ gridColumn: '1 / span 1', borderTop: '1px solid #e5e7eb', paddingTop: 12, wordBreak: 'break-word' }}>
                                    <div style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>Abstract</div>
                                    <div style={{ color: '#475569', fontSize: 15, whiteSpace: 'pre-line', marginTop: 2, wordBreak: 'break-word' }}>{selectedSubmission.abstract || 'No abstract provided.'}</div>
                                </div>
                                {/* Keywords */}
                                <div style={{ gridColumn: '1 / span 1', borderTop: '1px solid #e5e7eb', paddingTop: 12, wordBreak: 'break-word' }}>
                                    <div style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>Keywords</div>
                                    <div style={{ marginTop: 2, wordBreak: 'break-word' }}>
                                        {Array.isArray(selectedSubmission.keywords) && selectedSubmission.keywords.length > 0
                                            ? selectedSubmission.keywords.map((kw, i) => (
                                                <Badge key={i} bg="secondary" style={{ marginRight: 6, marginBottom: 2, fontSize: 13 }}>{kw}</Badge>
                                            ))
                                            : <span style={{ color: '#64748b' }}>No keywords.</span>}
                                    </div>
                                </div>
                                {/* Group Members */}
                                <div style={{ gridColumn: '1 / span 1', borderTop: '1px solid #e5e7eb', paddingTop: 12, wordBreak: 'break-word' }}>
                                    <div style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>Group members</div>
                                    <div style={{ marginTop: 2, wordBreak: 'break-word' }}>
                                        {Array.isArray(selectedSubmission.members) && selectedSubmission.members.length > 0
                                            ? selectedSubmission.members.map((m, i) => (
                                                <span key={i} style={{ display: 'inline-block', marginRight: 8, color: '#475569', fontSize: 15, wordBreak: 'break-word' }}>{m}</span>
                                            ))
                                            : <span style={{ color: '#64748b' }}>No members listed.</span>}
                                    </div>
                                </div>
                                {/* Attached File (full width) */}
                                <div style={{ gridColumn: '1 / span 1', borderTop: '1px solid #e5e7eb', paddingTop: 12, wordBreak: 'break-word' }}>
                                    <div style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>Attached file</div>
                                    {selectedSubmission.docsLink ? (
                                        <a href={selectedSubmission.docsLink} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline', fontSize: 15, wordBreak: 'break-word' }}>
                                            View document
                                        </a>
                                    ) : (
                                        <span style={{ color: '#64748b' }}>No file attached.</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer style={{ borderTop: 'none', padding: '1.5rem 2rem', background: '#f8fafc', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <Button
                            variant="primary"
                            className="capstone-action-btn capstone-action-btn--sm"
                            onClick={() => handleRecover(selectedSubmission?._id)}
                        >
                            <FaUndo className="me-1" size={14} />
                            Restore
                        </Button>
                        <Button
                            variant="outline-secondary"
                            className="capstone-action-btn capstone-action-btn--sm"
                            onClick={() => setShowRecoveryModal(false)}
                        >
                            Cancel
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>

            {renderDeletePermanentModal()}
        </div>
    );
};

export default ArchivedCapstones;
