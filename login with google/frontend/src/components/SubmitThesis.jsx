import React, { useState } from 'react';


const SubmitThesis = () => {
    const [formData, setFormData] = useState({
        title: '',
        members: [''],
        adviserEmail: '',
        docsLink: '',
        status: 'pending'
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMemberChange = (index, value) => {
        const newMembers = [...formData.members];
        newMembers[index] = value;
        setFormData(prev => ({
            ...prev,
            members: newMembers
        }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await fetch('http://localhost:8080/api/thesis/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: formData.title,
                    members: formData.members.filter(member => member.trim() !== ''),
                    adviserEmail: formData.adviserEmail,
                    docsLink: formData.docsLink
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: 'Thesis submitted successfully!', type: 'success' });
                setFormData({
                    title: '',
                    members: [''],
                    adviserEmail: '',
                    docsLink: '',
                    status: 'pending'
                });
            } else {
                throw new Error(data.message || 'Failed to submit thesis');
            }
        } catch (error) {
            console.error('Submission error:', error);
            setMessage({ 
                text: error.message || 'Failed to submit thesis', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="submit-thesis-container">
            <h2>Submit Thesis</h2>
            
            {message.text && (
                <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="thesis-form">
                <div className="form-group">
                    <label htmlFor="title">Thesis Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                        placeholder="Enter your thesis title"
                    />
                </div>

                <div className="form-group">
                    <label>Members</label>
                    {formData.members.map((member, index) => (
                        <div key={index} className="member-input">
                            <input
                                type="text"
                                value={member}
                                onChange={(e) => handleMemberChange(index, e.target.value)}
                                className="form-control"
                                placeholder="Enter member name"
                                required
                            />
                            {index > 0 && (
                                <button
                                    type="button"
                                    onClick={() => removeMember(index)}
                                    className="btn btn-danger btn-sm"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addMember}
                        className="btn btn-secondary btn-sm"
                    >
                        Add Member
                    </button>
                </div>

                <div className="form-group">
                    <label htmlFor="adviserEmail">Adviser Email</label>
                    <input
                        type="email"
                        id="adviserEmail"
                        name="adviserEmail"
                        value={formData.adviserEmail}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                        placeholder="Enter adviser's email address"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="docsLink">Google Docs Link</label>
                    <input
                        type="url"
                        id="docsLink"
                        name="docsLink"
                        value={formData.docsLink}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                        placeholder="Paste your Google Docs link here"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="form-control"
                        disabled
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="revision">Needs Revision</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Thesis'}
                </button>
            </form>
        </div>
    );
};

export default SubmitThesis; 