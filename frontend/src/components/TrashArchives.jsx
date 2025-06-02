import React, { useEffect, useState } from 'react';
import { Table, Button, Alert, Badge, Modal, Card, Form } from 'react-bootstrap';
import { FaTrash, FaUndo, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import AdminNavbar from '../Navbar/Admin-Navbar/AdminNavbar';
import AdminTopbar from '../Topbar/Admin-Topbar/AdminTopbar';
import { useNavigate } from 'react-router-dom';

const TrashArchives = () => {
    const [deletedSubmissions, setDeletedSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [activeSection, setActiveSection] = useState('trash-archives');
    const [deletePermanentModal, setDeletePermanentModal] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [selectedPermanentDeleteId, setSelectedPermanentDeleteId] = useState(null);
    const navigate = useNavigate();

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
        setActiveSection(section);
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
                <AdminTopbar userInfo={JSON.parse(localStorage.getItem('user-info'))} />
                
                <div style={{ paddingTop: '60px' }}>
                    <div className="container-fluid" style={{ minWidth: '1200px', padding: '15px' }}>
                        <div className="card shadow h-100">
                            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-2">
                                <h3 className="mb-0">
                                    <FaTrash className="me-2" />
                                    Trash Archives
                                </h3>
                            </div>
                            <div className="card-body p-3" style={{ height: 'calc(100% - 60px)', display: 'flex', flexDirection: 'column' }}>
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

            <Modal show={showRecoveryModal} onHide={() => setShowRecoveryModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Recovery</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to recover this submission?
                    <div className="mt-3">
                        <strong>Title:</strong> {selectedSubmission?.title}
                    </div>
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
