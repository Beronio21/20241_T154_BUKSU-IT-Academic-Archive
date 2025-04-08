import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Table, InputGroup, Form, Pagination, Card, Badge, Alert } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaExclamationTriangle, FaFileAlt, FaUser, FaKey, FaEnvelope, FaLink } from 'react-icons/fa';

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
            } else {
                await axios.post('http://localhost:8080/api/thesis/submit', formData);
            }
            fetchSubmissions();
            resetForm();
            setShowEditModal(false);
        } catch (error) {
            console.error('Error submitting thesis:', error);
            setError('Failed to submit thesis. Please try again.');
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
                fetchSubmissions();
                setShowDeleteModal(false);
                setSelectedSubmission(null);
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

    // Filter and pagination logic
    const filteredSubmissions = submissions.filter(submission =>
        submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.members.some(member => member.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
                                                    <th style={{ width: '200px' }}>Title</th>
                                                    <th style={{ width: '200px' }}>Objective</th>
                                                    <th style={{ width: '200px' }}>Members</th>
                                                    <th style={{ width: '150px' }}>Email</th>
                                                    <th style={{ width: '100px' }}>Status</th>
                                                    <th style={{ width: '100px' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentSubmissions.map((submission) => (
                                                    <tr key={submission._id}>
                                                        <td>{submission.title}</td>
                                                        <td>{submission.objective}</td>
                                                        <td>{submission.members.join(', ')}</td>
                                                        <td>{submission.email}</td>
                                                        <td>
                                                            <span className={`badge ${submission.status?.toLowerCase() === 'approved' ? 'bg-success' : 'bg-warning'}`}>
                                                                {submission.status || 'Pending'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <Button
                                                                variant="info"
                                                                size="sm"
                                                                className="me-2"
                                                                onClick={() => handleEdit(submission)}
                                                            >
                                                                <FaEdit />
                                                            </Button>
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedSubmission(submission);
                                                                    setShowDeleteModal(true);
                                                                }}
                                                            >
                                                                <FaTrash />
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

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>{isEditing ? 'Edit Research Paper' : 'Add New Research Paper'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6">
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
                                    <textarea
                                        className="form-control"
                                        name="objective"
                                        value={formData.objective}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Enter research objective"
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
                                <div className="mb-3">
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
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label required">
                                        <FaUser className="me-2" />
                                        Members
                                    </label>
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
                                </div>

                                <div className="mb-3">
                                    <label className="form-label required">
                                        <FaKey className="me-2" />
                                        Keywords
                                    </label>
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
                                </div>

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

                                <div className="mb-3">
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
                            </div>
                        </div>

                        {error && (
                            <Alert variant="danger" className="mt-3">
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
                                    isEditing ? 'Update Research Paper' : 'Submit Research Paper'
                                )}
                            </Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>

            {/* Delete Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header className="bg-danger text-white">
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this research paper?</p>
                    {selectedSubmission && (
                        <>
                            <p className="mb-0"><strong>Title:</strong> {selectedSubmission.title}</p>
                            <p className="mb-0"><strong>Objective:</strong> {selectedSubmission.objective}</p>
                            <p className="mb-0"><strong>Members:</strong> {selectedSubmission.members.join(', ')}</p>
                            <p className="mb-0"><strong>Category:</strong> {selectedSubmission.category}</p>
                            <p className="mt-2 text-danger"><strong>Warning:</strong> This action cannot be undone.</p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between px-4">
                    <div className="d-flex justify-content-start">
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                    </div>
                    <div className="d-flex justify-content-end">
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CapstoneManagement; 