import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useDrivePicker from 'react-google-drive-picker';


const ReviewSubmissionDocs = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const [docSrc, setDocSrc] = useState("https://drive.google.com/start/apps");
    const [openPicker] = useDrivePicker();

    useEffect(() => {
        const data = localStorage.getItem('user-info');
        if (data) {
            setUserInfo(JSON.parse(data));
        }
    }, []);

    useEffect(() => {
        if (userInfo?.email) {
            fetchSubmissions();
        }
    }, [userInfo]);

    const fetchSubmissions = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/thesis/submissions/adviser?email=${encodeURIComponent(userInfo.email)}`
            );
            const data = await response.json();
            if (data.status === 'success') {
                setSubmissions(data.data);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
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
        <div className="review-submission-docs-container">
            <header className="review-header">
                <h2>Review Thesis Submissions and Documents</h2>
            </header>

            {loading ? (
                <p>Loading submissions...</p>
            ) : (
                <section className="submissions-section">
                    <table className="submissions-table">
                        <thead>
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
                                    <td colSpan="5" style={{textAlign: 'center'}}>
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
                                                className="btn-view"
                                            >
                                                View Document
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="docs-header">
                        <h2>Document Viewer</h2>
                        <button 
                            type="button" 
                            onClick={handleOpenPicker}
                            className="btn btn-primary mt-2"
                        >
                            Select from Google Drive
                        </button>
                    </div>
                    <iframe 
                        className="large-iframe"
                        style={{ width: '2000px', height: '900px' }}
                        src={docSrc} 
                        title="Document Viewer"
                    ></iframe>
                </section>
            )}
        </div>
    );
};

export default ReviewSubmissionDocs;