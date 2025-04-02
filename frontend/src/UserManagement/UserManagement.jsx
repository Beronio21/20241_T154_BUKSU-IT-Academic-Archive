import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

const UserManagement = () => {
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isViewing, setIsViewing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('user-info'));
        setCurrentUser(userInfo);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const config = {
                headers: {
                    'Authorization': `Bearer ${userInfo?.token}`,
                    'Content-Type': 'application/json'
                }
            };

            const studentRes = await axios.get('http://localhost:8080/api/students', config);
            const teacherRes = await axios.get('http://localhost:8080/api/teachers', config);

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
        setSelectedUser(user);
        setIsViewing(true);
    };

    const handleEdit = async (user, type) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const config = {
                headers: {
                    'Authorization': `Bearer ${userInfo?.token}`,
                    'Content-Type': 'application/json'
                }
            };

            // Remove lock check and setting
            setEditingUser({ ...user, type });
            setIsEditing(true);
        } catch (error) {
            console.error('Error starting edit:', error);
            alert('Failed to start editing. Please try again.');
        }
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

            // Ensure lock is released
            await axios.post(`http://localhost:8080/api/users/${userId}/unlock`, {}, config);

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
            fetchData();
            alert('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    const handleCancelEdit = async (userId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const config = {
                headers: {
                    'Authorization': `Bearer ${userInfo?.token}`,
                    'Content-Type': 'application/json'
                }
            };

            // Ensure lock is released
            await axios.post(`http://localhost:8080/api/users/${userId}/unlock`, {}, config);

            setIsEditing(false);
            setEditingUser(null);
        } catch (error) {
            console.error('Error releasing lock:', error);
            alert('Failed to cancel editing. Please try again.');
        }
    };

    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.student_id && student.student_id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredTeachers = teachers.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.teacher_id && teacher.teacher_id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const renderTable = (users, type) => (
        <div className="table-section">
            <h3>{type === 'student' ? 'Students' : 'Teachers'}</h3>
            <table className={`table table-striped table-bordered ${type}s-table`}>
                <thead className="thead-dark">
                    <tr>
                        <th>{type === 'student' ? 'Student ID' : 'Teacher ID'}</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Password Hash</th>
                        <th>{type === 'student' ? 'Course' : 'Department'}</th>
                        {type === 'student' && <th>Year</th>}
                        <th>Profile Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(users) && users.map(user => (
                        <tr key={user._id}>
                            <td>{user[`${type}_id`] || 'Not set'}</td>
                            <td>
                                {user.name}
                            </td>
                            <td>{user.email}</td>
                            <td>
                                <span className="password-hash" title={user.password}>
                                    {user.password ? '********' : 'Not set'}
                                </span>
                            </td>
                            <td>{user[type === 'student' ? 'course' : 'department'] || 'Not set'}</td>
                            {type === 'student' && <td>{user.year || 'Not set'}</td>}
                            <td>
                                <span
                                    className={`badge ${user.isProfileComplete ? 'badge-success' : 'badge-danger'}`}
                                    style={{
                                        fontSize: '1rem',
                                        color: user.isProfileComplete ? '' : 'black'
                                    }}
                                >
                                    {user.isProfileComplete ? 'Complete' : 'Incomplete'}
                                </span>
                            </td>
                            <td className="action-buttons" style={{ display: 'flex', justifyContent: 'space-around' }}>
                                <button 
                                    className="btn btn-primary btn-xs"
                                    onClick={() => handleView(user)}
                                    title="View Details"
                                    style={{ marginRight: '5px', padding: '2px 5px' }}
                                >
                                    <i className="fas fa-eye"></i> View
                                </button>
                                <button 
                                    className="btn btn-warning btn-xs"
                                    onClick={() => handleEdit(user, type)}
                                    title="Edit User"
                                    style={{ marginRight: '5px', padding: '2px 5px' }}
                                >
                                    <i className="fas fa-edit"></i> Edit
                                </button>
                                <button 
                                    className="btn btn-danger btn-xs"
                                    onClick={() => handleDelete(user._id, type)}
                                    title="Delete User"
                                    style={{ padding: '2px 5px' }}
                                >
                                    <i className="fas fa-trash"></i> Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderContent = () => {
        return (
            <section className="user-management-section">
                <div className="current-user-info">
                    <p>Logged in as: {currentUser?.name || currentUser?.email}</p>
                </div>
                <div className="search-bar" style={{ position: 'relative', marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px 15px 10px 35px', // Space for the icon
                            fontSize: '16px',
                            border: '1px solid #ccc',
                            borderRadius: '25px',
                            outline: 'none',
                            width: '250px',
                            backgroundColor: '#f9f9f9', // Light background
                            color: '#000', // Change text color to black
                        }}
                    />
                    <i
                        className="bi bi-search"
                        style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '18px',
                            color: '#006BB2', // Icon color
                            pointerEvents: 'none', // Ensure icon doesn't block input
                        }}
                    ></i>
                </div>
                {renderTable(filteredStudents, 'student')}
                {renderTable(filteredTeachers, 'teacher')}

                {isEditing && editingUser && (
                    <Modal show={isEditing} onHide={() => setIsEditing(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Edit {editingUser.type === 'student' ? 'Student' : 'Teacher'}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
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
                                        className="form-control"
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
                                        className="form-control"
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
                                                className="form-control"
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
                                                className="form-control"
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
                                                className="form-control"
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
                                                className="form-control"
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
                                                className="form-control"
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
                                        className="form-control"
                                    />
                                </div>

                                <div className="modal-buttons">
                                    <Button type="submit" variant="success">Save Changes</Button>
                                    <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                                </div>
                            </form>
                        </Modal.Body>
                    </Modal>
                )}

                {isViewing && selectedUser && (
                    <Modal show={isViewing} onHide={() => setIsViewing(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>User Details</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div>
                                <p><strong>ID:</strong> {selectedUser[`${selectedUser.type}_id`]}</p>
                                <p><strong>Name:</strong> {selectedUser.name}</p>
                                <p><strong>Email:</strong> {selectedUser.email}</p>
                                <p><strong>Type:</strong> {selectedUser.type}</p>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setIsViewing(false)}>Close</Button>
                        </Modal.Footer>
                    </Modal>
                )}
            </section>
        );
    };

    return (
        <div className="container-fluid">
            <div className="row justify-content-center">
                <div className="col-lg-10 col-md-12">
                    <main className="main-content">
                        {students.length === 0 && teachers.length === 0 ? (
                            <div className="loading">Loading users...</div>
                        ) : (
                            renderContent()
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
