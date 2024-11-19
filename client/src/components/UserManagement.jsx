import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
import axios from 'axios'; // For API calls
import '../styles/UserManagement.css'; // Import the CSS for styling
=======
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../styles/UserManagement.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
>>>>>>> DEVELOPER2

const UserManagement = () => {
    const [students, setStudents] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
<<<<<<< HEAD

    useEffect(() => {
        // Fetch users data from the API
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/users'); // Adjust endpoint as needed
                setStudents(response.data.students);
                setInstructors(response.data.instructors);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
=======
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
>>>>>>> DEVELOPER2
                setLoading(false);
            }
        };

<<<<<<< HEAD
        fetchUsers();
    }, []);

    // Handle delete user
    const handleDelete = async (userId, userType) => {
        try {
            await axios.delete(`/api/users/${userId}/${userType}`); // Adjust endpoint as needed
            if (userType === 'Student') {
                setStudents(students.filter(user => user._id !== userId));
            } else if (userType === 'Instructor') {
                setInstructors(instructors.filter(user => user._id !== userId));
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
=======
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
>>>>>>> DEVELOPER2
    };

    return (
        <div className="user-management-container">
<<<<<<< HEAD
            <div className="user-management-header">
                <h2>User Management</h2>
                <Link to="/register-student" className="add-user-btn">Add Student</Link>
                <Link to="/register-instructor" className="add-user-btn">Add Instructor</Link>
            </div>
            {loading ? (
                <p>Loading users...</p>
            ) : (
                <div>
                    {/* Students Table */}
                    <h3>Students</h3>
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student._id}>
                                    <td>{student.student_id}</td>
                                    <td>{`${student.first_name} ${student.last_name}`}</td>
                                    <td>{student.email}</td>
                                    <td>
                                        <Link to={`/edit-student/${student._id}`} className="edit-btn">Edit</Link>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(student._id, 'Student')}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Instructors Table */}
                    <h3>Instructors</h3>
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {instructors.map(instructor => (
                                <tr key={instructor._id}>
                                    <td>{instructor.instructor_id}</td>
                                    <td>{`${instructor.first_name} ${instructor.last_name}`}</td>
                                    <td>{instructor.email}</td>
                                    <td>
                                        <Link to={`/edit-instructor/${instructor._id}`} className="edit-btn">Edit</Link>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(instructor._id, 'Instructor')}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
=======
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
    
>>>>>>> DEVELOPER2
};

export default UserManagement;
