import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Table, Form, InputGroup, Pagination, Badge, Alert } from 'react-bootstrap';
import { FaSearch, FaEye, FaEdit, FaTrash, FaUserPlus, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import SuccessModal from '../components/SuccessModal';
import AdminNavbar from '../Navbar/Admin-Navbar/AdminNavbar';

const UserManagement2 = () => {
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isViewing, setIsViewing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [activeTab, setActiveTab] = useState('students');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const activeSection = location.pathname.split('/').pop();

    const handleSectionChange = (section) => {
        navigate(`/admin-dashboard/${section}`);
    };

    // Calculate pagination indexes first
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

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
                const sortedStudents = studentRes.data.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setStudents(sortedStudents);
            } else {
                setStudents([]);
            }

            if (Array.isArray(teacherRes.data)) {
                const sortedTeachers = teacherRes.data.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setTeachers(sortedTeachers);
            } else {
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

    const filteredUsers = (users, type) => {
        return users.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user[`${type}_id`] && user[`${type}_id`].toString().toLowerCase().includes(searchTerm.toLowerCase()))
        );
    };

    const currentItems = activeTab === 'students' 
        ? filteredUsers(students, 'student').slice(indexOfFirstItem, indexOfLastItem)
        : filteredUsers(teachers, 'teacher').slice(indexOfFirstItem, indexOfLastItem);

    const totalItems = activeTab === 'students' 
        ? filteredUsers(students, 'student').length 
        : filteredUsers(teachers, 'teacher').length;

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderPagination = () => {
        let items = [];
        for (let number = 1; number <= totalPages; number++) {
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

        return (
            <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                    <span>Total Items: {totalItems}</span>
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

    const renderTable = (users, type) => (
        <div className="table-responsive">
            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>{type === 'student' ? 'Student ID' : 'Teacher ID'}</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>{type === 'student' ? 'Course' : 'Department'}</th>
                        {type === 'student' && <th>Year</th>}
                        <th>Status</th>
                        <th>Actions</th>
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
                                <div className="d-flex gap-2">
                                    <Button variant="info" size="sm" onClick={() => handleView(user)}>
                                        View
                                    </Button>
                                    <Button variant="warning" size="sm" onClick={() => handleEdit(user, type)}>
                                        Edit
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(user._id, type)}>
                                        Delete
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );

    const handleView = (user) => {
        setSelectedUser(user);
        setIsViewing(true);
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
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    return (
        <div className="d-flex">
            <AdminNavbar 
                activeSection={activeSection} 
                handleSectionChange={handleSectionChange} 
            />
            
            <div className="flex-grow-1" style={{ marginLeft: '250px' }}>
                <div className="container-fluid" style={{ 
                    minWidth: '1200px',
                    minHeight: '100vh',
                    padding: '15px',
                    overflow: 'hidden'
                }}>
                    <div className="row h-100">
                        <div className="col-12 h-100">
                            <div className="card shadow h-100">
                                <div className="card-header bg-primary text-white py-3" style={{ minHeight: '70px' }}>
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                        <h3 className="mb-0">User Management</h3>
                                        <div className="d-flex align-items-center justify-content-end" style={{ flex: 1, marginLeft: '24px' }}>
                                            <div className="btn-group me-3">
                                                <button
                                                    className={`btn ${activeTab === 'students' ? 'btn-light' : 'btn-outline-light'}`}
                                                    onClick={() => {
                                                        setActiveTab('students');
                                                        setCurrentPage(1);
                                                    }}
                                                    style={{ minWidth: '100px' }}
                                                >
                                                    Students
                                                </button>
                                                <button
                                                    className={`btn ${activeTab === 'teachers' ? 'btn-light' : 'btn-outline-light'}`}
                                                    onClick={() => {
                                                        setActiveTab('teachers');
                                                        setCurrentPage(1);
                                                    }}
                                                    style={{ minWidth: '100px' }}
                                                >
                                                    Teachers
                                                </button>
                                            </div>
                                            <div className="search-container" style={{ minWidth: '280px', maxWidth: '400px' }}>
                                                <InputGroup style={{ height: '44px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                                    <InputGroup.Text style={{ 
                                                        background: '#fff', 
                                                        border: '1px solid #e5e7eb',
                                                        borderRight: 'none',
                                                        borderRadius: '8px 0 0 8px',
                                                        color: '#6b7280',
                                                        padding: '12px 16px',
                                                        height: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}>
                                                        <FaSearch size={16} />
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Search by name or ID..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        style={{ 
                                                            border: '1px solid #e5e7eb',
                                                            borderLeft: 'none',
                                                            borderRadius: '0 8px 8px 0',
                                                            padding: '12px 16px',
                                                            fontSize: '14px',
                                                            background: '#fff',
                                                            color: '#374151',
                                                            height: '100%'
                                                        }}
                                                    />
                                                </InputGroup>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body p-3" style={{ 
                                    height: 'calc(100% - 60px)',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    {error ? (
                                        <div className="alert alert-danger m-3">{error}</div>
                                    ) : (
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div className="table-responsive" style={{ 
                                                maxHeight: 'calc(100vh - 250px)', 
                                                minHeight: 'calc(100vh - 250px)',
                                                overflow: 'auto'
                                            }}>
                                                <Table hover className="mb-0">
                                                    <thead className="table-dark position-sticky top-0" style={{ zIndex: 1 }}>
                                                        <tr>
                                                            <th style={{ width: '15%', minWidth: '120px' }}>
                                                                {activeTab === 'students' ? 'Student ID' : 'Teacher ID'}
                                                            </th>
                                                            <th style={{ width: '20%', minWidth: '180px' }}>Name</th>
                                                            <th style={{ width: '25%', minWidth: '200px' }}>Email</th>
                                                            <th style={{ width: '15%', minWidth: '150px' }}>
                                                                {activeTab === 'students' ? 'Course' : 'Department'}
                                                            </th>
                                                            {activeTab === 'students' && (
                                                                <th style={{ width: '10%', minWidth: '80px' }}>Year</th>
                                                            )}
                                                            <th style={{ width: '10%', minWidth: '100px' }}>Status</th>
                                                            <th style={{ width: '15%', minWidth: '150px' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentItems.map(user => (
                                                            <tr key={user._id}>
                                                                <td>{user[`${activeTab.slice(0, -1)}_id`] || 'Not set'}</td>
                                                                <td>
                                                                    <div className="text-truncate" style={{ maxWidth: '180px' }}>
                                                                        {user.name}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="text-truncate" style={{ maxWidth: '200px' }}>
                                                                        {user.email}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="text-truncate" style={{ maxWidth: '150px' }}>
                                                                        {user[activeTab === 'students' ? 'course' : 'department'] || 'Not set'}
                                                                    </div>
                                                                </td>
                                                                {activeTab === 'students' && (
                                                                    <td>{user.year || 'Not set'}</td>
                                                                )}
                                                                <td>
                                                                    <Badge 
                                                                        bg={user.isProfileComplete ? 'success' : 'warning'}
                                                                        className="px-2 py-1"
                                                                    >
                                                                        {user.isProfileComplete ? 'Complete' : 'Incomplete'}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex gap-2">
                                                                        <Button
                                                                            variant="outline-primary"
                                                                            size="sm"
                                                                            className="d-inline-flex align-items-center justify-content-center"
                                                                            onClick={() => handleView(user)}
                                                                            style={{
                                                                                width: '32px',
                                                                                height: '32px',
                                                                                padding: 0,
                                                                                borderRadius: '4px'
                                                                            }}
                                                                            title="View Details"
                                                                        >
                                                                            <FaEye size={14} />
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline-warning"
                                                                            size="sm"
                                                                            className="d-inline-flex align-items-center justify-content-center"
                                                                            onClick={() => handleEdit(user, activeTab.slice(0, -1))}
                                                                            style={{
                                                                                width: '32px',
                                                                                height: '32px',
                                                                                padding: 0,
                                                                                borderRadius: '4px'
                                                                            }}
                                                                            title="Edit User"
                                                                        >
                                                                            <FaEdit size={14} />
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline-danger"
                                                                            size="sm"
                                                                            className="d-inline-flex align-items-center justify-content-center"
                                                                            onClick={() => handleDelete(user._id, activeTab.slice(0, -1))}
                                                                            style={{
                                                                                width: '32px',
                                                                                height: '32px',
                                                                                padding: 0,
                                                                                borderRadius: '4px'
                                                                            }}
                                                                            title="Delete User"
                                                                        >
                                                                            <FaTrash size={14} />
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                                {currentItems.length === 0 && (
                                                    <div className="text-center py-5">
                                                        <p className="text-muted mb-0">No users found</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-2" style={{ minHeight: '40px' }}>
                                                {renderPagination()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delete Modal */}
                    <div className={`custom-modal ${showDeleteModal ? 'show' : ''}`} onClick={() => setShowDeleteModal(false)}>
                        <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="custom-modal-header bg-danger text-white">
                                <h3>
                                    <FaTrash className="me-2" />
                                    Confirm Delete User
                                </h3>
                                <button 
                                    onClick={() => setShowDeleteModal(false)} 
                                    className="close-button"
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        color: '#fff', 
                                        fontSize: '24px', 
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        padding: '0',
                                        width: '30px',
                                        height: '30px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                    onMouseOver={e => {
                                        e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    }}
                                    onMouseOut={e => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    &times;
                                </button>
                            </div>
                            <div className="custom-modal-body">
                                <div className="delete-confirmation-content">
                                    <Alert variant="warning" className="mb-4">
                                        <FaExclamationTriangle className="me-2" />
                                        Are you sure you want to delete this user? This action cannot be undone.
                                    </Alert>
                                </div>
                            </div>
                            <div className="custom-modal-footer">
                                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                                    Cancel
                                </Button>
                                <Button variant="danger" onClick={confirmDelete}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* View Modal */}
                    <div className={`custom-modal ${isViewing ? 'show' : ''}`} onClick={() => setIsViewing(false)}>
                        <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="custom-modal-header bg-primary text-white">
                                <h3>
                                    <FaUserPlus className="me-2" />
                                    User Details
                                </h3>
                                <button 
                                    onClick={() => setIsViewing(false)} 
                                    className="close-button"
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        color: '#fff', 
                                        fontSize: '24px', 
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        padding: '0',
                                        width: '30px',
                                        height: '30px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                    onMouseOver={e => {
                                        e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    }}
                                    onMouseOut={e => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    &times;
                                </button>
                            </div>
                            <div className="custom-modal-body">
                                {selectedUser && (
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="text-muted small mb-1">ID</label>
                                                <p className="mb-0 fw-bold">{selectedUser[`${selectedUser.type}_id`]}</p>
                                            </div>
                                            <div className="mb-3">
                                                <label className="text-muted small mb-1">Name</label>
                                                <p className="mb-0 fw-bold">{selectedUser.name}</p>
                                            </div>
                                            <div className="mb-3">
                                                <label className="text-muted small mb-1">Email</label>
                                                <p className="mb-0 fw-bold">{selectedUser.email}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="text-muted small mb-1">Role</label>
                                                <p className="mb-0 text-capitalize fw-bold">{selectedUser.type}</p>
                                            </div>
                                            <div className="mb-3">
                                                <label className="text-muted small mb-1">
                                                    {selectedUser.type === 'student' ? 'Course' : 'Department'}
                                                </label>
                                                <p className="mb-0 fw-bold">
                                                    {selectedUser[selectedUser.type === 'student' ? 'course' : 'department']}
                                                </p>
                                            </div>
                                            {selectedUser.type === 'student' && (
                                                <div className="mb-3">
                                                    <label className="text-muted small mb-1">Year</label>
                                                    <p className="mb-0 fw-bold">{selectedUser.year}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="custom-modal-footer">
                                <Button variant="secondary" onClick={() => setIsViewing(false)}>Close</Button>
                            </div>
                        </div>
                    </div>

                    {/* Edit Modal */}
                    <div className={`custom-modal ${isEditing ? 'show' : ''}`} onClick={() => setIsEditing(false)}>
                        <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="custom-modal-header bg-primary text-white">
                                <h3>
                                    <FaEdit className="me-2" />
                                    Edit {editingUser?.type === 'student' ? 'Student' : 'Teacher'}
                                </h3>
                                <button 
                                    onClick={() => setIsEditing(false)} 
                                    className="close-button"
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        color: '#fff', 
                                        fontSize: '24px', 
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        padding: '0',
                                        width: '30px',
                                        height: '30px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                    onMouseOver={e => {
                                        e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    }}
                                    onMouseOut={e => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    &times;
                                </button>
                            </div>
                            <div className="custom-modal-body">
                                {editingUser && (
                                    <Form onSubmit={(e) => {
                                        e.preventDefault();
                                        handleUpdate(editingUser._id, editingUser.type, editingUser);
                                    }}>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <Form.Group>
                                                    <Form.Label className="small">Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={editingUser.name || ''}
                                                        onChange={(e) => setEditingUser({
                                                            ...editingUser,
                                                            name: e.target.value
                                                        })}
                                                    />
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Group>
                                                    <Form.Label className="small">Email</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        value={editingUser.email || ''}
                                                        onChange={(e) => setEditingUser({
                                                            ...editingUser,
                                                            email: e.target.value
                                                        })}
                                                    />
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Group>
                                                    <Form.Label className="small">
                                                        {editingUser.type === 'student' ? 'Student ID' : 'Teacher ID'}
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={editingUser[`${editingUser.type}_id`] || ''}
                                                        onChange={(e) => setEditingUser({
                                                            ...editingUser,
                                                            [`${editingUser.type}_id`]: e.target.value
                                                        })}
                                                    />
                                                </Form.Group>
                                            </div>
                                            {editingUser.type === 'student' ? (
                                                <>
                                                    <div className="col-md-6">
                                                        <Form.Group>
                                                            <Form.Label className="small">Course</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={editingUser.course || ''}
                                                                onChange={(e) => setEditingUser({
                                                                    ...editingUser,
                                                                    course: e.target.value
                                                                })}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <Form.Group>
                                                            <Form.Label className="small">Year</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                value={editingUser.year || ''}
                                                                onChange={(e) => setEditingUser({
                                                                    ...editingUser,
                                                                    year: e.target.value
                                                                })}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="col-md-6">
                                                    <Form.Group>
                                                        <Form.Label className="small">Department</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={editingUser.department || ''}
                                                            onChange={(e) => setEditingUser({
                                                                ...editingUser,
                                                                department: e.target.value
                                                            })}
                                                        />
                                                    </Form.Group>
                                                </div>
                                            )}
                                            <div className="col-12">
                                                <Form.Group>
                                                    <Form.Label className="small">New Password (leave blank to keep current)</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        onChange={(e) => setEditingUser({
                                                            ...editingUser,
                                                            password: e.target.value
                                                        })}
                                                    />
                                                </Form.Group>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-end gap-2 mt-4">
                                            <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                                Cancel
                                            </Button>
                                            <Button variant="primary" type="submit">
                                                Save Changes
                                            </Button>
                                        </div>
                                    </Form>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Success Modal */}
                    <SuccessModal
                        show={showSuccessModal}
                        onHide={() => setShowSuccessModal(false)}
                        title="User Deleted Successfully"
                        message="The user has been successfully removed from the system."
                    />
                </div>
            </div>
        </div>
    );
};

export default UserManagement2;
