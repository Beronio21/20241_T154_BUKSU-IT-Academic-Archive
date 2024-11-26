import React, { useState, useEffect } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import './SubmitThesis.css';

const SubmitThesis = () => {
    const [formData, setFormData] = useState({
        title: '',
        members: [''],
        adviserEmail: '',
        docsLink: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [openPicker] = useDrivePicker();

    useEffect(() => {
        const userInfoString = localStorage.getItem('user-info');
        console.log('Raw user info from localStorage:', userInfoString);
        
        if (userInfoString) {
            const userInfo = JSON.parse(userInfoString);
            console.log('Parsed user info:', userInfo);
        }
    }, []);

    const handleInputChange = (e, index = null) => {
        const { name, value } = e.target;
        
        if (name === 'members' && index !== null) {
            const updatedMembers = [...formData.members];
            updatedMembers[index] = value;
            setFormData(prev => ({
                ...prev,
                members: updatedMembers
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

    const handleOpenPicker = () => {
        openPicker({
            clientId: "736065879191-hhi3tmfi3ftr54m6r37ilftckkbcojsb.apps.googleusercontent.com",
            developerKey: "AIzaSyBefZhoxSibx9ORWrmhrH3I8L_Cz1OB33E",
            viewId: "DOCS",
            showUploadView: true,
            showUploadFolders: true,
            supportDrives: true,
            multiselect: false,
            callbackFunction: (data) => {
                if (data.action === 'picked') {
                    const docUrl = data.docs[0].url;
                    setFormData(prev => ({
                        ...prev,
                        docsLink: docUrl
                    }));
                }
            },
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            
            const submissionData = {
                title: formData.title,
                members: formData.members.filter(member => member.trim() !== ''),
                adviserEmail: formData.adviserEmail,
                docsLink: formData.docsLink,
                email: userInfo.email
            };

            console.log('Submitting thesis data:', submissionData);

            const response = await fetch('http://localhost:8080/api/thesis/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify(submissionData)
            });

            const data = await response.json();
            console.log('Server response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit thesis');
            }

            alert('Thesis submitted successfully!');
            setFormData({
                title: '',
                members: [''],
                adviserEmail: '',
                docsLink: ''
            });
        } catch (error) {
            console.error('Submission error:', error);
            setError(error.message);
            alert('Failed to submit thesis: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="submit-thesis-container">
            <h2>Submit Thesis</h2>
            <button
                type="button"
                onClick={() => {
                    const userInfo = JSON.parse(localStorage.getItem('user-info'));
                    console.log('Current user info:', userInfo);
                    alert(`
                        User ID: ${userInfo?.id || 'Not found'}
                        User _id: ${userInfo?._id || 'Not found'}
                        userId: ${userInfo?.userId || 'Not found'}
                        Role: ${userInfo?.role || 'Not found'}
                    `);
                }}
                className="btn btn-secondary mb-3"
            >
                Debug User Info
            </button>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Thesis Title:</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter thesis title"
                    />
                </div>

                <div className="form-group">
                    <label>Members:</label>
                    {formData.members.map((member, index) => (
                        <div key={index} className="member-input">
                            <input
                                type="text"
                                name="members"
                                value={member}
                                onChange={(e) => handleInputChange(e, index)}
                                placeholder="Enter member name"
                                required
                            />
                            {formData.members.length > 1 && (
                                <button 
                                    type="button" 
                                    onClick={() => removeMember(index)}
                                    className="remove-member"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                    <button 
                        type="button" 
                        onClick={addMember}
                        className="add-member"
                    >
                        Add Member
                    </button>
                </div>

                <div className="form-group">
                    <label>Adviser Email:</label>
                    <input
                        type="email"
                        name="adviserEmail"
                        value={formData.adviserEmail}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter adviser's email"
                    />
                </div>

                <div className="form-group">
                    <label>Document Link:</label>
                    <input
                        type="url"
                        name="docsLink"
                        value={formData.docsLink}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter Google Docs link"
                    />
                    <button 
                        type="button" 
                        onClick={handleOpenPicker}
                        className="btn btn-primary mt-2"
                    >
                        Select from Google Drive
                    </button>
                </div>

                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Thesis'}
                </button>

                {error && <div className="error-message">{error}</div>}
            </form>
        </div>
    );
};

export default SubmitThesis; 