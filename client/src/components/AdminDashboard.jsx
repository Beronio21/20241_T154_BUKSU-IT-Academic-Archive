import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../styles/UserManagement.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const UserManagement = () => {
    const [students, setStudents] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredRow, setHoveredRow] = useState(null); // Track the currently hovered row's ID
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const studentsResponse = await axios.get('http://localhost:5000/api/Students/');
                const instructorsResponse = await axios.get('http://localhost:5000/api/Instructors/');
                setStudents(studentsResponse.data);
                setInstructors(instructorsResponse.data);
            } catch (err) {
                setError('Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDelete = async (userId, userType) => {
        if (window.confirm(`Are you sure you want to delete this ${userType}?`)) {
            try {
                await axios.delete(`http://localhost:5000/api/Students/delete/${userId}`);
                setStudents(prev => prev.filter(user => user._id !== userId));
           
            } catch (err) {
                setError('Failed to delete user');
            }
        }I
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="user-management-container">
            <aside className="sidebar">:
                <div className="sidebar-logo">
                    <h2>Admin Panel</h2>
                </div>
                <ul className="sidebar-menu">
                    <li><a href="admin-dashboard">Dashboard</a></li>
                    <li><a href="/manage-thesis">Manage Thesis Submissions</a></li>
                    <li><a href="/settings">Settings</a></li>
                    <li>
                        <button onClick={handleLogout} className="logout-button">
                            Logout
                        </button>
                    </li>
                </ul>
            </aside>
    
            <div className="main-content">
                <header className="topbar">
                    <h2>User Management</h2>
                </header>
    
                {error && <p className="error">{error}</p>}
                {loading ? (
                    <p>Loading users...</p>
                ) : (
                    <div className="tables-container">
                        {/* Students Table */}
                        <div className="table-container">
                            <h4>Students</h4>
                            <table className="user-management-table">
                                <thead>
                                    <tr>
                                        <th>Student ID</th>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Email</th>
                                        <th>Password</th>
                                        <th>Contact Number</th>
                                        <th>Gender</th>
                                        <th>Birthday</th>
                                        <th>Department</th>
                                        <th>Course</th>
                                        <th>Year Level</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(user => (
                                        <tr
                                            key={user._id}
                                            onMouseEnter={() => setHoveredRow(user._id)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                        >
                                            <td>{user.student_id}</td>
                                            <td>{user.first_name}</td>
                                            <td>{user.last_name}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                {hoveredRow === user._id ? (
                                                    <span className="password-tooltip">
                                                        Password: {user.password_hash}
                                                    </span>
                                                ) : (
                                                    '•••••••••'
                                                )}
                                            </td>
                                            <td>{user.contact_number}</td>
                                            <td>{user.gender}</td>
                                            <td>{new Date(user.birthday).toLocaleDateString()}</td>
                                            <td>{user.department}</td>
                                            <td>{user.course}</td>
                                            <td>{user.year_level}</td>
                                            <td>
                                                <button
                                                    className="delete"
                                                    onClick={() => handleDelete(user._id, 'Students')}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
    
                        {/* Instructors Table */}
                        <div className="table-container">
                            <h4>Instructors</h4>
                            <table className="user-management-table">
                                <thead>
                                    <tr>
                                        <th>Instructor ID</th>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Email</th>
                                        <th>Password</th>
                                        <th>Contact Number</th>
                                        <th>Gender</th>
                                        <th>Department</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {instructors.map(user => (
                                        <tr
                                            key={user._id}
                                            onMouseEnter={() => setHoveredRow(user._id)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                        >
                                            <td>{user.instructor_id}</td>
                                            <td>{user.first_name}</td>
                                            <td>{user.last_name}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                {hoveredRow === user._id ? (
                                                    <span className="password-tooltip">
                                                        Password: {user.password_hash}
                                                    </span>
                                                ) : (
                                                    '•••••••••'
                                                )}
                                            </td>
                                            <td>{user.contact_number}</td>
                                            <td>{user.gender}</td>
                                            <td>{user.department}</td>
                                            <td>
                                                <button
                                                    className="delete"
                                                    onClick={() => handleDelete(user._id, 'Instructors')}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
    
};

export default UserManagement;
