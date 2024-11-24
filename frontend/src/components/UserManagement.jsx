import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css';

const UserManagement = () => {
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const studentRes = await axios.get('/api/students');
                console.log('Student response:', studentRes.data);
                setStudents(Array.isArray(studentRes.data) ? studentRes.data : []);

                const teacherRes = await axios.get('/api/teachers');
                console.log('Teacher response:', teacherRes.data);
                setTeachers(Array.isArray(teacherRes.data) ? teacherRes.data : []);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const renderContent = () => {
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
                                    <button className="btn-edit">Edit</button>
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
                                    <button className="btn-edit">Edit</button>
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
                {renderContent()}
            </main>
        </div>
    );
};

export default UserManagement;