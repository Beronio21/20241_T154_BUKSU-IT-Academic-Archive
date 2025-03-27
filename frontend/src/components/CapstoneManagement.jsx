import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
        id: null // For editing
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);

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
                // Update existing submission
                await axios.put(`http://localhost:8080/api/thesis/${formData.id}`, formData);
            } else {
                // Create new submission
                await axios.post('http://localhost:8080/api/thesis/submit', formData);
            }
            fetchSubmissions(); // Refresh submissions
            resetForm();
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
            id: submission._id // Set ID for editing
        });
        setIsEditing(true);
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
            id: null
        });
        setIsEditing(false);
    };

    return (
        <div>
            <h2>Capstone Management</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Research Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Abstract</label>
                    <textarea
                        name="abstract"
                        value={formData.abstract}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Keywords</label>
                    {formData.keywords.map((keyword, index) => (
                        <div key={index}>
                            <input
                                type="text"
                                name="keywords"
                                value={keyword}
                                onChange={(e) => handleInputChange(e, index)}
                                required
                            />
                            <button type="button" onClick={() => removeKeyword(index)}>Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={addKeyword}>Add Keyword</button>
                </div>
                <div>
                    <label>Members</label>
                    {formData.members.map((member, index) => (
                        <div key={index}>
                            <input
                                type="text"
                                name="members"
                                value={member}
                                onChange={(e) => handleInputChange(e, index)}
                                required
                            />
                            <button type="button" onClick={() => removeMember(index)}>Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={addMember}>Add Member</button>
                </div>
                <div>
                    <label>Adviser Email</label>
                    <input
                        type="email"
                        name="adviserEmail"
                        value={formData.adviserEmail}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Document Link</label>
                    <input
                        type="text"
                        name="docsLink"
                        value={formData.docsLink}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Category</label>
                    <select
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
                <button type="submit">{isEditing ? 'Update Submission' : 'Submit Submission'}</button>
                {error && <div className="error">{error}</div>}
            </form>

            {loading ? (
                <p>Loading submissions...</p>
            ) : (
                <table>
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
                                    <button onClick={() => handleEdit(submission)}>Edit</button>
                                    <button onClick={() => handleDelete(submission._id)}>Delete</button>
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