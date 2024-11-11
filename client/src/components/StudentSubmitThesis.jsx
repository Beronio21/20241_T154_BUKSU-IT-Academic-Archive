import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StudentSubmitThesis() {
    const [title, setTitle] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [comments, setComments] = useState('');
    const [instructorId, setInstructorId] = useState(''); // New state for instructor
    const [message, setMessage] = useState('');
    const [instructors, setInstructors] = useState([]); // To store the list of instructors

    useEffect(() => {
        // Fetch instructors from the backend
        const fetchInstructors = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/instructors'); // Adjust this route to your API endpoint
                setInstructors(response.data); // Assuming response contains an array of instructors
            } catch (error) {
                console.error("Failed to fetch instructors:", error);
            }
        };

        fetchInstructors();
    }, []);

    const submitThesis = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/thesis/submit', {
                student_id: 12345, // make automatically set the student_id based on the logged-in student
                thesis_title: title,
                file_url: fileUrl,
                comments: comments,
                instructor_id: instructorId // Include selected instructor ID
            });
            setMessage("Thesis submitted successfully!");
        } catch (error) {
            console.error("Failed to submit thesis:", error);
            setMessage("Failed to submit thesis. Please try again.");
        }
    };

    return (
        <div>
            <h2>Submit Thesis</h2>
            <form onSubmit={submitThesis}>
                <input
                    type="text"
                    placeholder="Thesis Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="File URL"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                />
                <textarea
                    placeholder="Comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                />

                {/* Instructor selection dropdown */}
                <select 
                    value={instructorId} 
                    onChange={(e) => setInstructorId(e.target.value)} 
                    required
                >
                    <option value="">Select Instructor</option>
                    {instructors.map(instructor => (
                        <option key={instructor._id} value={instructor._id}>
                            {instructor.name} {/* Now displaying the full name */}
                        </option>
                    ))}
                </select>

                <button type="submit">Submit</button>
            </form>
            <p>{message}</p>
        </div>
    );
}

export default StudentSubmitThesis;
