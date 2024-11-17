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
    const [error, setError] = useState(null);
    const [hoveredRow, setHoveredRow] = useState(null); // Track the currently hovered row's ID
    const [updateFormVisible, setUpdateFormVisible] = useState(false); // State to toggle the update form visibility
    const [selectedStudent, setSelectedStudent] = useState(null); // State to store the selected student for update
    const [loading, setLoading] = useState(true); // Loading state for fetching data
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Fetch students and instructors data on page load
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [studentsResponse, instructorsResponse] = await Promise.all([
                    axios.get('http://localhost:5000/api/Students/'),
                    axios.get('http://localhost:5000/api/Instructors/')
                ]);
                setStudents(studentsResponse.data);
                setInstructors(instructorsResponse.data);
                setLoading(false); // Set loading to false once data is fetched
            } catch (err) {
                setError('Failed to fetch users');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle deleting a user (student or instructor)
    const handleDelete = async (userId, userType) => {
        const apiUrl = userType === 'Students' 
            ? `http://localhost:5000/api/Students/delete/${userId}` 
            : `http://localhost:5000/api/Instructors/delete/${userId}`;

        if (window.confirm(`Are you sure you want to delete this ${userType}?`)) {
            try {
                await axios.delete(apiUrl);
                if (userType === 'Students') {
                    setStudents(prev => prev.filter(user => user._id !== userId));
                } else {
                    setInstructors(prev => prev.filter(user => user._id !== userId));
                }
            } catch (err) {
                console.error('Failed to delete user:', err);
                setError('Failed to delete user');
            }
        }
    };

    // Handle updating a student's details
    const handleUpdate = (userId) => {
        setUpdateFormVisible(true);
        const student = students.find(s => s._id === userId);
        setSelectedStudent(student); // Set the selected student for updating
    };

    // Handle user logout
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="user-management-container">
            <aside className="sidebar">
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

                <div className="tables-container">
                    {/* Students Table */}
                    <div className="table-container">
                        <h4>Students</h4>
                        {loading ? (
                            <div className="loading">Loading students...</div> // Show loading state
                        ) : (
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
                                                <button onClick={() => handleUpdate(user._id)}>Update</button>
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
                        )}
                    </div>

                    {/* Instructors Table */}
                    <div className="table-container">
                        <h4>Instructors</h4>
                        {loading ? (
                            <div className="loading">Loading instructors...</div> // Show loading state for instructors
                        ) : (
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
                        )}
                    </div>
                </div>

                {updateFormVisible && selectedStudent && (
                    <UpdateStudentForm student={selectedStudent} onClose={() => setUpdateFormVisible(false)} />
                )}
            </div>
        </div>
    );
};

const UpdateStudentForm = ({ student, onClose }) => {
    const [updatedData, setUpdatedData] = useState(student);
    const [error, setError] = useState('');

    useEffect(() => {
        setUpdatedData(student); // Populate the form with the student data when it's passed
    }, [student]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!updatedData.first_name || !updatedData.last_name || !updatedData.email) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            await axios.patch(`http://localhost:5000/api/Students/update/${student._id}`, updatedData);
            alert('Student updated successfully');
            onClose(); // Close the form after successful update
        } catch (err) {
            setError('Failed to update student');
        }
    };

    if (!student) return <div>Loading...</div>;

    return (
        <form onSubmit={handleSubmit}>
            <h2>Update Student</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}

            <div>
                <label>First Name</label>
                <input
                    type="text"
                    name="first_name"
                    value={updatedData.first_name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label>Last Name</label>
                <input
                    type="text"
                    name="last_name"
                    value={updatedData.last_name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={updatedData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label>Contact Number</label>
                <input
                    type="text"
                    name="contact_number"
                    value={updatedData.contact_number}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label>Gender</label>
                <input
                    type="text"
                    name="gender"
                    value={updatedData.gender}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label>Birthday</label>
                <input
                    type="date"
                    name="birthday"
                    value={updatedData.birthday.split('T')[0]} 
                    onChange={handleChange}
                />
            </div>

            <div>
                <label>Department</label>
                <input
                    type="text"
                    name="department"
                    value={updatedData.department}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label>Course</label>
                <input
                    type="text"
                    name="course"
                    value={updatedData.course}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label>Year Level</label>
                <input
                    type="number"
                    name="year_level"
                    value={updatedData.year_level}
                    onChange={handleChange}
                />
            </div>

            <div>
                <button type="submit">Update</button>
                <button type="button" onClick={onClose}>Cancel</button>
            </div>
        </form>
    );
};

export default UserManagement;
