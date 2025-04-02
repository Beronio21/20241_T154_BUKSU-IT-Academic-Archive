import React, { useState, useEffect } from 'react';
import useDrivePicker from 'react-google-drive-picker';

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
                objective: formData.objective,
                status: 'pending'
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
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow rounded-lg border-0">
                        <div className="card-body p-4">
                            <h2 className="text-center mb-4">Submit Capstone Research Paper</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="title" className="form-label">Research Title</label>
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

                                <div className="mb-3">
                                    <label htmlFor="objective" className="form-label">Research Objective</label>
                                    <textarea
                                        className="form-control"
                                        id="objective"
                                        name="objective"
                                        value={formData.objective}
                                        onChange={handleInputChange}
                                        rows="3"
                                        required
                                        placeholder="Enter your research objective"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="abstract" className="form-label">Abstract</label>
                                    <textarea
                                        className="form-control"
                                        id="abstract"
                                        name="abstract"
                                        value={formData.abstract}
                                        onChange={handleInputChange}
                                        rows="4"
                                        required
                                        placeholder="Enter your research abstract"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="keywords" className="form-label">Keywords</label>
                                    {formData.keywords.map((keyword, index) => (
                                        <div className="input-group mb-2" key={index}>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="keywords"
                                                value={keyword}
                                                onChange={(e) => handleInputChange(e, index)}
                                                placeholder={`Keyword ${index + 1}`}
                                                required
                                            />
                                            {formData.keywords.length > 1 && (
                                                <button
                                                    className="btn btn-outline-danger"
                                                    type="button"
                                                    onClick={() => removeKeyword(index)}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        className="btn btn-outline-primary"
                                        type="button"
                                        onClick={addKeyword}
                                    >
                                        Add Keyword
                                    </button>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="adviserEmail" className="form-label">Adviser Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="adviserEmail"
                                        name="adviserEmail"
                                        value={formData.adviserEmail}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter adviser email"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="docsLink" className="form-label">Document Link</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="docsLink"
                                        name="docsLink"
                                        value={formData.docsLink}
                                        onChange={handleInputChange}
                                        placeholder="Upload Document Link"
                                    />
                                    <button
                                        className="btn btn-outline-secondary mt-2"
                                        type="button"
                                        onClick={handleOpenPicker}
                                    >
                                        Open Google Drive Picker
                                    </button>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="category" className="form-label">Category</label>
                                    <select
                                        className="form-select"
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="d-grid">
                                    <button
                                        className="btn btn-primary"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? 'Submitting...' : 'Submit Thesis'}
                                    </button>
                                </div>

                                {error && (
                                    <div className="mt-3 alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmitThesis;
