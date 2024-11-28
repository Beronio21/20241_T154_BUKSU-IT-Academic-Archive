import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Styles/StudentList.css';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const data = localStorage.getItem('user-info');
        if (data) {
            setUserInfo(JSON.parse(data));
        }
    }, []);

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
            
            const thesisResponse = await fetch(
                `http://localhost:8080/api/thesis/submissions/adviser?email=${encodeURIComponent(userInfo.email)}`
            );
            const thesisData = await thesisResponse.json();
            
            if (thesisData.status === 'success') {
                const studentsWithThesis = response.data.map(student => {
                    const thesisSubmissions = thesisData.data.filter(sub => sub.email === student.email);
                    return {
                        ...student,
                        student_id: student.student_id || student.studentId,
                        submissionCount: thesisSubmissions.length,
                        lastSubmission: thesisSubmissions[0]?.createdAt,
                        thesis_title: thesisSubmissions[0]?.title,
                        status: thesisSubmissions[0]?.status || 'Not Started'
                    };
                });
                setStudents(studentsWithThesis);
            }
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
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="student-list-container">
            <header className="list-header">
                <h2>Student List</h2>
                <div className="header-actions">
                    <div className="search-bar">
                        <label htmlFor="student-search" className="search-label">
                            Search Students:
                            <input
                                id="student-search"
                                name="student-search"
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="Search students by name or ID"
                            />
                        </label>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="loading">Loading students...</div>
            ) : error ? (
                <div className="error">
                    {error}
                    <button onClick={fetchStudents}>Retry</button>
                </div>
            ) : (
                <div className="list-content">
                    <table className="student-list-table" aria-label="Student List">
                        <thead>
                            <tr>
                                <th scope="col" id="header-name">Name</th>
                                <th scope="col" id="header-email">Email</th>
                                <th scope="col" id="header-thesis">Thesis Title</th>
                                <th scope="col" id="header-submissions">Submissions</th>
                                <th scope="col" id="header-last-submission">Last Submission</th>
                                <th scope="col" id="header-status">Status</th>
                                <th scope="col" id="header-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student, index) => (
                                <tr key={index}>
                                    <td headers="header-name">{student.name}</td>
                                    <td headers="header-email">{student.email}</td>
                                    <td headers="header-thesis">{student.thesis_title}</td>
                                    <td headers="header-submissions">{student.submissionCount}</td>
                                    <td headers="header-last-submission">
                                        {new Date(student.lastSubmission).toLocaleDateString()}
                                    </td>
                                    <td headers="header-status">
                                        <span className={`status-${student.status.toLowerCase()}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td headers="header-actions">
                                        <button
                                            className="btn-view"
                                            onClick={() => handleViewDetails(student)}
                                            aria-label={`View details for ${student.name}`}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {selectedStudent && (
                        <div 
                            className="student-details-modal" 
                            role="dialog" 
                            aria-labelledby="modal-title"
                        >
                            <div className="modal-content">
                                <h3 id="modal-title">Student Details</h3>
                                <div className="details-grid">
                                    {selectedStudent.image && (
                                        <div className="detail-item">
                                            <label>
                                                Profile Image:
                                                <img 
                                                    src={selectedStudent.image} 
                                                    alt={`${selectedStudent.name}'s profile`}
                                                    className="profile-image"
                                                />
                                            </label>
                                        </div>
                                    )}
                                    <div className="detail-item">
                                        <label>
                                            Name:
                                            <span>{selectedStudent.name}</span>
                                        </label>
                                    </div>
                                    <div className="detail-item">
                                        <label>
                                            Email:
                                            <span>{selectedStudent.email}</span>
                                        </label>
                                    </div>
                                    <div className="detail-item">
                                        <label>
                                            Student ID:
                                            <span>{selectedStudent.student_id}</span>
                                        </label>
                                    </div>
                                    <div className="detail-item">
                                        <label>
                                            Contact Number:
                                            <span>{selectedStudent.contact_number || 'Not provided'}</span>
                                        </label>
                                    </div>
                                    <div className="detail-item">
                                        <label>
                                            Location:
                                            <span>{selectedStudent.location || 'Not provided'}</span>
                                        </label>
                                    </div>
                                    <div className="detail-item">
                                        <label>
                                            Birthday:
                                            <span>
                                                {selectedStudent.birthday 
                                                    ? new Date(selectedStudent.birthday).toLocaleDateString() 
                                                    : 'Not provided'}
                                            </span>
                                        </label>
                                    </div>
                                    <div className="detail-item">
                                        <label>
                                            Gender:
                                            <span>{selectedStudent.gender || 'Not provided'}</span>
                                        </label>
                                    </div>
                                    <div className="detail-item">
                                        <label>
                                            Course:
                                            <span>{selectedStudent.course || 'Not provided'}</span>
                                        </label>
                                    </div>
                                    <div className="detail-item">
                                        <label>
                                            Year Level:
                                            <span>{selectedStudent.year || 'Not provided'}</span>
                                        </label>
                                    </div>
                                    <div className="detail-item">
                                        <label>
                                            Profile Status:
                                            <span>{selectedStudent.isProfileComplete ? 'Complete' : 'Incomplete'}</span>
                                        </label>
                                    </div>
                                </div>
                                <button
                                    className="btn-close"
                                    onClick={() => setSelectedStudent(null)}
                                    aria-label="Close details"
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

export default StudentList; 