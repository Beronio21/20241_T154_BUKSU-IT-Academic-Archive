import React, { useEffect, useState } from 'react';
import { Table, Button, Alert, Badge, Modal, Card, Form, InputGroup } from 'react-bootstrap';
import { FaTrash, FaUndo, FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminNavbar from '../Navbar/Admin-Navbar/AdminNavbar';

const TrashArchives = () => {
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
        <Modal show={deletePermanentModal} onHide={() => setDeletePermanentModal(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Permanent Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert variant="danger">
                    <FaExclamationTriangle className="me-2" />
                    Type "DELETE" to confirm permanent deletion. This cannot be undone!
                </Alert>
                <Form.Control
                    type="text"
                    placeholder="Type DELETE to confirm"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setDeletePermanentModal(false)}>
                    Cancel
                </Button>
                <Button 
                    variant="danger" 
                    onClick={() => handlePermanentDelete(selectedPermanentDeleteId)}
                    disabled={deleteConfirmationText !== 'DELETE'}
                >
                    <FaTrash className="me-1" />
                    Delete Permanently
                </Button>
            </Modal.Footer>
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
                                        Trash Archives
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
                                                            <th style={{ width: '20%', minWidth: '200px' }}>Deleted On</th>
                                                            <th style={{ width: '30%', minWidth: '300px' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {deletedSubmissions.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="4" className="text-center py-4">
                                                                    No deleted submissions found.
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
                                                                                variant="success"
                                                                                size="sm"
                                                                                onClick={() => confirmRecover(submission)}
                                                                            >
                                                                                <FaUndo className="me-1" />
                                                                                Recover
                                                                            </Button>
                                                                            <Button
                                                                                variant="danger"
                                                                                size="sm"
                                                                                onClick={() => confirmPermanentDelete(submission._id)}
                                                                            >
                                                                                <FaTrash className="me-1" />
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

            <Modal show={showRecoveryModal} onHide={() => setShowRecoveryModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Capstone Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedSubmission && (
                        <div style={{ background: '#f8f9fa', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            <h4 style={{ color: '#2d3436', fontWeight: 700, marginBottom: 10 }}>{selectedSubmission.title}</h4>
                            <div style={{ marginBottom: 12, color: '#636e72', fontSize: 15 }}>
                                <span style={{ fontWeight: 600 }}>Category:</span> <Badge bg="info">{selectedSubmission.category}</Badge>
                            </div>
                            <hr style={{ margin: '12px 0' }} />
                            <div style={{ marginBottom: 10 }}>
                                <span style={{ fontWeight: 600, color: '#2d3436' }}>Abstract:</span>
                                <div style={{ color: '#636e72', fontSize: 15, marginTop: 4 }}>{selectedSubmission.abstract || 'No abstract provided.'}</div>
                            </div>
                            <div style={{ marginBottom: 10 }}>
                                <span style={{ fontWeight: 600, color: '#2d3436' }}>Keywords:</span>
                                <div style={{ color: '#636e72', fontSize: 15, marginTop: 4 }}>
                                    {Array.isArray(selectedSubmission.keywords) && selectedSubmission.keywords.length > 0
                                        ? selectedSubmission.keywords.map((kw, i) => (
                                            <Badge key={i} bg="secondary" style={{ marginRight: 6, marginBottom: 2 }}>{kw}</Badge>
                                        ))
                                        : 'No keywords.'}
                                </div>
                            </div>
                            <div style={{ marginBottom: 10 }}>
                                <span style={{ fontWeight: 600, color: '#2d3436' }}>Group Members:</span>
                                <div style={{ color: '#636e72', fontSize: 15, marginTop: 4 }}>
                                    {Array.isArray(selectedSubmission.members) && selectedSubmission.members.length > 0
                                        ? selectedSubmission.members.map((m, i) => (
                                            <span key={i} style={{ display: 'inline-block', marginRight: 8 }}>{m}</span>
                                        ))
                                        : 'No members listed.'}
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRecoveryModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="success" onClick={() => handleRecover(selectedSubmission?._id)}>
                        <FaUndo className="me-1" />
                        Recover
                    </Button>
                </Modal.Footer>
            </Modal>

            {renderDeletePermanentModal()}
        </div>
    );
};

export default TrashArchives;
