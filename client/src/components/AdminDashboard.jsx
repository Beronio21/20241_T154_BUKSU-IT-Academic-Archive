import React, { useState, useEffect } from 'react';
import axios from 'axios'; // You can also use fetch if you prefer
import { useNavigate } from 'react-router-dom'; // Use this hook to navigate after logout
import { useAuth } from '../AuthContext'; // Import the auth context for logout handling
import '../styles/UserManagement.css'; // Optional for styling

const UserManagement = () => {
    const [students, setStudents] = useState([]); // State to store students
    const [instructors, setInstructors] = useState([]); // State to store instructors
    const [loading, setLoading] = useState(true); // State for loading indicator
    const [error, setError] = useState(null); // State for error handling
    const { logout } = useAuth(); // Get logout function from AuthContext
    const navigate = useNavigate(); // Hook for navigation

    // Fetch users data from the backend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('/api/users'); // Make API call to get users
                const users = response.data;

                // Separate students and instructors based on role
                const studentsData = users.filter(user => user.role === 'student');
                const instructorsData = users.filter(user => user.role === 'instructor');

                setStudents(studentsData); // Set students data to state
                setInstructors(instructorsData); // Set instructors data to state
            } catch (err) {
                setError('Failed to fetch users');
            } finally {
                setLoading(false); // Stop loading
            }
        };

        fetchUsers();
    }, []);

    // Handle delete user
    const handleDelete = async (userId) => {
        try {
            await axios.delete(`/api/users/${userId}`); // Delete user from backend
            setStudents(students.filter(user => user._id !== userId)); // Remove student from state
            setInstructors(instructors.filter(user => user._id !== userId)); // Remove instructor from state
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
                    <li><a href="/dashboard">Dashboard</a></li>
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
                                                <button className="delete" onClick={() => handleDelete(user._id)}>Delete</button>
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
                                                <button className="delete" onClick={() => handleDelete(user._id)}>Delete</button>
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
