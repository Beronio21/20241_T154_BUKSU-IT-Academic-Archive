import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TeacherRecords.css';

const TeacherRecords = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    useEffect(() => {
        fetchTeacherRecords();
    }, []);

    const fetchTeacherRecords = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const config = {
                headers: {
                    'Authorization': `Bearer ${userInfo?.token}`,
                    'Content-Type': 'application/json'
                }
            };

            const response = await axios.get('http://localhost:8080/api/teachers', config);
            console.log('Fetched teachers:', response.data);
            setTeachers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching teacher records:', error);
            setError('Failed to fetch teacher records');
            setLoading(false);
        }
    };

    const handleViewDetails = (teacher) => {
        setSelectedTeacher(teacher);
    };

    const filteredTeachers = teachers.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.teacher_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="teacher-records-container">
            <header className="records-header">
                <h2>Teacher Records</h2>
                <div className="header-actions">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="loading">Loading teacher records...</div>
            ) : error ? (
                <div className="error">
                    {error}
                    <button onClick={fetchTeacherRecords}>Retry</button>
                </div>
            ) : teachers.length === 0 ? (
                <div className="no-records">
                    No teacher records found.
                </div>
            ) : (
                <div className="records-content">
                    <table className="records-table">
                        <thead>
                            <tr>
                                <th>Teacher ID</th>
                                <th>Name</th>
                                <th>Department</th>
                                <th>Contact Number</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.map(teacher => (
                                <tr key={teacher._id}>
                                    <td>{teacher.teacher_id}</td>
                                    <td>{teacher.name}</td>
                                    <td>{teacher.department}</td>
                                    <td>{teacher.contact_number || 'Not provided'}</td>
                                    <td>
                                        <span className={`status ${teacher.status?.toLowerCase()}`}>
                                            {teacher.status || 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-view"
                                            onClick={() => handleViewDetails(teacher)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {selectedTeacher && (
                        <div className="teacher-details-modal">
                            <div className="modal-content">
                                <h3>Teacher Details</h3>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <label>Teacher ID:</label>
                                        <span>{selectedTeacher.teacher_id}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Name:</label>
                                        <span>{selectedTeacher.name}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Email:</label>
                                        <span>{selectedTeacher.email}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Department:</label>
                                        <span>{selectedTeacher.department}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Specialization:</label>
                                        <span>{selectedTeacher.specialization}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Contact Number:</label>
                                        <span>{selectedTeacher.contact_number || 'Not provided'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Office Location:</label>
                                        <span>{selectedTeacher.office_location || 'Not provided'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Advisees Count:</label>
                                        <span>{selectedTeacher.advisees_count || '0'}</span>
                                    </div>
                                </div>
                                <button
                                    className="btn-close"
                                    onClick={() => setSelectedTeacher(null)}
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

export default TeacherRecords; 