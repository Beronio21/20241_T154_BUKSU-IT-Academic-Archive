import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useDrivePicker from 'react-google-drive-picker';

const ReviewSubmissionDocs = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [docSrc, setDocSrc] = useState("");
    const [openPicker] = useDrivePicker();

    useEffect(() => {
        // Retrieve user info from local storage
        const storedUser = localStorage.getItem('user-info');
        if (storedUser) {
            setUserInfo(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        if (userInfo?.email) {
            fetchSubmissions();
        }
    }, [userInfo]);

    const fetchSubmissions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `http://localhost:8080/api/thesis/submissions/adviser?email=${encodeURIComponent(userInfo.email)}`
            );
            const data = await response.json();
            if (data.status === 'success') {
                setSubmissions(data.data);
            } else {
                setError("Failed to fetch submissions");
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setError("An error occurred while fetching submissions.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPicker = () => {
        openPicker({
            clientId: "YOUR_CLIENT_ID",
            developerKey: "YOUR_DEVELOPER_KEY",
            viewId: "DOCS",
            showUploadView: true,
            showUploadFolders: true,
            supportDrives: true,
            multiselect: false,
            callbackFunction: (data) => {
                if (data.action === 'picked') {
                    const docUrl = data.docs[0].url;
                    setDocSrc(docUrl);
                }
            },
        });
    };

    return (
        <div className="review-submission-docs-container ">
            <header className="review-header">
                <h2 className="mb-3">Review Thesis Submissions</h2>
            </header>

            {/* Error Handling */}
            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center mt-4">
                    <p>Loading submissions...</p>
                </div>
            ) : (
                <section className="submissions-section">
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead className="thead-dark">
                                <tr>
                                    <th>Title</th>
                                    <th>Members</th>
                                    <th>Student Email</th>
                                    <th>Submission Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            No submissions to review
                                        </td>
                                    </tr>
                                ) : (
                                    submissions.map((submission) => (
                                        <tr key={submission._id}>
                                            <td>{submission.title}</td>
                                            <td>{submission.members.join(', ')}</td>
                                            <td>{submission.email || 'N/A'}</td>
                                            <td>{new Date(submission.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button 
                                                    onClick={() => setDocSrc(submission.docsLink)}
                                                    className="btn btn-sm btn-outline-primary"
                                                >
                                                    View Document
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Document Viewer */}
                    <div className="docs-header mt-4">
                        <h4>Document Viewer</h4>
                        <button 
                            type="button" 
                            onClick={handleOpenPicker}
                            className="btn btn-primary mt-2"
                        >
                            Select from Google Drive
                        </button>
                    </div>
                    
                    {/* Responsive Iframe */}
                    <div className="iframe-container mt-3">
                        {docSrc ? (
                            <iframe 
                                className="document-iframe"
                                src={docSrc} 
                                title="Document Viewer"
                                frameBorder="0"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <p className="text-muted text-center">No document selected</p>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ReviewSubmissionDocs;
