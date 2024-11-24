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

    const handleView = (user) => {
        // You can implement a modal or redirect to a detailed view
        console.log('Viewing user:', user);
    };

    const handleEdit = async (user, type) => {
        setEditingUser({ ...user, type });
        setIsEditing(true);
    };

    const handleUpdate = async (userId, type, updatedData) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const config = {
                headers: {
                    'Authorization': `Bearer ${userInfo?.token}`,
                    'Content-Type': 'application/json'
                }
            };

            const endpoint = type === 'student' 
                ? `http://localhost:8080/api/students/${userId}`
                : `http://localhost:8080/api/teachers/${userId}`;

            await axios.put(endpoint, updatedData, config);
            
            // Refresh the data after update
            fetchData();
            setIsEditing(false);
            setEditingUser(null);
            alert('User updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user');
        }
    };

    const handleDelete = async (userId, type) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const config = {
                headers: {
                    'Authorization': `Bearer ${userInfo?.token}`,
                    'Content-Type': 'application/json'
                }
            };

            const endpoint = type === 'student' 
                ? `http://localhost:8080/api/students/${userId}`
                : `http://localhost:8080/api/teachers/${userId}`;

            await axios.delete(endpoint, config);
            
            // Refresh the data after successful deletion
            fetchData();
            alert('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    const renderContent = () => {
        return (
            <section className="user-management-section">
                {/* Students Table */}
                <div className="table-section">
                    <h3>Students</h3>
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Password Hash</th>
                                <th>Course</th>
                                <th>Year</th>
                                <th>Profile Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(students) && students.map(student => (
                                <tr key={student._id}>
                                    <td>{student.student_id || 'Not set'}</td>
                                    <td>{student.name}</td>
                                    <td>{student.email}</td>
                                    <td>
                                        <span className="password-hash" title={student.password}>
                                            {student.password ? '********' : 'Not set'}
                                        </span>
                                    </td>
                                    <td>{student.course || 'Not set'}</td>
                                    <td>{student.year || 'Not set'}</td>
                                    <td>
                                        <span className={`status-badge ${student.isProfileComplete ? 'complete' : 'incomplete'}`}>
                                            {student.isProfileComplete ? 'Complete' : 'Incomplete'}
                                        </span>
                                    </td>
                                    <td className="action-buttons">
                                        <button 
                                            className="btn-view"
                                            onClick={() => handleView(student)}
                                            title="View Details"
                                        >
                                            <i className="fas fa-eye"></i> View
                                        </button>
                                        <button 
                                            className="btn-edit"
                                            onClick={() => handleEdit(student, 'student')}
                                            title="Edit User"
                                        >
                                            <i className="fas fa-edit"></i> Edit
                                        </button>
                                        <button 
                                            className="btn-delete"
                                            onClick={() => handleDelete(student._id, 'student')}
                                            title="Delete User"
                                        >
                                            <i className="fas fa-trash"></i> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Teachers Table */}
                <div className="table-section">
                    <h3>Teachers</h3>
                    <table className="teachers-table">
                        <thead>
                            <tr>
                                <th>Teacher ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Password Hash</th>
                                <th>Department</th>
                                <th>Profile Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(teachers) && teachers.map(teacher => (
                                <tr key={teacher._id}>
                                    <td>{teacher.teacher_id || 'Not set'}</td>
                                    <td>{teacher.name}</td>
                                    <td>{teacher.email}</td>
                                    <td>
                                        <span className="password-hash" title={teacher.password}>
                                            {teacher.password ? '********' : 'Not set'}
                                        </span>
                                    </td>
                                    <td>{teacher.department || 'Not set'}</td>
                                    <td>
                                        <span className={`status-badge ${teacher.isProfileComplete ? 'complete' : 'incomplete'}`}>
                                            {teacher.isProfileComplete ? 'Complete' : 'Incomplete'}
                                        </span>
                                    </td>
                                    <td className="action-buttons">
                                        <button 
                                            className="btn-view"
                                            onClick={() => handleView(teacher)}
                                            title="View Details"
                                        >
                                            <i className="fas fa-eye"></i> View
                                        </button>
                                        <button 
                                            className="btn-edit"
                                            onClick={() => handleEdit(teacher, 'teacher')}
                                            title="Edit User"
                                        >
                                            <i className="fas fa-edit"></i> Edit
                                        </button>
                                        <button 
                                            className="btn-delete"
                                            onClick={() => handleDelete(teacher._id, 'teacher')}
                                            title="Delete User"
                                        >
                                            <i className="fas fa-trash"></i> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {isEditing && editingUser && (
                    <div className="edit-modal">
                        <div className="modal-content">
                            <h3>Edit {editingUser.type === 'student' ? 'Student' : 'Teacher'}</h3>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdate(editingUser._id, editingUser.type, editingUser);
                            }}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={editingUser.name || ''}
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            name: e.target.value
                                        })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={editingUser.email || ''}
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            email: e.target.value
                                        })}
                                    />
                                </div>

                                {editingUser.type === 'student' ? (
                                    <>
                                        <div className="form-group">
                                            <label>Student ID</label>
                                            <input
                                                type="text"
                                                value={editingUser.student_id || ''}
                                                onChange={(e) => setEditingUser({
                                                    ...editingUser,
                                                    student_id: e.target.value
                                                })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Course</label>
                                            <input
                                                type="text"
                                                value={editingUser.course || ''}
                                                onChange={(e) => setEditingUser({
                                                    ...editingUser,
                                                    course: e.target.value
                                                })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Year</label>
                                            <input
                                                type="number"
                                                value={editingUser.year || ''}
                                                onChange={(e) => setEditingUser({
                                                    ...editingUser,
                                                    year: e.target.value
                                                })}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="form-group">
                                            <label>Teacher ID</label>
                                            <input
                                                type="text"
                                                value={editingUser.teacher_id || ''}
                                                onChange={(e) => setEditingUser({
                                                    ...editingUser,
                                                    teacher_id: e.target.value
                                                })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Department</label>
                                            <input
                                                type="text"
                                                value={editingUser.department || ''}
                                                onChange={(e) => setEditingUser({
                                                    ...editingUser,
                                                    department: e.target.value
                                                })}
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="form-group">
                                    <label>New Password (leave blank to keep current)</label>
                                    <input
                                        type="password"
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            password: e.target.value
                                        })}
                                    />
                                </div>

                                <div className="modal-buttons">
                                    <button type="submit" className="btn-save">
                                        Save Changes
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn-cancel"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditingUser(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
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