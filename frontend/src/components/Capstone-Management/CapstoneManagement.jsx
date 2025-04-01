import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Col, Row } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCheckCircle } from 'react-icons/fa';  // Import icons for better UI

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
        id: null
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const categories = ['IoT', 'AI', 'ML', 'Sound', 'Camera'];

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/thesis/submissions');
            setSubmissions(response.data.data);
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
                await axios.put(`http://localhost:8080/api/thesis/${formData.id}`, formData);
            } else {
                await axios.post('http://localhost:8080/api/thesis/submit', formData);
            }
            fetchSubmissions();
            resetForm();
            setShowModal(false);  // Close modal after submission
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
            id: submission._id
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this submission?')) {
            try {
                await axios.delete(`http://localhost:8080/api/thesis/delete/${id}`);
                fetchSubmissions();
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
            id: null
        });
        setIsEditing(false);
    };

    return (
        <div className="container py-5">
            <h2 className="my-4 text-center text-primary">Capstone Management</h2>
            <Button 
                variant="primary" 
                size="lg" 
                onClick={() => setShowModal(true)} 
                className="mb-4 shadow-lg d-flex align-items-center justify-content-center">
                <FaPlus className="me-2" /> Add New Submission
            </Button>

            {/* Modal */}
            <Modal 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                centered
                dialogClassName="modal-modern"  // Custom class for modern styling
                className="animate__animated animate__fadeIn">
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Submission' : 'Submit New Thesis'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="title" className="mb-3">
                            <Form.Label>Research Title</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter the research title"
                                className="shadow-sm"
                            />
                        </Form.Group>

                        <Form.Group controlId="abstract" className="mb-3">
                            <Form.Label>Abstract</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="abstract"
                                value={formData.abstract}
                                onChange={handleInputChange}
                                required
                                placeholder="Write your abstract here"
                                className="shadow-sm"
                            />
                        </Form.Group>

                        <Form.Group controlId="keywords" className="mb-3">
                            <Form.Label>Keywords</Form.Label>
                            {formData.keywords.map((keyword, index) => (
                                <Row key={index} className="mb-3">
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="keywords"
                                            value={keyword}
                                            onChange={(e) => handleInputChange(e, index)}
                                            required
                                            className="shadow-sm"
                                        />
                                    </Col>
                                    <Col>
                                        <Button variant="danger" type="button" onClick={() => removeKeyword(index)} className="w-100">
                                            Remove
                                        </Button>
                                    </Col>
                                </Row>
                            ))}
                            <Button variant="outline-secondary" type="button" onClick={addKeyword} className="w-100 mb-3">
                                Add Keyword
                            </Button>
                        </Form.Group>

                        <Form.Group controlId="members" className="mb-3">
                            <Form.Label>Members</Form.Label>
                            {formData.members.map((member, index) => (
                                <Row key={index} className="mb-3">
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="members"
                                            value={member}
                                            onChange={(e) => handleInputChange(e, index)}
                                            required
                                            placeholder="Enter member name"
                                            className="shadow-sm"
                                        />
                                    </Col>
                                    <Col>
                                        <Button variant="danger" type="button" onClick={() => removeMember(index)} className="w-100">
                                            Remove
                                        </Button>
                                    </Col>
                                </Row>
                            ))}
                            <Button variant="outline-secondary" type="button" onClick={addMember} className="w-100 mb-3">
                                Add Member
                            </Button>
                        </Form.Group>

                        <Form.Group controlId="adviserEmail" className="mb-3">
                            <Form.Label>Adviser Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="adviserEmail"
                                value={formData.adviserEmail}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter adviser email"
                                className="shadow-sm"
                            />
                        </Form.Group>

                        <Form.Group controlId="docsLink" className="mb-3">
                            <Form.Label>Document Link</Form.Label>
                            <Form.Control
                                type="text"
                                name="docsLink"
                                value={formData.docsLink}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter document link"
                                className="shadow-sm"
                            />
                        </Form.Group>

                        <Form.Group controlId="category" className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Control
                                as="select"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                                className="shadow-sm"
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100 py-2 mt-3">
                            <FaCheckCircle className="me-2" />
                            {isEditing ? 'Update Submission' : 'Submit Submission'}
                        </Button>
                        {error && <div className="mt-3 text-danger">{error}</div>}
                    </Form>
                </Modal.Body>
            </Modal>

            {loading ? (
                <p className="text-center">Loading submissions...</p>
            ) : (
                <table className="table table-striped mt-4">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Submission Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.map(submission => (
                            <tr key={submission._id}>
                                <td>{submission.title}</td>
                                <td>{submission.category}</td>
                                <td>{new Date(submission.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <Button variant="warning" onClick={() => handleEdit(submission)} className="me-2">
                                        <FaEdit />
                                    </Button>
                                    <Button variant="danger" onClick={() => handleDelete(submission._id)}>
                                        <FaTrash />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CapstoneManagement;