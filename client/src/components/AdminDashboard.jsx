import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Axios for API calls
import { useNavigate } from 'react-router-dom'; // For navigation
import { useAuth } from '../AuthContext'; // For authentication
import '../styles/UserManagement.css'; // Styling

const UserManagement = () => {
    const [students, setStudents] = useState([]); // State to store students
    const [instructors, setInstructors] = useState([]); // State to store instructors
    const [loading, setLoading] = useState(true); // State for loading indicator
    const [error, setError] = useState(null); // State for error handling
    const { logout } = useAuth(); // Get logout function from AuthContext
    const navigate = useNavigate(); // Hook for navigation

    // Fetch students and instructors from the backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch students
                const studentsResponse = await axios.get('http://localhost:5000/api/Students/');
                const instructorsResponse = await axios.get('http://localhost:5000/api/Instructors/');

                setStudents(studentsResponse.data); // Set students data to state
                setInstructors(instructorsResponse.data); // Set instructors data to state
            } catch (err) {
                setError('Failed to fetch users');
            } finally {
                setLoading(false); // Stop loading
            }
        };

        fetchData();
    }, []);

    // Handle delete user
    const handleDelete = async (userId, userType) => {
        try {
            await axios.delete(`http://localhost:5000/api/${userType}/${userId}`); // Delete user from backend

            if (userType === 'Students') {
                setStudents(students.filter(user => user._id !== userId)); // Remove student from state
            } else if (userType === 'Instructors') {
                setInstructors(instructors.filter(user => user._id !== userId)); // Remove instructor from state
            }
        } catch (err) {
            setError('Failed to delete user');
        }
    };

    // Handle Logout
    const handleLogout = () => {
        logout(); // Clear the token and authentication state
        navigate('/'); // Redirect to login page after logout
    };

    return (
        <div className="user-management-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <h2>Admin Panel</h2>
                </div>
                <ul className="sidebar-menu">
                    <li><a href="admin-dashboard">Dashboard</a></li>
                    <li><a href="/manage-thesis">Manage Thesis Submissions</a></li>
                    <li><a href="/settings">Settings</a></li>
                    <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
                </ul>
            </aside>

            {/* Main Content */}
            <div className="main-content">
                <header className="topbar">
                    <h2>User Management</h2>
                </header>

                {/* Error Message */}
                {error && <p className="error">{error}</p>}

                {/* Loading Indicator */}
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
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(user => (
                                        <tr key={user._id}>
                                            <td>{user.first_name} {user.last_name}</td>
                                            <td>{user.email}</td>
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
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {instructors.map(user => (
                                        <tr key={user._id}>
                                            <td>{user.first_name} {user.last_name}</td>
                                            <td>{user.email}</td>
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
