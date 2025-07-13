import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, InputGroup, Form, Pagination } from 'react-bootstrap';
import { FaSearch, FaEye } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminNavbar from '../Navbar/Admin-Navbar/AdminNavbar';
import AdminTopbar from '../Topbar/Admin-Topbar/AdminTopbar';
import '../Styles/StudentRecords.css';

const StudentRecords2 = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);   
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [userInfo, setUserInfo] = useState(null);

    const activeSection = location.pathname.split('/').pop();

    const handleSectionChange = (section) => {
        navigate(`/admin-dashboard/${section}`);
    };

    useEffect(() => {
        const storedUserInfo = localStorage.getItem('user-info');
        if (storedUserInfo) {
            setUserInfo(JSON.parse(storedUserInfo));
        }
        fetchStudentRecords();
    }, []);

    const fetchStudentRecords = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${userInfo?.token}`,
                    'Content-Type': 'application/json'
                }
            };

            const response = await axios.get('http://localhost:8080/api/students', config);
            // Sort students by createdAt in descending order (most recent first)
            const sortedStudents = response.data.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            setStudents(sortedStudents);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching student records:', error);
            setError('Failed to fetch student records');
            setLoading(false);
        }
    };

    const handleViewDetails = (student) => {
        setSelectedStudent(student);
    };

    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.student_id && student.student_id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

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
                    <span>Total Items: {filteredStudents.length}</span>
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
        console.log('Deleting student record:', selectedStudent._id);
        setShowDeleteModal(false);
        setSelectedStudent(null);
    };

    return (
        <div className="d-flex">
            <AdminNavbar 
                activeSection={activeSection} 
                handleSectionChange={handleSectionChange} 
            />
            <div className="flex-grow-1" style={{ marginLeft: '250px' }}>
                <AdminTopbar userInfo={userInfo} />
                <div style={{ paddingTop: '60px' }}>
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
                                        <h3 className="mb-0">Student Records</h3>
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
                                        {loading ? (
                                            <div className="loading">Loading student records...</div>
                                        ) : error ? (
                                            <div className="error">
                                                {error}
                                                <button onClick={fetchStudentRecords}>Retry</button>
                                            </div>
                                        ) : students.length === 0 ? (
                                            <div className="no-records">
                                                No student records found.
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
                                                                <th style={{ width: '100px' }}>Student ID</th>
                                                                <th style={{ width: '200px' }}>Name</th>
                                                                <th style={{ width: '200px' }}>Course</th>
                                                                <th style={{ width: '100px' }}>Year Level</th>
                                                                <th style={{ width: '150px' }}>Thesis Status</th>
                                                                <th style={{ width: '150px' }}>Academic Status</th>
                                                                <th style={{ width: '100px' }}>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentStudents.map(student => (
                                                                <tr key={student._id}>
                                                                    <td>{student.student_id}</td>
                                                                    <td>{student.name}</td>
                                                                    <td>{student.course}</td>
                                                                    <td>{student.year}</td>
                                                                    <td>
                                                                        <span className={`badge ${student.thesis_status?.toLowerCase() === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                                                                            {student.thesis_status || 'Not Started'}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <span className={`badge ${student.academic_status?.toLowerCase() === 'active' ? 'bg-success' : 'bg-danger'}`}>
                                                                            {student.academic_status || 'Active'}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <Button
                                                                            variant="info"
                                                                            size="sm"
                                                                            onClick={() => handleViewDetails(student)}
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
                        <div className={`custom-modal ${selectedStudent !== null ? 'show' : ''}`} onClick={() => setSelectedStudent(null)}>
                            <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="custom-modal-header bg-primary text-white">
                                    <h3>Student Details</h3>
                                    <button onClick={() => setSelectedStudent(null)} className="close-button">
                                        &times;
                                    </button>
                                </div>
                                <div className="custom-modal-body">
                                    {selectedStudent && (
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <h6 className="text-muted">Student ID</h6>
                                                    <p className="mb-0">{selectedStudent.student_id}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <h6 className="text-muted">Name</h6>
                                                    <p className="mb-0">{selectedStudent.name}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <h6 className="text-muted">Email</h6>
                                                    <p className="mb-0">{selectedStudent.email}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <h6 className="text-muted">Course</h6>
                                                    <p className="mb-0">{selectedStudent.course}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <h6 className="text-muted">Year Level</h6>
                                                    <p className="mb-0">{selectedStudent.year}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <h6 className="text-muted">Thesis Title</h6>
                                                    <p className="mb-0">{selectedStudent.thesis_title || 'Not yet assigned'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <h6 className="text-muted">Advisor</h6>
                                                    <p className="mb-0">{selectedStudent.advisor || 'Not yet assigned'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <h6 className="text-muted">Defense Schedule</h6>
                                                    <p className="mb-0">{selectedStudent.defense_schedule || 'Not yet scheduled'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="custom-modal-footer">
                                    <Button variant="secondary" onClick={() => setSelectedStudent(null)}>Close</Button>
                                </div>
                            </div>
                        </div>

                        {/* Delete Confirmation Modal */}
                        <div className={`custom-modal ${showDeleteModal ? 'show' : ''}`} onClick={() => setShowDeleteModal(false)}>
                            <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="custom-modal-header bg-danger text-white">
                                    <h3>Confirm Delete</h3>
                                    <button onClick={() => setShowDeleteModal(false)} className="close-button">
                                        &times;
                                    </button>
                                </div>
                                <div className="custom-modal-body">
                                    <p>Are you sure you want to delete this student record?</p>
                                    <p className="mb-0">This action cannot be undone.</p>
                                </div>
                                <div className="custom-modal-footer d-flex justify-content-between px-4">
                                    <div className="d-flex justify-content-start">
                                        <Button variant="secondary" onClick={() => {
                                            setShowDeleteModal(false);
                                            setSelectedStudent(null);
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
        </div>
    );
};

export default StudentRecords2;
