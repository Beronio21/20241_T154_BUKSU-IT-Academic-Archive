import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css';

const UserManagement = () => {
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Get auth token from localStorage
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const config = {
                headers: {
                    'Authorization': `Bearer ${userInfo?.token}`,
                    'Content-Type': 'application/json'
                }
            };

            const studentRes = await axios.get('http://localhost:8080/api/students', config);
            const teacherRes = await axios.get('http://localhost:8080/api/teachers', config);

            // Update to handle direct array responses
            if (Array.isArray(studentRes.data)) {
                setStudents(studentRes.data);
            } else {
                console.warn('Unexpected student data format:', studentRes.data);
                setStudents([]);
            }

            if (Array.isArray(teacherRes.data)) {
                setTeachers(teacherRes.data);
            } else {
                console.warn('Unexpected teacher data format:', teacherRes.data);
                setTeachers([]);
            }

            setError(null);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch users. Please try again later.');
            setStudents([]);
            setTeachers([]);
        }
    };

    const handleEdit = (user, type) => {
        setEditingUser({ ...user, type });
        setIsEditing(true);
    };

    const handleUpdate = async (userId, type, updatedData) => {
        try {
            const endpoint = type === 'student' ? '/api/students' : '/api/teachers';
            await axios.put(`${endpoint}/${userId}`, updatedData);
            
            // Refresh the data after update
            fetchData();
            setIsEditing(false);
            setEditingUser(null);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const renderContent = () => {
        if (error) {
            return (
                <div className="error-message">
                    {error}
                    <button onClick={fetchData}>Retry</button>
                </div>
            );
        }

        return (
            <section className="user-management-section">
                <h2>User Records</h2>
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Student ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(students) && students.map(student => (
                            <tr key={student._id}>
                                <td>{student.name}</td>
                                <td>{student.email}</td>
                                <td>{student.student_id}</td>
                                <td>
                                    <button className="btn-view">View</button>
                                    <button className="btn-edit" onClick={() => handleEdit(student, 'student')}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <table className="teachers-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Teacher ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(teachers) && teachers.map(teacher => (
                            <tr key={teacher._id}>
                                <td>{teacher.name}</td>
                                <td>{teacher.email}</td>
                                <td>{teacher.department}</td>
                                <td>{teacher.teacher_id}</td>
                                <td>
                                    <button className="btn-view">View</button>
                                    <button className="btn-edit" onClick={() => handleEdit(teacher, 'teacher')}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        );
    };

    return (
        <div className="dashboard-container">
            <main className="main-content">
                {students.length === 0 && teachers.length === 0 ? (
                    <div className="loading">Loading users...</div>
                ) : (
                    renderContent()
                )}
            </main>
        </div>
    );
};

export default UserManagement;