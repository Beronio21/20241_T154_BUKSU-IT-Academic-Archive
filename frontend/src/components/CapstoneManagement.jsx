import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

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
        id: null, // For editing
        objective: '', // Add objective to form state
    });
    const [isEditing, setIsEditing] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [error, setError] = useState(null);

    const categories = ['IoT', 'AI', 'ML', 'Sound', 'Camera'];

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/thesis/submissions');
            const data = await response.json();
            if (data.status === 'success') {
                setSubmissions(data.data);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.abstract.trim() || !formData.category) {
            setError('All fields are required');
            return;
        }
        setError(null);

        try {
            if (isEditing) {
                // Update existing submission
                await axios.put(`http://localhost:8080/api/thesis/${formData.id}`, formData);
            } else {
                // Create new submission
                await axios.post('http://localhost:8080/api/thesis/submit', formData);
            }
            fetchSubmissions(); // Refresh submissions
            resetForm();
            setShowEditModal(false);
        } catch (error) {
            console.error('Error submitting thesis:', error);
            setError('Failed to submit thesis');
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
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this submission?')) {
            try {
                await axios.delete(`http://localhost:8080/api/thesis/delete/${id}`);
                fetchSubmissions(); // Refresh submissions
            } catch (error) {
                console.error('Error deleting thesis:', error);
            }
        }
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

    return (
        <div className="capstone-management-container">
            <h2>Capstone Management</h2>
            <Button variant="primary" onClick={() => setShowEditModal(true)}>Add New Submission</Button>
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Submission' : 'Add New Submission'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="title">Research Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="objective">Research Objective</label>
                            <textarea
                                id="objective"
                                name="objective"
                                value={formData.objective}
                                onChange={handleInputChange}
                                className="form-control"
                                placeholder="Enter the research objective"
                                rows="3"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="abstract">Abstract</label>
                            <textarea
                                id="abstract"
                                name="abstract"
                                value={formData.abstract}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="keywords">Keywords</label>
                            {formData.keywords.map((keyword, index) => (
                                <div key={index} className="d-flex">
                                    <input
                                        type="text"
                                        name="keywords"
                                        value={keyword}
                                        onChange={(e) => handleInputChange(e, index)}
                                        className="form-control"
                                        placeholder="Enter a keyword"
                                        required
                                    />
                                    <button type="button" onClick={() => removeKeyword(index)} className="btn btn-secondary">Remove</button>
                                </div>
                            ))}
                            <button type="button" onClick={addKeyword} className="btn btn-secondary">Add Keyword</button>
                        </div>

                        <div className="form-group">
                            <label htmlFor="members">Members</label>
                            {formData.members.map((member, index) => (
                                <div key={index} className="d-flex">
                                    <input
                                        type="text"
                                        name="members"
                                        value={member}
                                        onChange={(e) => handleInputChange(e, index)}
                                        className="form-control"
                                        placeholder="Enter a member's name"
                                        required
                                    />
                                    <button type="button" onClick={() => removeMember(index)} className="btn btn-secondary">Remove</button>
                                </div>
                            ))}
                            <button type="button" onClick={addMember} className="btn btn-secondary">Add Member</button>
                        </div>

                        <div className="form-group">
                            <label htmlFor="adviserEmail">Admin Email</label>
                            <input
                                type="email"
                                id="adviserEmail"
                                name="adviserEmail"
                                value={formData.adviserEmail}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="docsLink">Document Link</label>
                            <input
                                type="text"
                                id="docsLink"
                                name="docsLink"
                                value={formData.docsLink}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <Button variant="primary" type="submit">{isEditing ? 'Update Submission' : 'Submit Submission'}</Button>
                        {error && <div className="error">{error}</div>}
                    </form>
                </Modal.Body>
            </Modal>

            {loading ? (
                <p>Loading submissions...</p>
            ) : (
                <table className="capstone-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Objective</th>
                            <th>Members</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>
                                    No submissions available
                                </td>
                            </tr>
                        ) : (
                            submissions.map((submission) => (
                                <tr key={submission._id}>
                                    <td>{submission.title}</td>
                                    <td>{submission.objective}</td>
                                    <td>{submission.members.join(', ')}</td>
                                    <td>{submission.email}</td>
                                    <td>{submission.status}</td>
                                    <td>
                                        <Button 
                                            onClick={() => handleEdit(submission)}
                                            className="btn-edit"
                                        >
                                            Edit
                                        </Button>
                                        <Button 
                                            onClick={() => handleDelete(submission._id)}
                                            className="btn-delete"
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CapstoneManagement; 