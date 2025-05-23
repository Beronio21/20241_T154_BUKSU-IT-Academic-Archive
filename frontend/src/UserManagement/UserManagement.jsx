import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Table, Form, InputGroup, Pagination } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash, FaEye, FaPlus } from 'react-icons/fa';

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
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [activeTab, setActiveTab] = useState('students'); // 'students' or 'teachers'
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

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
                // Sort students by createdAt in descending order (most recent first)
                const sortedStudents = studentRes.data.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setStudents(sortedStudents);
            } else {
                console.warn('Unexpected student data format:', studentRes.data);
                setStudents([]);
            }

            if (Array.isArray(teacherRes.data)) {
                // Sort teachers by createdAt in descending order (most recent first)
                const sortedTeachers = teacherRes.data.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setTeachers(sortedTeachers);
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

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.student_id && student.student_id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredTeachers = teachers.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.teacher_id && teacher.teacher_id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const currentTeachers = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(
        activeTab === 'students' 
            ? filteredStudents.length / itemsPerPage 
            : filteredTeachers.length / itemsPerPage
    );

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderPagination = () => {
        let items = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            items.push(
                <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
                    1
                </Pagination.Item>
            );
            if (startPage > 2) {
                items.push(<Pagination.Ellipsis key="start-ellipsis" />);
            }
        }

        for (let number = startPage; number <= endPage; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => handlePageChange(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                items.push(<Pagination.Ellipsis key="end-ellipsis" />);
            }
            items.push(
                <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
                    {totalPages}
                </Pagination.Item>
            );
        }

        return (
            <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="d-flex align-items-center">
                    <span className="me-2">Page {currentPage} of {totalPages}</span>
                    <span className="me-2">|</span>
                    <span>Total Items: {activeTab === 'students' ? filteredStudents.length : filteredTeachers.length}</span>
                </div>
                <Pagination className="mb-0">
                    <Pagination.Prev
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    />
                    {items}
                    <Pagination.Next
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                    />
                </Pagination>
            </div>
        );
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
        setUserToDelete({ id: userId, type });
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const config = {
                headers: {
                    'Authorization': `Bearer ${userInfo?.token}`,
                    'Content-Type': 'application/json'
                }
            };

            const endpoint = userToDelete.type === 'student' 
                ? `http://localhost:8080/api/students/${userToDelete.id}`
                : `http://localhost:8080/api/teachers/${userToDelete.id}`;

            await axios.delete(endpoint, config);
            fetchData();
            setShowDeleteModal(false);
            setUserToDelete(null);
            alert('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    const renderTable = (users, type) => (
        <div className="table-responsive" style={{ 
            maxHeight: 'calc(100vh - 250px)', 
            minHeight: 'calc(100vh - 250px)',
            minWidth: '1100px',
            overflow: 'auto'
        }}>
            <Table striped bordered hover className="mt-3 mb-0">
                <thead className="table-dark position-sticky top-0" style={{ zIndex: 1 }}>
                    <tr>
                        <th style={{ width: '100px' }}>{type === 'student' ? 'Student ID' : 'Teacher ID'}</th>
                        <th style={{ width: '200px' }}>Name</th>
                        <th style={{ width: '250px' }}>Email</th>
                        <th style={{ width: '180px' }}>{type === 'student' ? 'Course' : 'Department'}</th>
                        {type === 'student' && <th style={{ width: '80px' }}>Year</th>}
                        <th style={{ width: '90px' }}>Status</th>
                        <th style={{ width: '120px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user[`${type}_id`] || 'Not set'}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user[type === 'student' ? 'course' : 'department'] || 'Not set'}</td>
                            {type === 'student' && <td>{user.year || 'Not set'}</td>}
                            <td>
                                <span className={`badge ${user.isProfileComplete ? 'bg-success' : 'bg-danger'}`}>
                                    {user.isProfileComplete ? 'Complete' : 'Incomplete'}
                                </span>
                            </td>
                            <td>
                                <div className="d-flex justify-content-start">
                                    <Button
                                        variant="info"
                                        size="sm"
                                        className="me-2"
                                    onClick={() => handleView(user)}
                                    >
                                        <FaEye />
                                    </Button>
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        className="me-2"
                                    onClick={() => handleEdit(user, type)}
                                    >
                                        <FaEdit />
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                    onClick={() => handleDelete(user._id, type)}
                                >
                                        <FaTrash />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );

        return (
        <div className="container-fluid" style={{ 
            minWidth: '1200px',
            minHeight: '100vh',
            padding: '15px',
            overflow: 'hidden'
        }}>
            <div className="row h-100">
                <div className="col-12 h-100">
                    <div className="card shadow h-100">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-2" style={{ minHeight: '60px' }}>
                            <h3 className="mb-0">User Management</h3>
                            <div className="d-flex align-items-center">
                                <InputGroup style={{ width: '300px' }}>
                                    <InputGroup.Text>
                                        <FaSearch />
                                    </InputGroup.Text>
                                    <Form.Control
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </div>
                        </div>
                        <div className="card-body p-3" style={{ 
                            height: 'calc(100% - 60px)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <ul className="nav nav-tabs mb-3">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'students' ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveTab('students');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Students
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'teachers' ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveTab('teachers');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Teachers
                                    </button>
                                </li>
                            </ul>

                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                {activeTab === 'students' ? renderTable(currentStudents, 'student') : renderTable(currentTeachers, 'teacher')}
                            </div>
                            
                            <div className="mt-2" style={{ minHeight: '40px' }}>
                                {renderPagination()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            <Modal show={isViewing} onHide={() => setIsViewing(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>User Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedUser && (
                        <div className="row">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <h6 className="text-muted">ID</h6>
                                    <p className="mb-0">{selectedUser[`${selectedUser.type}_id`]}</p>
                                </div>
                                <div className="mb-3">
                                    <h6 className="text-muted">Name</h6>
                                    <p className="mb-0">{selectedUser.name}</p>
                                </div>
                                <div className="mb-3">
                                    <h6 className="text-muted">Email</h6>
                                    <p className="mb-0">{selectedUser.email}</p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <h6 className="text-muted">Type</h6>
                                    <p className="mb-0">{selectedUser.type}</p>
                                </div>
                                <div className="mb-3">
                                    <h6 className="text-muted">{selectedUser.type === 'student' ? 'Course' : 'Department'}</h6>
                                    <p className="mb-0">{selectedUser[selectedUser.type === 'student' ? 'course' : 'department']}</p>
                                </div>
                                {selectedUser.type === 'student' && (
                                    <div className="mb-3">
                                        <h6 className="text-muted">Year</h6>
                                        <p className="mb-0">{selectedUser.year}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="secondary" onClick={() => setIsViewing(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Modal */}
            <Modal show={isEditing} onHide={() => setIsEditing(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>Edit {editingUser?.type === 'student' ? 'Student' : 'Teacher'}</Modal.Title>
                        </Modal.Header>
                <Modal.Body className="p-4">
                    {editingUser && (
                        <Form onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdate(editingUser._id, editingUser.type, editingUser);
                            }}>
                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold">Name</Form.Label>
                                        <Form.Control
                                        type="text"
                                        value={editingUser.name || ''}
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            name: e.target.value
                                        })}
                                            className="py-2"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold">Email</Form.Label>
                                        <Form.Control
                                        type="email"
                                        value={editingUser.email || ''}
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            email: e.target.value
                                        })}
                                            className="py-2"
                                    />
                                    </Form.Group>

                                {editingUser.type === 'student' ? (
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-bold">Student ID</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={editingUser.student_id || ''}
                                                onChange={(e) => setEditingUser({
                                                    ...editingUser,
                                                    student_id: e.target.value
                                                })}
                                                className="py-2"
                                            />
                                        </Form.Group>
                                    ) : (
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-bold">Teacher ID</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={editingUser.teacher_id || ''}
                                                onChange={(e) => setEditingUser({
                                                    ...editingUser,
                                                    teacher_id: e.target.value
                                                })}
                                                className="py-2"
                                            />
                                        </Form.Group>
                                    )}
                                        </div>
                                <div className="col-md-6">
                                    {editingUser.type === 'student' ? (
                                        <>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="fw-bold">Course</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={editingUser.course || ''}
                                                    onChange={(e) => setEditingUser({
                                                        ...editingUser,
                                                        course: e.target.value
                                                    })}
                                                    className="py-2"
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="fw-bold">Year</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={editingUser.year || ''}
                                                    onChange={(e) => setEditingUser({
                                                        ...editingUser,
                                                        year: e.target.value
                                                    })}
                                                    className="py-2"
                                                />
                                            </Form.Group>
                                        </>
                                    ) : (
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-bold">Department</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={editingUser.department || ''}
                                                onChange={(e) => setEditingUser({
                                                    ...editingUser,
                                                    department: e.target.value
                                                })}
                                                className="py-2"
                                            />
                                        </Form.Group>
                                    )}

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold">New Password (leave blank to keep current)</Form.Label>
                                        <Form.Control
                                        type="password"
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            password: e.target.value
                                        })}
                                            className="py-2"
                                    />
                                    </Form.Group>
                                </div>
                                </div>

                            <div className="d-flex justify-content-end mt-4">
                                <Button variant="secondary" className="me-2 px-4" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit" className="px-4">
                                    Save Changes
                                </Button>
                            </div>
                        </Form>
                    )}
                        </Modal.Body>
                    </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header className="bg-danger text-white">
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this user?</p>
                    {userToDelete && (
                        <>
                            <p className="mb-0"><strong>Name:</strong> {userToDelete.name}</p>
                            <p className="mb-0"><strong>Email:</strong> {userToDelete.email}</p>
                            <p className="mb-0"><strong>Role:</strong> {userToDelete.type === 'student' ? 'Student' : 'Teacher'}</p>
                            {userToDelete.type === 'student' && (
                                <p className="mb-0"><strong>Student ID:</strong> {userToDelete.student_id}</p>
                            )}
                            {userToDelete.type === 'teacher' && (
                                <p className="mb-0"><strong>Teacher ID:</strong> {userToDelete.teacher_id}</p>
                            )}
                            <p className="mt-2 text-danger"><strong>Warning:</strong> This action cannot be undone.</p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between px-4">
                    <div className="d-flex justify-content-start">
                        <Button variant="secondary" onClick={() => {
                            setShowDeleteModal(false);
                            setUserToDelete(null);
                        }}>
                            Cancel
                        </Button>
                </div>
                    <div className="d-flex justify-content-end">
                        <Button variant="danger" onClick={confirmDelete}>
                            Delete
                        </Button>
            </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserManagement;
