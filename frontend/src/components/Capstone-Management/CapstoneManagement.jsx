import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import './CapstoneManagement.css';

const CapstoneManagement = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState(initialFormData);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
    const [loadingAction, setLoadingAction] = useState(false);
    const categories = ['IoT', 'AI', 'ML', 'Sound', 'Camera'];
    const [selectAll, setSelectAll] = useState(false);
    const [checkedSubmissions, setCheckedSubmissions] = useState([]);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/thesis/submissions');
            if (response.data.status === 'success') {
                setSubmissions(response.data.data);
            } else {
                setError('Failed to fetch submissions');
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setError('Failed to fetch submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e, index = null) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updatedForm = { ...prev };
            if ((name === 'members' || name === 'keywords') && index !== null) {
                const updatedArray = [...updatedForm[name]];
                updatedArray[index] = value;
                updatedForm[name] = updatedArray;
            } else {
                updatedForm[name] = value;
            }
            return updatedForm;
        });
    };

    const addMember = () => {
        setFormData(prev => ({ ...prev, members: [...prev.members, ''] }));
    };

    const removeMember = (index) => {
        setFormData(prev => ({ ...prev, members: prev.members.filter((_, i) => i !== index) }));
    };

    const addKeyword = () => {
        setFormData(prev => ({ ...prev, keywords: [...prev.keywords, ''] }));
    };

    const removeKeyword = (index) => {
        setFormData(prev => ({ ...prev, keywords: prev.keywords.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.abstract.trim() || !formData.category) {
            setError('All fields are required');
            return;
        }
        setError(null);
        setLoadingAction(true);

        try {
            if (isEditing) {
                await axios.put(`http://localhost:8080/api/thesis/${formData.id}`, formData);
            } else {
                await axios.post('http://localhost:8080/api/thesis/submit', formData);
            }
            fetchSubmissions(); // Refresh submissions
            resetForm();
            setShowForm(false);
        } catch (error) {
            console.error('Error submitting thesis:', error);
            setError('Failed to submit thesis');
        } finally {
            setLoadingAction(false);
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
            id: submission._id, // Set ID for editing
            objective: submission.objective, // Set objective for editing
        });
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDeleteConfirmation = (id) => {
        setSelectedSubmissionId(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        setLoadingAction(true);
        try {
            await axios.delete(`http://localhost:8080/api/thesis/delete/${selectedSubmissionId}`);
            fetchSubmissions(); // Refresh submissions
        } catch (error) {
            console.error('Error deleting thesis:', error);
            setError('Failed to delete thesis');
        } finally {
            setShowDeleteModal(false);
            setSelectedSubmissionId(null);
            setLoadingAction(false);
        }
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setIsEditing(false);
        setError(null);
    };

    const toggleFormVisibility = () => {
        setShowForm(!showForm);
        if (!showForm) {
            resetForm();
        }
    };

    const handleCheck = (submissionId) => {
        setCheckedSubmissions((prev) => {
            if (prev.includes(submissionId)) {
                return prev.filter((id) => id !== submissionId);
            } else {
                return [...prev, submissionId];
            }
        });
    };

    const handleSelectAll = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            setCheckedSubmissions(submissions.map((submission) => submission._id));
        } else {
            setCheckedSubmissions([]);
        }
    };

    const handleDeleteSelected = async () => {
        if (window.confirm('Are you sure you want to delete the selected submissions?')) {
            setLoadingAction(true);
            try {
                await Promise.all(
                    checkedSubmissions.map(async (id) => {
                        await axios.delete(`http://localhost:8080/api/thesis/delete/${id}`);
                    })
                );
                fetchSubmissions(); // Refresh submissions
                setCheckedSubmissions([]);
                setSelectAll(false);
            } catch (error) {
                console.error('Error deleting selected theses:', error);
                setError('Failed to delete selected theses');
            } finally {
                setLoadingAction(false);
            }
        }
    };

    return (
        <div className="container">
            <div className="table-wrapper">
                <div className="table-title">
                    <div className="row align-items-center">
                        <div className="col-sm-6">
                            <h2>Capstone Submissions</h2>
                        </div>
                        <div className="col-sm-6 text-end">
                            <div className="d-flex justify-content-end">
                                <Button 
                                    variant="danger" 
                                    onClick={handleDeleteSelected} 
                                    disabled={checkedSubmissions.length === 0 || loadingAction} 
                                    className="btn btn-danger btn-sm me-2"
                                    title="Delete Selected Submissions"
                                >
                                    {loadingAction ? <Spinner animation="border" size="sm" /> : <span><i className="bi bi-trash"></i> Delete</span>}
                                </Button>
                                <Button 
                                    variant="success" 
                                    onClick={toggleFormVisibility} 
                                    className="btn btn-success btn-sm"
                                    title={showForm ? 'Hide Form' : 'Add New Submission'}
                                >
                                    <i className="bi bi-plus-circle"></i> <span>{showForm ? 'Hide Form' : 'Add New Submission'}</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>
                                <span className="custom-checkbox">
                                    <input type="checkbox" id="selectAll" checked={selectAll} onChange={handleSelectAll} />
                                    <label htmlFor="selectAll"></label>
                                </span>
                            </th>
                            <th>Title</th>
                            <th>Objective</th>
                            <th>Members</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="text-center">Loading submissions...</td>
                            </tr>
                        ) : submissions.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center">No submissions available</td>
                            </tr>
                        ) : (
                            submissions.map((submission) => (
                                <tr key={submission._id}>
                                    <td>
                                        <span className="custom-checkbox">
                                            <input
                                                type="checkbox"
                                                id={`checkbox${submission._id}`}
                                                name="options[]"
                                                value={submission._id}
                                                checked={checkedSubmissions.includes(submission._id)}
                                                onChange={() => handleCheck(submission._id)}
                                            />
                                            <label htmlFor={`checkbox${submission._id}`}></label>
                                        </span>
                                    </td>
                                    <td>{submission.title}</td>
                                    <td>{submission.objective}</td>
                                    <td>{submission.members.join(', ')}</td>
                                    <td>{submission.email}</td>
                                    <td>{submission.status}</td>
                                    <td>
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip id={`edit-tooltip-${submission._id}`}>Edit</Tooltip>}
                                        >
                                            <a href="#" className="edit" onClick={() => handleEdit(submission)}>
                                                <i className="bi bi-pencil"></i>
                                            </a>
                                        </OverlayTrigger>
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip id={`delete-tooltip-${submission._id}`}>Delete</Tooltip>}
                                        >
                                            <a href="#" className="delete" onClick={() => handleDeleteConfirmation(submission._id)}>
                                                <i className="bi bi-trash"></i>
                                            </a>
                                        </OverlayTrigger>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="clearfix">
                    <div className="hint-text">Showing <b>{submissions.length}</b> out of <b>{submissions.length}</b> entries</div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal show={showForm} onHide={toggleFormVisibility}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Submission' : 'Add New Submission'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="title" className="form-label">Research Title</label>
                            <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} className="form-control" required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="objective" className="form-label">Research Objective</label>
                            <textarea id="objective" name="objective" value={formData.objective} onChange={handleInputChange} className="form-control" rows="3" required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="abstract" className="form-label">Abstract</label>
                            <textarea id="abstract" name="abstract" value={formData.abstract} onChange={handleInputChange} className="form-control" rows="3" required />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Keywords</label>
                            {formData.keywords.map((keyword, index) => (
                                <div key={index} className="input-group mb-2">
                                    <input type="text" name="keywords" value={keyword} onChange={(e) => handleInputChange(e, index)} className="form-control" required />
                                    <Button variant="outline-secondary" onClick={() => removeKeyword(index)}>Remove</Button>
                                </div>
                            ))}
                            <Button variant="secondary" onClick={addKeyword}>Add Keyword</Button>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Members</label>
                            {formData.members.map((member, index) => (
                                <div key={index} className="input-group mb-2">
                                    <input type="text" name="members" value={member} onChange={(e) => handleInputChange(e, index)} className="form-control" required />
                                    <Button variant="outline-secondary" onClick={() => removeMember(index)}>Remove</Button>
                                </div>
                            ))}
                            <Button variant="secondary" onClick={addMember}>Add Member</Button>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="adviserEmail" className="form-label">Adviser Email</label>
                            <input type="email" id="adviserEmail" name="adviserEmail" value={formData.adviserEmail} onChange={handleInputChange} className="form-control" required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="docsLink" className="form-label">Document Link</label>
                            <input type="text" id="docsLink" name="docsLink" value={formData.docsLink} onChange={handleInputChange} className="form-control" required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="category" className="form-label">Category</label>
                            <select id="category" name="category" value={formData.category} onChange={handleInputChange} className="form-select" required>
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        {error && <Alert variant="danger">{error}</Alert>}
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={toggleFormVisibility}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={loadingAction}>
                        {loadingAction ? <Spinner animation="border" size="sm" /> : (isEditing ? 'Update Submission' : 'Submit Submission')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Submission</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this record?</p>
                    <p className="text-warning"><small>This action cannot be undone.</small></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={loadingAction}>
                        {loadingAction ? <Spinner animation="border" size="sm" /> : 'Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const initialFormData = {
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
};

export default CapstoneManagement;