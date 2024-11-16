import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // For API calls
import '../styles/UserManagement.css'; // Import the CSS for styling

const UserManagement = () => {
    const [students, setStudents] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);

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
                setLoading(false);
            }
        };

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
    };

    return (
        <div className="user-management-container">
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
};

export default UserManagement;
