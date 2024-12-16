import React, { useState, useEffect } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import '../Styles/SubmitThesis.css';

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                docsLink: fileUrl
            }));
        }
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
                    'Authorization': `Bearer ${userInfo.token}` // Authorization Logic
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
        <div className="submit-thesis-container container mt-4">
            <h2 className="mb-4">Submit Thesis</h2>

            <form onSubmit={handleSubmit} className="shadow p-4 bg-light rounded">
                <div className="row mb-3">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="title">Thesis Title:</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className="form-control"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter thesis title"
                            />
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="adviserEmail">Adviser Email:</label>
                            <input
                                type="email"
                                id="adviserEmail"
                                name="adviserEmail"
                                className="form-control"
                                value={formData.adviserEmail}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter adviser's email"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group mb-4">
                    <label htmlFor="members" style={{ fontWeight: '600', fontSize: '1.1rem', color: '#333' }}>Members:</label>
                    {formData.members.map((member, index) => (
                        <div key={index} className="mb-3 position-relative">
                            <input
                                type="text"
                                className="form-control"
                                name="members"
                                value={member}
                                onChange={(e) => handleInputChange(e, index)}
                                placeholder="Enter member name"
                                required
                                style={{
                                    borderRadius: '8px',
                                    padding: '0.8rem 1.2rem',
                                    border: '1px solid #ccc',
                                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                                    transition: 'border-color 0.3s ease',
                                    outline: 'none',
                                    fontSize: '1rem',
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#007BFF'}
                                onBlur={(e) => e.target.style.borderColor = '#ccc'}
                            />
                            <span
                                onClick={() => removeMember(index)}
                                className="text-danger position-absolute"
                                style={{
                                    top: '50%',
                                    right: '10px',
                                    transform: 'translateY(-50%)',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    textDecoration: 'none',
                                    padding: '0.2rem 0.5rem',
                                    transition: 'background-color 0.3s ease, color 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.color = '#fff';
                                    e.target.style.backgroundColor = '#dc3545';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.color = 'red';
                                    e.target.style.backgroundColor = 'transparent';
                                }}
                            >
                                <i className="fas fa-trash-alt me-1"></i> Remove
                            </span>
                        </div>
                    ))}
                    <div className="d-flex justify-content-start mb-3">
                        <button
                            type="button"
                            onClick={addMember}
                            className="btn btn-outline-primary"
                            style={{
                                padding: '0.6rem 1.5rem',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '1rem',
                                backgroundColor: 'transparent',
                                borderColor: '#007BFF',
                                color: '#007BFF',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onMouseEnter={(e) => e.target.style.borderColor = '#0056b3'}
                            onMouseLeave={(e) => e.target.style.borderColor = '#007BFF'}
                        >
                            <i className="fas fa-plus me-2"></i> Add Member
                        </button>
                    </div>
                </div>

                <div className="form-group mb-3">
                    <label>Document Link:</label>
                    <div className="d-flex align-items-center">
                        <span className="me-3">
                            {formData.docsLink || 'No document selected'}
                        </span>
                        <button
                            type="button"
                            onClick={handleOpenPicker}
                            className="btn btn-outline-info btn-sm"
                        >
                            Select from Google Drive
                        </button>
                    </div>
                    <span className="d-block my-2 text-center">or</span>
                    <div className="file-input-container text-center">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="form-control-file"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-success btn-lg w-100"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Thesis'}
                </button>

                {error && <div className="text-danger mt-3">{error}</div>}
            </form>
        </div>
    );
};

export default SubmitThesis;
