import React, { useState, useEffect } from 'react';

const AdminApproval = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // Track which row is loading
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    // Fetch all pending submissions
    const fetchSubmissions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8080/api/thesis/submissions');
            const data = await response.json();
            if (data.status === 'success') {
                setSubmissions(data.data);
            } else {
                setError(data.message || 'Failed to fetch submissions');
            }
        } catch (error) {
            setError('Error fetching submissions');
        } finally {
            setLoading(false);
        }
    };

    // Approve or reject a thesis
    const handleApproval = async (id, status) => {
        setActionLoading(id + status);
        setError(null);
        setSuccess(null);
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const response = await fetch(`http://localhost:8080/api/thesis/submissions/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update status');
            setSuccess(`Thesis successfully ${status}.`);
            fetchSubmissions(); // Refresh the list
        } catch (error) {
            setError(error.message || 'Error updating status');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
            <h2 style={{ fontWeight: 700, marginBottom: 24 }}>Pending Thesis Submissions</h2>
            {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <span className="spinner-border" role="status" aria-hidden="true"></span>
                    <span style={{ marginLeft: 12 }}>Loading submissions...</span>
                </div>
            ) : error ? (
                <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>
            ) : (
                <>
                    {success && <div style={{ color: 'green', marginBottom: 16 }}>{success}</div>}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                            <thead style={{ background: '#f3f4f6' }}>
                                <tr>
                                    <th style={{ padding: 12, textAlign: 'left' }}>Title</th>
                                    <th style={{ padding: 12, textAlign: 'left' }}>Abstract</th>
                                    <th style={{ padding: 12, textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.length === 0 ? (
                                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: 32 }}>No pending submissions.</td></tr>
                                ) : (
                                    submissions.map((submission) => (
                                        <tr key={submission._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: 12 }}>{submission.title}</td>
                                            <td style={{ padding: 12 }}>{submission.abstract}</td>
                                            <td style={{ padding: 12, textAlign: 'center' }}>
                                                <button
                                                    onClick={() => handleApproval(submission._id, 'approved')}
                                                    disabled={actionLoading === submission._id + 'approved'}
                                                    style={{
                                                        background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', fontWeight: 600, marginRight: 8, cursor: actionLoading === submission._id + 'approved' ? 'not-allowed' : 'pointer', opacity: actionLoading === submission._id + 'approved' ? 0.7 : 1
                                                    }}
                                                >
                                                    {actionLoading === submission._id + 'approved' ? 'Approving...' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => handleApproval(submission._id, 'rejected')}
                                                    disabled={actionLoading === submission._id + 'rejected'}
                                                    style={{
                                                        background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', fontWeight: 600, cursor: actionLoading === submission._id + 'rejected' ? 'not-allowed' : 'pointer', opacity: actionLoading === submission._id + 'rejected' ? 0.7 : 1
                                                    }}
                                                >
                                                    {actionLoading === submission._id + 'rejected' ? 'Rejecting...' : 'Reject'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminApproval; 