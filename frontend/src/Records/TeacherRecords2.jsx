import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Modal, Button, InputGroup, Form, Pagination } from 'react-bootstrap';
import { FaSearch, FaEye } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminNavbar from '../Navbar/Admin-Navbar/AdminNavbar';
import '../Styles/TeacherRecords.css';

const TeacherRecords2 = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const activeSection = location.pathname.split('/').pop();

    const handleSectionChange = (section) => {
        navigate(`/admin-dashboard/${section}`);
    };

    useEffect(() => {
        fetchTeacherRecords();
    }, []);

    const fetchTeacherRecords = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const config = {
                headers: {
                    'Authorization': `Bearer ${userInfo?.token}`,
                    'Content-Type': 'application/json'
                }
            };

            const response = await axios.get('http://localhost:8080/api/teachers', config);
            // Sort teachers by createdAt in descending order (most recent first)
            const sortedTeachers = response.data.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            setTeachers(sortedTeachers);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching teacher records:', error);
            setError('Failed to fetch teacher records');
            setLoading(false);
        }
    };

    const handleViewDetails = (teacher) => {
        setSelectedTeacher(teacher);
    };

    const filteredTeachers = teachers.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.teacher_id && teacher.teacher_id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTeachers = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

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

    const handleDelete = () => {
        // Implement the delete logic here
        console.log('Teacher record deleted');
        setShowDeleteModal(false);
        setSelectedTeacher(null);
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
                                        <h3 className="mb-0">Teacher Records</h3>
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
                                    {loading ? (
                                        <div className="loading">Loading teacher records...</div>
                                    ) : error ? (
                                        <div className="error">
                                            {error}
                                            <button onClick={fetchTeacherRecords}>Retry</button>
                                        </div>
                                    ) : teachers.length === 0 ? (
                                        <div className="no-records">
                                            No teacher records found.
                                        </div>
                                    ) : (
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div className="table-responsive" style={{ 
                                                maxHeight: 'calc(100vh - 250px)', 
                                                minHeight: 'calc(100vh - 250px)',
                                                minWidth: '1100px',
                                                overflow: 'auto'
                                            }}>
                                                <Table striped bordered hover className="mt-3 mb-0">
                                                    <thead className="table-dark position-sticky top-0" style={{ zIndex: 1 }}>
                                                        <tr>
                                                            <th style={{ width: '100px' }}>Teacher ID</th>
                                                            <th style={{ width: '200px' }}>Name</th>
                                                            <th style={{ width: '200px' }}>Department</th>
                                                            <th style={{ width: '150px' }}>Position</th>
                                                            <th style={{ width: '150px' }}>Status</th>
                                                            <th style={{ width: '100px' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentTeachers.map(teacher => (
                                                            <tr key={teacher._id}>
                                                                <td>{teacher.teacher_id}</td>
                                                                <td>{teacher.name}</td>
                                                                <td>{teacher.department}</td>
                                                                <td>{teacher.position}</td>
                                                                <td>
                                                                    <span className={`badge ${teacher.status?.toLowerCase() === 'active' ? 'bg-success' : 'bg-danger'}`}>
                                                                        {teacher.status || 'Active'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <Button
                                                                        variant="info"
                                                                        size="sm"
                                                                        onClick={() => handleViewDetails(teacher)}
                                                                    >
                                                                        <FaEye />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
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

                    {/* View Modal */}
                    <div className={`custom-modal ${selectedTeacher !== null ? 'show' : ''}`} onClick={() => setSelectedTeacher(null)}>
                        <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="custom-modal-header bg-primary text-white">
                                <h3>Teacher Details</h3>
                                <button 
                                    onClick={() => setSelectedTeacher(null)} 
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
                                {selectedTeacher && (
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <h6 className="text-muted">Teacher ID</h6>
                                                <p className="mb-0">{selectedTeacher.teacher_id}</p>
                                            </div>
                                            <div className="mb-3">
                                                <h6 className="text-muted">Name</h6>
                                                <p className="mb-0">{selectedTeacher.name}</p>
                                            </div>
                                            <div className="mb-3">
                                                <h6 className="text-muted">Email</h6>
                                                <p className="mb-0">{selectedTeacher.email}</p>
                                            </div>
                                            <div className="mb-3">
                                                <h6 className="text-muted">Department</h6>
                                                <p className="mb-0">{selectedTeacher.department}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <h6 className="text-muted">Position</h6>
                                                <p className="mb-0">{selectedTeacher.position}</p>
                                            </div>
                                            <div className="mb-3">
                                                <h6 className="text-muted">Specialization</h6>
                                                <p className="mb-0">{selectedTeacher.specialization || 'Not specified'}</p>
                                            </div>
                                            <div className="mb-3">
                                                <h6 className="text-muted">Advisory Load</h6>
                                                <p className="mb-0">{selectedTeacher.advisory_load || '0'}</p>
                                            </div>
                                            <div className="mb-3">
                                                <h6 className="text-muted">Status</h6>
                                                <p className="mb-0">
                                                    <span className={`badge ${selectedTeacher.status?.toLowerCase() === 'active' ? 'bg-success' : 'bg-danger'}`}>
                                                        {selectedTeacher.status || 'Active'}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="custom-modal-footer">
                                <Button variant="secondary" onClick={() => setSelectedTeacher(null)}>Close</Button>
                            </div>
                        </div>
                    </div>

                    {/* Delete Confirmation Modal */}
                    <div className={`custom-modal ${showDeleteModal ? 'show' : ''}`} onClick={() => setShowDeleteModal(false)}>
                        <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="custom-modal-header bg-danger text-white">
                                <h3>Confirm Delete</h3>
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
                                <p>Are you sure you want to delete this teacher record?</p>
                                <p className="mb-0">This action cannot be undone.</p>
                            </div>
                            <div className="custom-modal-footer d-flex justify-content-between px-4">
                                <div className="d-flex justify-content-start">
                                    <Button variant="secondary" onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedTeacher(null);
                                    }}>
                                        Cancel
                                    </Button>
                                </div>
                                <div className="d-flex justify-content-end">
                                    <Button variant="danger" onClick={handleDelete}>
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherRecords2;
