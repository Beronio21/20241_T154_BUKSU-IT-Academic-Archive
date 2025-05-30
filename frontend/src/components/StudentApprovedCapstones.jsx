import React, { useState, useEffect } from 'react';

const StudentApprovedCapstones = () => {
    const [approvedCapstones, setApprovedCapstones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApprovedCapstones();
    }, []);

    const fetchApprovedCapstones = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/thesis/approved');
            const data = await response.json();
            if (data.status === 'success') {
                setApprovedCapstones(data.data);
            }
        } catch (error) {
            console.error('Error fetching approved capstones:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Approved Capstone Research</h2>
            {loading ? (
                <p>Loading approved capstones...</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Abstract</th>
                            <th>Keywords</th>
                        </tr>
                    </thead>
                    <tbody>
                        {approvedCapstones.map((capstone) => (
                            <tr key={capstone._id}>
                                <td>{capstone.title}</td>
                                <td>{capstone.abstract}</td>
                                <td>{capstone.keywords.join(', ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default StudentApprovedCapstones; 