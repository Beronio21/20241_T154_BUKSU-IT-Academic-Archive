import React, { useState, useEffect } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import '../Styles/SubmitThesis.css';

const SubmitThesis = () => {
    const [formData, setFormData] = useState({
        title: '',
        abstract: '',
        objective: '',
        keywords: [''],
        members: [''],
        adviserEmail: '',
        docsLink: '',
        email: JSON.parse(localStorage.getItem('user-info'))?.email || '',
        category: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [openPicker] = useDrivePicker();

    const categories = ['IoT', 'AI', 'ML', 'Sound', 'Camera'];

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

    const handleOpenPicker = () => {
        const userInfo = JSON.parse(localStorage.getItem('user-info'));
        const googleDriveToken = userInfo?.googleDriveToken;

        if (!googleDriveToken) {
            alert('Please log in with Google to access Drive files.');
            return;
        }

        // Function to find or create the folder
        const getOrCreateFolder = async () => {
            const query = `name='Submit Capstone Research Paper' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
            const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${googleDriveToken}`
                }
            });
            const data = await response.json();

            if (data.files && data.files.length > 0) {
                return data.files[0].id; // Return existing folder ID
            } else {
                const folderMetadata = {
                    name: 'Submit Capstone Research Paper',
                    mimeType: 'application/vnd.google-apps.folder'
                };
                const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${googleDriveToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(folderMetadata)
                });
                const folder = await createResponse.json();
                return folder.id; // Return new folder ID
            }
        };

        // Open the picker and upload the document to the folder
        const openPickerAndUpload = async (folderId) => {
            openPicker({
                clientId: "736065879191-hhi3tmfi3ftr54m6r37ilftckkbcojsb.apps.googleusercontent.com",
                developerKey: "AIzaSyBefZhoxSibx9ORWrmhrH3I8L_Cz1OB33E",
                viewId: "DOCS",
                showUploadView: true,
                showUploadFolders: true,
                supportDrives: true,
                multiselect: false,
                token: googleDriveToken,
                callbackFunction: async (data) => {
                    if (data.action === 'picked') {
                        const docId = data.docs[0].id;
                        // Move the document to the specified folder
                        const updateResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${docId}?addParents=${folderId}&removeParents=root`, {
                            method: 'PATCH',
                            headers: {
                                'Authorization': `Bearer ${googleDriveToken}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        const updatedDoc = await updateResponse.json();
                        setFormData(prev => ({
                            ...prev,
                            docsLink: `https://drive.google.com/file/d/${updatedDoc.id}/view`
                        }));
                    }
                }
            });
        };

        // Get or create the folder and then open the picker
        getOrCreateFolder().then(openPickerAndUpload);
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
        if (!formData.title.trim()) {
            setError('Research title is required');
            return;
        }
        if (!formData.abstract.trim()) {
            setError('Abstract is required');
            return;
        }
        if (!formData.keywords.some(keyword => keyword.trim())) {
            setError('At least one keyword is required');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));

            const submissionData = {
                title: formData.title,
                abstract: formData.abstract,
                keywords: formData.keywords.filter(keyword => keyword.trim() !== ''),
                members: formData.members.filter(member => member.trim() !== ''),
                adviserEmail: formData.adviserEmail,
                docsLink: formData.docsLink,
                email: userInfo.email,
                category: formData.category,
                objective: formData.objective
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
                abstract: '',
                keywords: [''],
                members: [''],
                adviserEmail: '',
                docsLink: '',
                email: '',
                category: '',
                objective: ''
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
            <div className="thesis-form">
                <h2>Submit Capstone Research Paper</h2>

                <form onSubmit={handleSubmit} className="shadow p-4 bg-light rounded">
                    <div className="row mb-3">
                        <div className="col-md-12">
                            <div className="form-group">
                                <label htmlFor="title">Research Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter your research title"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="objective" className="form-label fw-bold">Research Objective</label>
                        <textarea
                            id="objective"
                            name="objective"
                            className="form-control shadow-sm"
                            value={formData.objective}
                            onChange={handleInputChange}
                            placeholder="Enter the main objective of your research"
                            rows="3"
                            required
                        />
                        <small className="text-muted">
                            Clearly state the primary goal of your research
                        </small>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-12">
                            <div className="form-group">
                                <label htmlFor="abstract">Abstract</label>
                                <textarea
                                    className="form-control"
                                    id="abstract"
                                    name="abstract"
                                    value={formData.abstract}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter your research abstract"
                                    rows="4"
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group mb-4">
                        <label htmlFor="keywords" style={{ fontWeight: '600', fontSize: '1.1rem', color: '#333' }}>Keywords:</label>
                        {formData.keywords.map((keyword, index) => (
                            <div key={index} className="mb-3 position-relative">
                                <input
                                    type="text"
                                    className="form-control"
                                    name="keywords"
                                    value={keyword}
                                    onChange={(e) => handleInputChange(e, index)}
                                    placeholder="Enter keyword"
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
                                {formData.keywords.length > 1 && (
                                    <span
                                        onClick={() => removeKeyword(index)}
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
                                )}
                            </div>
                        ))}
                        <div className="d-flex justify-content-start mb-3">
                            <button
                                type="button"
                                onClick={addKeyword}
                                className="btn btn-outline-primary"
                                style={{
                                    padding: '0.6rem 1.5rem',
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <i className="fas fa-plus"></i> Add Keyword
                            </button>
                        </div>
                    </div>

                    <div className="row mb-3">
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
                        
                        
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
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
        </div>
    );
};

export default SubmitThesis;
