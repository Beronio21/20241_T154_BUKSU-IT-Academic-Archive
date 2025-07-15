import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Table, Form, InputGroup, Pagination, Badge, Alert } from 'react-bootstrap';
import { FaSearch, FaEye, FaEdit, FaTrash, FaUserPlus, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import SuccessModal from '../components/SuccessModal';
import AdminNavbar from '../Navbar/Admin-Navbar/AdminNavbar';
import TeacherProfileForm from '../components/TeacherProfileForm';
import { io } from 'socket.io-client';

const UserManagement2 = () => {
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
    const [editSuccessTitle, setEditSuccessTitle] = useState('');
    const [editSuccessMessage, setEditSuccessMessage] = useState('');
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
        fetchTeachers();
    }, []);

    useEffect(() => {
        // Socket.IO real-time updates
        const socket = io('http://localhost:8080');
        socket.on('teacherUpdated', (payload) => {
            fetchTeachers();
        });
        return () => {
            socket.disconnect();
        };
    }, []); // Only run once on mount

    const fetchTeachers = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const config = {
                headers: {
                    'Authorization': `Bearer ${userInfo?.token}`,
                    'Content-Type': 'application/json'
                }
            };
            const teacherRes = await axios.get('http://localhost:8080/api/teachers', config);
            // Only keep users with role 'Teacher' or 'Admin'
            const filtered = Array.isArray(teacherRes.data)
                ? teacherRes.data.filter(t => t.role === 'Teacher' || t.role === 'teacher' || t.role === 'Admin' || t.role === 'admin')
                : [];
            setTeachers(filtered);
            setError(null);
        } catch (error) {
            setError('Failed to fetch teachers. Please try again later.');
            setTeachers([]);
        }
    };

    const filteredTeachers = teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.teacher_id && teacher.teacher_id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const currentTeachers = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

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
                    <span>Total Items: {filteredTeachers.length}</span>
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

    const renderTable = () => (
        <div className="table-responsive">
            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>Teacher</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentTeachers.map(teacher => (
                        <tr key={teacher._id}>
                            <td>{teacher.teacher_id || teacher.admin_id || 'Not set'}</td>
                            <td>{teacher.name}</td>
                            <td>{teacher.email}</td>
                            <td>{teacher.department || 'Not set'}</td>
                            <td>
                                <div className="d-flex gap-2">
                                    <Button variant="info" size="sm" onClick={() => handleView(teacher)}>
                                        View
                                    </Button>
                                    <Button variant="warning" size="sm" onClick={() => handleEdit(teacher)}>
                                        Edit
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(teacher._id)}>
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

    const handleView = async (user) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const config = {
                headers: {
                    'Authorization': `Bearer ${userInfo?.token}`,
                    'Content-Type': 'application/json'
                }
            };
            // Fetch latest teacher data from backend
            const res = await axios.get(`http://localhost:8080/api/teachers/${user._id}`, config);
            setSelectedUser(res.data);
            setIsViewing(true);
        } catch (error) {
            alert('Failed to fetch latest teacher data.');
        }
    };

    const handleEdit = async (user) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const config = {
                headers: {
                    'Authorization': `Bearer ${userInfo?.token}`,
                    'Content-Type': 'application/json'
                }
            };
            // Fetch latest teacher data from backend
            const res = await axios.get(`http://localhost:8080/api/teachers/${user._id}`, config);
            setEditingUser({ ...res.data, type: res.data.role });
            setIsEditing(true);
        } catch (error) {
            alert('Failed to fetch latest teacher data.');
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
            fetchTeachers();
            setIsEditing(false);
            setEditingUser(null);
            setEditSuccessTitle('Changes Saved');
            setEditSuccessMessage('The teacher profile has been updated successfully.');
            setShowEditSuccessModal(true);
            setTimeout(() => setShowEditSuccessModal(false), 2500);
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user');
        }
    };

    const handleDelete = async (userId) => {
        setUserToDelete({ id: userId, type: 'teacher' });
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
            fetchTeachers();
            setShowDeleteModal(false);
            setUserToDelete(null);
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    // Replace old delete modal with a modern Modal
    const renderDeleteModal = () => (
        <Modal
            show={showDeleteModal}
            onHide={() => setShowDeleteModal(false)}
            centered
            aria-labelledby="delete-modal-title"
            backdropClassName="custom-modal-backdrop"
            dialogClassName="custom-archive-modal-dialog"
        >
            <div style={{ position: 'relative' }}>
                <Modal.Header
                    closeButton={false}
                    style={{ borderBottom: 'none', borderTopLeftRadius: 16, borderTopRightRadius: 16, background: '#ef4444', color: '#fff', padding: '1.5rem 2rem' }}
                >
                    <Modal.Title id="delete-modal-title" style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: 0.5 }}>
                        <FaTrash className="me-2" /> Delete User
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '2rem', fontSize: '1.1rem', borderRadius: 16, background: 'transparent', color: '#334155', fontWeight: 500 }}>
                    <Alert variant="warning" className="mb-4 d-flex align-items-center" style={{ fontSize: '1rem' }}>
                        <FaExclamationTriangle className="me-2" size={22} />
                        Are you sure you want to delete this user? This action cannot be undone.
                    </Alert>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: 'none', padding: '1.5rem 2rem', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, background: '#f8fafc' }}>
                    <Button
                        variant="secondary"
                        onClick={() => setShowDeleteModal(false)}
                        style={{ minWidth: 110, fontWeight: 600, borderRadius: 8, marginRight: 8 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={confirmDelete}
                        style={{ minWidth: 110, fontWeight: 600, borderRadius: 8, boxShadow: '0 2px 8px rgba(239,68,68,0.15)', background: '#ef4444', border: 'none' }}
                        aria-label="Confirm delete"
                    >
                        Delete
                    </Button>
                </Modal.Footer>
            </div>
        </Modal>
    );

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
                                                            <th style={{ width: '15%', minWidth: '120px' }}>Teacher</th>
                                                            <th style={{ width: '20%', minWidth: '180px' }}>Name</th>
                                                            <th style={{ width: '25%', minWidth: '200px' }}>Email</th>
                                                            <th style={{ width: '15%', minWidth: '150px' }}>Department</th>
                                                            <th style={{ width: '15%', minWidth: '150px' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentTeachers.map(teacher => (
                                                            <tr key={teacher._id}>
                                                                <td>{teacher.teacher_id || teacher.admin_id || 'Not set'}</td>
                                                                <td>
                                                                    <div className="text-truncate" style={{ maxWidth: '180px' }}>{teacher.name}</div>
                                                                </td>
                                                                <td>
                                                                    <div className="text-truncate" style={{ maxWidth: '200px' }}>{teacher.email}</div>
                                                                </td>
                                                                <td>
                                                                    <div className="text-truncate" style={{ maxWidth: '150px' }}>{teacher.department || 'Not set'}</div>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex gap-2">
                                                                        <Button variant="outline-primary" size="sm" className="d-inline-flex align-items-center justify-content-center" onClick={() => handleView(teacher)} style={{ width: '32px', height: '32px', padding: 0, borderRadius: '4px' }} title="View Details">
                                                                            <FaEye size={14} />
                                                                        </Button>
                                                                        <Button variant="outline-warning" size="sm" className="d-inline-flex align-items-center justify-content-center" onClick={() => handleEdit(teacher)} style={{ width: '32px', height: '32px', padding: 0, borderRadius: '4px' }} title="Edit User">
                                                                            <FaEdit size={14} />
                                                                        </Button>
                                                                        <Button variant="outline-danger" size="sm" className="d-inline-flex align-items-center justify-content-center" onClick={() => handleDelete(teacher._id)} style={{ width: '32px', height: '32px', padding: 0, borderRadius: '4px' }} title="Delete User">
                                                                            <FaTrash size={14} />
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                                {currentTeachers.length === 0 && (
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
                    {renderDeleteModal()}

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
                                            <div className="mb-3 text-center">
                                                <img src={selectedUser.image || 'https://via.placeholder.com/150'} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="text-muted small mb-1">Full Name</label>
                                                <p className="mb-0 fw-bold">{selectedUser.name}</p>
                                            </div>
                                            <div className="mb-3">
                                                <label className="text-muted small mb-1">Email</label>
                                                <p className="mb-0 fw-bold">{selectedUser.email}</p>
                                            </div>
                                            <div className="mb-3">
                                                <label className="text-muted small mb-1">Teacher ID</label>
                                                <p className="mb-0 fw-bold">{selectedUser.teacher_id}</p>
                                            </div>
                                            <div className="mb-3">
                                                <label className="text-muted small mb-1">Department</label>
                                                <p className="mb-0 fw-bold">{selectedUser.department}</p>
                                            </div>
                                            <div className="mb-3">
                                                <label className="text-muted small mb-1">Contact Number</label>
                                                <p className="mb-0 fw-bold">{selectedUser.contact_number}</p>
                                            </div>
                                            <div className="mb-3">
                                                <label className="text-muted small mb-1">Location</label>
                                                <p className="mb-0 fw-bold">{selectedUser.location || 'Not set'}</p>
                                            </div>
                                          
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="text-muted small mb-1">Birthday</label>
                                                <p className="mb-0 fw-bold">{selectedUser.birthday ? new Date(selectedUser.birthday).toLocaleDateString() : 'Not set'}</p>
                                            </div>
                                            <div className="mb-3">
                                                <label className="text-muted small mb-1">Gender</label>
                                                <p className="mb-0 fw-bold text-capitalize">{selectedUser.gender || 'Not set'}</p>
                                            </div>
                                            <div className="mb-3">
                                                <label className="text-muted small mb-1">Status</label>
                                                <p className="mb-0 fw-bold">{selectedUser.status || 'Not set'}</p>
                                            </div>
                                            <div className="mb-3">
                                                <label className="text-muted small mb-1">Profile Complete</label>
                                                <p className="mb-0 fw-bold">{selectedUser.isProfileComplete ? 'Yes' : 'No'}</p>
                                            </div>
                                            <div className="mb-3">
                                                <label className="text-muted small mb-1">Role</label>
                                                <p className="mb-0 fw-bold text-capitalize">{selectedUser.role || 'teacher'}</p>
                                            </div>
                                            <div className="mb-3">
                                                <label className="text-muted small mb-1">Created At</label>
                                                <p className="mb-0 fw-bold">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'Not set'}</p>
                                            </div>
                                            <div className="mb-3">
                                                <label className="text-muted small mb-1">Last Updated</label>
                                                <p className="mb-0 fw-bold">{selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : 'Not set'}</p>
                                            </div>
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
                                    <TeacherProfileForm
                                        formData={editingUser}
                                        setFormData={setEditingUser}
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleUpdate(editingUser._id, editingUser.type, editingUser);
                                        }}
                                        onCancel={() => setIsEditing(false)}
                                        missingFields={[]}
                                        isEdit={true}
                                        disabledFields={['email', 'status']}
                                    />
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

                    {/* Edit Success Modal */}
                    {showEditSuccessModal && (
                        <div style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            zIndex: 3000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0,0,0,0.08)'
                        }}>
                            <div style={{
                                background: '#e6f9ed',
                                border: '1.5px solid #22c55e',
                                borderRadius: 14,
                                boxShadow: '0 4px 24px rgba(34,197,94,0.10)',
                                padding: '2rem 2.5rem',
                                minWidth: 320,
                                maxWidth: '90vw',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 12
                            }}>
                                <FaCheckCircle className="text-success" size={48} />
                                <div style={{ fontWeight: 700, fontSize: 18, color: '#15803d', marginBottom: 4 }}>{editSuccessTitle}</div>
                                <div style={{ fontSize: 16, color: '#166534' }}>{editSuccessMessage}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagement2;
