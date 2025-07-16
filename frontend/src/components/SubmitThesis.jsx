import React, { useState, useEffect } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import '../Styles/SubmitThesis.css';
import { Modal, Button } from 'react-bootstrap';

const SubmitThesis = () => {
    const [formData, setFormData] = useState({
        title: '',
        abstract: '',
        keywords: [''],
        members: [''],
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
                objective: formData.abstract,
                keywords: formData.keywords.filter(keyword => keyword.trim() !== ''),
                members: formData.members.filter(member => member.trim() !== ''),
                docsLink: formData.docsLink,
                email: userInfo.email,
                category: formData.category,
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
                    recipientEmail: 'admin@buksu.edu.ph', // Hardcoded admin email
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
                docsLink: '',
                email: '',
                category: '',
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
                            className="form-control category-select"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            <option value="" className="category-option">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat} className="category-option">{cat}</option>
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
            {showConfirmModal && (
                <div className={`custom-modal show`} onClick={() => setShowConfirmModal(false)}>
                    <div
                        className="custom-modal-content"
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: '95%',
                            maxWidth: 600,
                            boxShadow: '0 4px 24px rgba(30,41,59,0.10)',
                            borderRadius: 16,
                            padding: 0,
                            background: '#fff',
                            margin: '0 auto',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <div
                            className="custom-modal-header bg-gradient-primary text-white"
                            style={{
                                borderTopLeftRadius: 16,
                                borderTopRightRadius: 16,
                                padding: '1.25rem 2rem 1rem 2rem',
                                borderBottom: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <h3 style={{ fontWeight: 700, fontSize: '1.35rem', letterSpacing: 0.5, margin: 0, flex: 1, textAlign: 'center' }}>
                                Confirm Your Submission
                            </h3>
                        </div>
                        <div
                            className="custom-modal-body"
                            style={{
                                padding: '2rem',
                                fontSize: '1.08rem',
                                color: '#334155',
                                fontWeight: 500,
                                borderRadius: 16,
                                background: 'transparent',
                                textAlign: 'center',
                            }}
                        >
                            <div style={{ marginBottom: 18 }}>
                                <span style={{ fontSize: 32, color: '#2563eb', display: 'inline-block', marginBottom: 8 }}>
                                    <i className="fas fa-file-alt"></i>
                                </span>
                                <div style={{ fontWeight: 600, fontSize: 18, color: '#2563eb', marginBottom: 2 }}>Ready to Submit?</div>
                                <div style={{ fontSize: 15, color: '#64748b', marginBottom: 10 }}>Please review your submission details below.</div>
                            </div>
                            <div className="row g-4" style={{ textAlign: 'left', margin: '0 auto', maxWidth: 520 }}>
                                <div className="col-md-6" style={{ marginBottom: 10 }}>
                                    <strong>Title:</strong> <span style={{ color: '#222' }}>{formData.title}</span>
                                </div>
                                <div className="col-md-6" style={{ marginBottom: 10 }}>
                                    <strong>Category:</strong> <span style={{ color: '#3730a3', background: '#e0e7ff', borderRadius: 12, padding: '2px 10px', fontWeight: 600, fontSize: 13, marginLeft: 4 }}>{formData.category}</span>
                                </div>
                                <div className="col-md-12" style={{ marginBottom: 10 }}>
                                    <strong>Abstract:</strong>
                                    <div style={{ color: '#475569', fontSize: 15, whiteSpace: 'pre-line', marginTop: 2, wordBreak: 'break-word', background: '#f8fafc', borderRadius: 6, padding: '12px 16px', lineHeight: 1.7 }}>
                                        {formData.abstract || 'No abstract provided.'}
                                    </div>
                                </div>
                                <div className="col-md-12" style={{ marginBottom: 10 }}>
                                    <strong>Members:</strong> {formData.members.filter(m => m.trim()).length > 0 ? formData.members.filter(m => m.trim()).map((member, i) => (
                                        <span key={i} style={{ display: 'inline-block', marginRight: 8, color: '#475569', fontSize: 15 }}>{member}</span>
                                    )) : <span style={{ color: '#64748b' }}>None</span>}
                                </div>
                                <div className="col-md-12" style={{ marginBottom: 10 }}>
                                    <strong>Keywords:</strong> {formData.keywords.filter(k => k.trim()).length > 0 ? formData.keywords.filter(k => k.trim()).map((keyword, i) => (
                                        <span key={i} style={{ display: 'inline-block', marginRight: 6, background: '#e2e8f0', color: '#334155', borderRadius: 8, fontWeight: 500, fontSize: 13, padding: '0.18em 0.9em' }}>#{keyword}</span>
                                    )) : <span style={{ color: '#64748b' }}>None</span>}
                                </div>
                                <div className="col-md-12" style={{ marginBottom: 10 }}>
                                    <strong>Document:</strong> {formData.docsLink ? (
                                        <span style={{ color: '#22c55e', fontWeight: 600, marginLeft: 4 }}><i className="fas fa-check-circle"></i> Attached</span>
                                    ) : (
                                        <span style={{ color: '#f59e42', fontWeight: 600, marginLeft: 4 }}><i className="fas fa-exclamation-circle"></i> Not attached</span>
                                    )}
                                </div>
                            </div>
                            <div style={{ marginTop: 18, fontSize: 14, color: '#64748b', background: '#f1f5f9', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                                You can track your submission status in your dashboard.
                            </div>
                        </div>
                        <div
                            className="custom-modal-footer"
                            style={{
                                borderTop: 'none',
                                padding: '1.25rem 2rem',
                                borderBottomLeftRadius: 16,
                                borderBottomRightRadius: 16,
                                background: '#f8fafc',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 12,
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                style={{
                                    minWidth: 110,
                                    fontWeight: 600,
                                    borderRadius: 8,
                                    marginRight: 8,
                                    background: '#e5e7eb',
                                    color: '#334155',
                                    border: 'none',
                                    padding: '8px 0',
                                    fontSize: 16,
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSubmit}
                                style={{
                                    minWidth: 110,
                                    fontWeight: 600,
                                    borderRadius: 8,
                                    boxShadow: '0 2px 8px rgba(37,99,235,0.15)',
                                    background: '#2563eb',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px 0',
                                    fontSize: 16,
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

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