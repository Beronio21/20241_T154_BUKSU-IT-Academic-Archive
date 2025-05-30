import React, { useState, useEffect } from 'react';

const AdminApproval = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/thesis/submissions');
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

    const handleApproval = async (id, status) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const response = await fetch(`http://localhost:8080/api/thesis/approve/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update status');

            // Send notification to teacher
            await fetch('http://localhost:8080/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({
                    recipientEmail: data.data.email, // Teacher's email
                    title: `Capstone ${status}`,
                    message: `Your capstone titled "${data.data.title}" has been ${status}.`,
                    type: 'status_update',
                    thesisId: id
                })
            });

            fetchSubmissions(); // Refresh the list
        } catch (error) {
            console.error('Error approving thesis:', error);
        }
    };

    return (
        <div>
            <h2>Pending Thesis Submissions</h2>
            {loading ? (
                <p>Loading submissions...</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Abstract</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.map((submission) => (
                            <tr key={submission._id}>
                                <td>{submission.title}</td>
                                <td>{submission.abstract}</td>
                                <td>
                                    <button onClick={() => handleApproval(submission._id, 'approved')}>Approve</button>
                                    <button onClick={() => handleApproval(submission._id, 'rejected')}>Reject</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminApproval; 