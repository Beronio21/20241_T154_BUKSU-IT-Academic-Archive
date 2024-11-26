import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentRecords.css';

const StudentRecords = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        fetchStudentRecords();
    }, []);

    const fetchStudentRecords = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const config = {
                headers: {
                    'Authorization': `Bearer ${userInfo?.token}`,
                    'Content-Type': 'application/json'
                }
            };

            const response = await axios.get('http://localhost:8080/api/students', config);
            setStudents(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching student records:', error);
            setError('Failed to fetch student records');
            setLoading(false);
        }
    };

    const handleViewDetails = (student) => {
        setSelectedStudent(student);
    };

    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="student-records-container">
            <header className="records-header">
                <h2>Student Records</h2>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {loading ? (
                <div className="loading">Loading student records...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <div className="records-content">
                    <table className="records-table">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th>Course</th>
                                <th>Year Level</th>
                                <th>Thesis Status</th>
                                <th>Academic Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student._id}>
                                    <td>{student.student_id}</td>
                                    <td>{student.name}</td>
                                    <td>{student.course}</td>
                                    <td>{student.year}</td>
                                    <td>
                                        <span className={`status ${student.thesis_status?.toLowerCase()}`}>
                                            {student.thesis_status || 'Not Started'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status ${student.academic_status?.toLowerCase()}`}>
                                            {student.academic_status || 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-view"
                                            onClick={() => handleViewDetails(student)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {selectedStudent && (
                        <div className="student-details-modal">
                            <div className="modal-content">
                                <h3>Student Details</h3>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <label>Student ID:</label>
                                        <span>{selectedStudent.student_id}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Name:</label>
                                        <span>{selectedStudent.name}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Email:</label>
                                        <span>{selectedStudent.email}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Course:</label>
                                        <span>{selectedStudent.course}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Year Level:</label>
                                        <span>{selectedStudent.year}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Thesis Title:</label>
                                        <span>{selectedStudent.thesis_title || 'Not yet assigned'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Advisor:</label>
                                        <span>{selectedStudent.advisor || 'Not yet assigned'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Defense Schedule:</label>
                                        <span>{selectedStudent.defense_schedule || 'Not yet scheduled'}</span>
                                    </div>
                                </div>
                                <button
                                    className="btn-close"
                                    onClick={() => setSelectedStudent(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentRecords; 