import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Import Bootstrap Icons
import '../../Styles/StudentRecords.css'; // Your custom styles

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
            console.log('Fetched students:', response.data);
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
        (student.student_id && student.student_id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="student-records-container">
            <header className="records-header">
                <h2>Student Records</h2>
                <div className="header-actions">
                    <div className="search-bar" style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '10px 15px 10px 35px', // Space for the icon
                                fontSize: '16px',
                                border: '1px solid #ccc',
                                borderRadius: '25px',
                                outline: 'none',
                                width: '250px',
                                backgroundColor: '#f9f9f9', // Light background
                                zIndex: 1, // Ensure input is on top
                                color: '#000', // Change text color to black
                            }}
                        />
                        <i
                            className="bi bi-search"
                            style={{
                                position: 'absolute',
                                left: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: '18px',
                                color: '#006BB2', // Icon color
                                pointerEvents: 'none', // Ensure icon doesn't block input
                            }}
                        ></i>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="loading">Loading student records...</div>
            ) : error ? (
                <div className="error">
                    {error}
                    <button onClick={fetchStudentRecords}>Retry</button>
                </div>
            ) : students.length === 0 ? (
                <div className="no-records">
                    No student records found.
                </div>
            ) : (
                <div className="records-content">
                    {filteredStudents.length === 0 ? (
                        <div className="no-matches">
                            No students found matching the search criteria.
                        </div>
                    ) : (
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
                    )}

                    {selectedStudent && (
                        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Student Details</h5>
                                    </div>
                                    <div className="modal-body">
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
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setSelectedStudent(null)}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentRecords;
