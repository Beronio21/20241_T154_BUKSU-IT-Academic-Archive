// components/InstructorReviewThesis.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function InstructorReviewThesis() {
    const [theses, setTheses] = useState([]);
    const [selectedThesis, setSelectedThesis] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [status, setStatus] = useState('Under Review');

    useEffect(() => {
        fetchTheses();
    }, []);

    const fetchTheses = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/thesis/submissions');
            setTheses(response.data);
        } catch (error) {
            console.error('Error fetching theses:', error);
        }
    };

    const handleReview = async (thesisId) => {
        try {
            await axios.put(`http://localhost:5000/api/thesis/${thesisId}/review`, {
                feedback,
                status,
            });
            alert('Feedback submitted successfully!');
            fetchTheses(); // Refresh the list after submission
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    return (
        <div>
            <h2>Instructor Thesis Review</h2>
            <div>
                <h3>Thesis Submissions</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Thesis Title</th>
                            <th>Submission Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {theses.map((thesis) => (
                            <tr key={thesis._id}>
                                <td>{thesis.student_id.name}</td>
                                <td>{thesis.thesis_title}</td>
                                <td>{new Date(thesis.submission_date).toLocaleDateString()}</td>
                                <td>{thesis.status}</td>
                                <td>
                                    <button onClick={() => setSelectedThesis(thesis)}>Review</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedThesis && (
                <div>
                    <h3>Review Thesis: {selectedThesis.thesis_title}</h3>
                    <iframe src={selectedThesis.file_url} title="Thesis Document" width="100%" height="500px"></iframe>
                    <div>
                        <label>Feedback:</label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        ></textarea>
                    </div>
                    <div>
                        <label>Status:</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="Under Review">Under Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Revisions Required">Revisions Required</option>
                        </select>
                    </div>
                    <button onClick={() => handleReview(selectedThesis._id)}>Submit Feedback</button>
                </div>
            )}
        </div>
    );
}

export default InstructorReviewThesis;
