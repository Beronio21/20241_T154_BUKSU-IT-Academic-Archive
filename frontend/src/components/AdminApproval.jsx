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
            await fetch(`http://localhost:8080/api/thesis/approve/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });
            fetchSubmissions(); // Refresh the list after approval
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
                            <th>Objective</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.map((submission) => (
                            <tr key={submission._id}>
                                <td>{submission.title}</td>
                                <td>{submission.objective}</td>
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