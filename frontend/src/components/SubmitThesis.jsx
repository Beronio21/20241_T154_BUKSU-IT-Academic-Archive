import React, { useState, useEffect } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import '../Styles/SubmitThesis.css';
import { Modal, Button } from 'react-bootstrap';

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
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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
        
        // Show confirmation modal instead of submitting directly
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = async () => {
        setShowConfirmModal(false);
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
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify(submissionData)
            });

            const data = await response.json();
            console.log('Server response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit thesis');
            }

            // Send notification to admin
            const notificationResponse = await fetch('http://localhost:8080/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({
                    recipientEmail: 'admin@example.com', // Replace with actual admin email
                    title: 'New Capstone Submission',
                    message: `A new capstone titled "${formData.title}" has been submitted by ${userInfo.name}.`,
                    type: 'submission',
                    thesisId: data.data._id
                })
            });

            if (!notificationResponse.ok) {
                throw new Error('Failed to send notification');
            }

            // Show success modal
            setShowSuccessModal(true);
            
            // Reset form
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
            console.error('Error:', error);
            setError(error.message);
            alert('Failed to submit thesis: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="submit-thesis-container">
            <div className="submit-thesis-form">
                <h2>Submit Capstone Research Paper</h2>
                <form onSubmit={handleSubmit}>
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
                    
                    <div className="form-group">
                        <label htmlFor="objective">Research Objective</label>
                        <textarea
                            id="objective"
                            name="objective"
                            className="form-control"
                            value={formData.objective}
                            onChange={handleInputChange}
                            placeholder="Enter the main objective of your research"
                            rows="3"
                            required
                        />
                    </div>

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
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            name="category"
                            className="form-control"
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

                    <div className="form-group">
                        <label htmlFor="keywords">Keywords</label>
                        {formData.keywords.map((keyword, index) => (
                            <div key={index} className="keyword-input">
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
                                        type="button"
                                        onClick={() => removeKeyword(index)}
                                        className="remove-keyword"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addKeyword}
                            className="add-keyword"
                        >
                            + Add Keyword
                        </button>
                    </div>

                    <div className="form-group">
                        <label htmlFor="members">Members</label>
                        {formData.members.map((member, index) => (
                            <div key={index} className="member-input">
                                <input
                                    type="text"
                                    className="form-control"
                                    name="members"
                                    value={member}
                                    onChange={(e) => handleInputChange(e, index)}
                                    placeholder={`Member ${index + 1}`}
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
                            + Add Member
                        </button>
                    </div>

                    <div className="form-group">
                        <label htmlFor="adviserEmail">Admin Email</label>
                        <input
                            type="email"
                            id="adviserEmail"
                            name="adviserEmail"
                            className="form-control"
                            value={formData.adviserEmail}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter Admin's email"
                        />
                    </div>

                    <div className="form-group">
                        <label>Document Link</label>
                        <div className="document-link-container">
                            <span>{formData.docsLink || 'No document selected'}</span>
                            <button
                                type="button"
                                onClick={handleOpenPicker}
                            >
                                Select from Google Drive
                            </button>
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            </div>

            {/* Confirmation Modal */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered size="md">
                <Modal.Header className="bg-primary text-white text-center">
                    <Modal.Title className="w-100">
                        <div className="text-center">
                            <i className="fas fa-paper-plane confirmation-header-icon"></i>
                            <div className="mt-2">Confirm Your Submission</div>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 py-4">
                    <div className="confirmation-content text-center">
                        <div className="confirmation-icon-wrapper mb-3">
                            <i className="fas fa-file-alt confirmation-icon"></i>
                        </div>
                        <h4 className="confirmation-title">Ready to Submit</h4>
                        <p className="text-muted mb-4">Please review your submission details</p>

                        <div className="submission-details-centered">
                            <div className="detail-section">
                                <h5 className="detail-section-title">
                                    <i className="fas fa-heading"></i>
                                    Research Information
                                </h5>
                                <div className="detail-content">
                                    <h6 className="research-title">{formData.title}</h6>
                                    <span className="category-badge">{formData.category}</span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h5 className="detail-section-title">
                                    <i className="fas fa-users"></i>
                                    Team Members
                                </h5>
                                <div className="detail-content">
                                    <div className="members-list-centered">
                                        {formData.members.filter(m => m.trim()).map((member, index) => (
                                            <span key={index} className="member-chip">
                                                <i className="fas fa-user"></i>
                                                {member}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h5 className="detail-section-title">
                                    <i className="fas fa-tags"></i>
                                    Keywords
                                </h5>
                                <div className="detail-content">
                                    <div className="keywords-list-centered">
                                        {formData.keywords.filter(k => k.trim()).map((keyword, index) => (
                                            <span key={index} className="keyword-chip">#{keyword}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h5 className="detail-section-title">
                                    <i className="fas fa-file-pdf"></i>
                                    Document Status
                                </h5>
                                <div className="detail-content">
                                    <span className="document-status">
                                        {formData.docsLink ? 
                                            <span className="text-success">
                                                <i className="fas fa-check-circle"></i> Document Attached
                                            </span> : 
                                            <span className="text-warning">
                                                <i className="fas fa-exclamation-circle"></i> No document attached
                                            </span>
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="confirmation-notice mt-4">
                            <div className="alert alert-info" role="alert">
                                <i className="fas fa-info-circle"></i>
                                <span>You can track your submission status in your dashboard</span>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="bg-light justify-content-center">
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)} className="px-4 me-3">
                        <i className="fas fa-times"></i>
                        <span className="ms-2">Cancel</span>
                    </Button>
                    <Button variant="primary" onClick={handleConfirmSubmit} className="px-4">
                        <i className="fas fa-check"></i>
                        <span className="ms-2">Confirm</span>
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Success Modal */}
            <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
                <Modal.Header className="bg-success text-white">
                    <Modal.Title>Submission Successful</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                        <i className="fas fa-check-circle text-success" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                        <h4>Thank you for your submission!</h4>
                        <p>Your capstone research paper has been successfully submitted for review.</p>
                        <p className="text-muted">You will be notified once it has been reviewed.</p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={() => setShowSuccessModal(false)}>
                        Done
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default SubmitThesis;
