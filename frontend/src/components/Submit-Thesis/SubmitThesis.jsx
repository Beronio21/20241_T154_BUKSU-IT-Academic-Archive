import React, { useState, useEffect } from 'react';
import useDrivePicker from 'react-google-drive-picker';


const SubmitThesis = () => {
    const [formData, setFormData] = useState({
        title: '',
        abstract: '',
        keywords: [''],
        members: [''],
        adviserEmail: '',
        docsLink: '',
        category: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [openPicker] = useDrivePicker();

    useEffect(() => {
        const userInfoString = localStorage.getItem('user-info');
        if (userInfoString) {
            const userInfo = JSON.parse(userInfoString);
            setFormData((prev) => ({ ...prev, email: userInfo.email || '' }));
        }
    }, []);

    const handleInputChange = (e, index = null) => {
        const { name, value } = e.target;
        if (index !== null) {
            setFormData((prev) => ({
                ...prev,
                [name]: prev[name].map((item, i) => (i === index ? value : item)),
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const addField = (field) => setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
    const removeField = (field, index) => setFormData((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
    }));

    const handleOpenPicker = async () => {
        const userInfo = JSON.parse(localStorage.getItem('user-info'));
        const googleDriveToken = userInfo?.googleDriveToken;

        if (!googleDriveToken) {
            alert('Please log in with Google to access Drive files.');
            return;
        }

        openPicker({
            clientId: "YOUR_CLIENT_ID",
            developerKey: "YOUR_DEVELOPER_KEY",
            viewId: "DOCS",
            showUploadView: true,
            multiselect: false,
            token: googleDriveToken,
            callbackFunction: (data) => {
                if (data.action === 'picked') {
                    const fileId = data.docs[0].id;
                    const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;
                    setFormData((prev) => ({ ...prev, docsLink: fileUrl }));
                }
            },
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            setFormData((prev) => ({ ...prev, docsLink: fileUrl }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.abstract.trim() || !formData.docsLink) {
            setError('All fields are required.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const submissionData = { ...formData, email: userInfo.email };

            const response = await fetch('http://localhost:8080/api/thesis/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify(submissionData),
            });

            if (!response.ok) throw new Error('Submission failed. Please try again.');

            alert('Thesis submitted successfully!');
            setFormData({
                title: '',
                abstract: '',
                keywords: [''],
                members: [''],
                adviserEmail: '',
                docsLink: '',
                category: '',
            });
        } catch (error) {
            setError(error.message);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="card shadow-lg p-4 bg-white rounded">
                <h2 className="text-center mb-4">Submit Capstone Research Paper</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Research Title</label>
                        <input type="text" className="form-control" name="title" value={formData.title} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Abstract</label>
                        <textarea className="form-control" name="abstract" value={formData.abstract} onChange={handleInputChange} rows="4" required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Keywords</label>
                        {formData.keywords.map((keyword, index) => (
                            <div key={index} className="d-flex gap-2 mb-2">
                                <input type="text" className="form-control" name="keywords" value={keyword} onChange={(e) => handleInputChange(e, index)} required />
                                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeField('keywords', index)}>&times;</button>
                            </div>
                        ))}
                        <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => addField('keywords')}>+ Add</button>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Adviser Email</label>
                        <input type="email" className="form-control" name="adviserEmail" value={formData.adviserEmail} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Upload Thesis Paper</label>
                        <input type="file" className="form-control" onChange={handleFileChange} />
                        <button type="button" className="btn btn-outline-success mt-2" onClick={handleOpenPicker}>Upload via Google Drive</button>
                        {formData.docsLink && <p className="mt-2"><a href={formData.docsLink} target="_blank" rel="noopener noreferrer">📄 View Document</a></p>}
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
                </form>
            </div>
        </div>
    );
};

export default SubmitThesis;