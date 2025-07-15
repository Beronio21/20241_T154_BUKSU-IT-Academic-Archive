import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, InputGroup, Form, Pagination, Button, Modal, Alert } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaExclamationTriangle, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminNavbar from '../Navbar/Admin-Navbar/AdminNavbar';

const TeacherManagement2 = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [isApproving, setIsApproving] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const activeSection = location.pathname.split('/').pop();

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        setError(null);
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            const res = await axios.get('http://localhost:8080/api/teachers', config);
            setTeachers(res.data);
        } catch (err) {
            setError('Failed to fetch teachers.');
        } finally {
            setLoading(false);
        }
    };

    const filteredTeachers = teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTeachers = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredTeachers.length / itemsPerPage) || 1);
    }, [filteredTeachers]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleApproveClick = (teacher) => {
        setSelectedTeacher(teacher);
        setShowApproveModal(true);
    };

    const handleApproveConfirm = async () => {
        if (!selectedTeacher) return;
        setIsApproving(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.put(`http://localhost:8080/api/teachers/${selectedTeacher._id}`, { status: 'Approved' }, config);
            setShowApproveModal(false);
            setSelectedTeacher(null);
            fetchTeachers();
        } catch (err) {
            setError('Failed to approve teacher.');
        } finally {
            setIsApproving(false);
        }
    };

    const handleRemoveClick = (teacher) => {
        setSelectedTeacher(teacher);
        setShowRemoveModal(true);
    };

    const handleRemoveConfirm = async () => {
        if (!selectedTeacher) return;
        setIsRemoving(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.delete(`http://localhost:8080/api/teachers/${selectedTeacher._id}`, config);
            setShowRemoveModal(false);
            setSelectedTeacher(null);
            fetchTeachers();
        } catch (err) {
            setError('Failed to remove teacher.');
        } finally {
            setIsRemoving(false);
        }
    };

    const handleRejectClick = (teacher) => {
        setSelectedTeacher(teacher);
        setShowRejectModal(true);
    };

    const handleRejectConfirm = async () => {
        if (!selectedTeacher) return;
        setIsRejecting(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.put(`http://localhost:8080/api/teachers/${selectedTeacher._id}`, { status: 'Rejected' }, config);
            setShowRejectModal(false);
            setSelectedTeacher(null);
            fetchTeachers();
        } catch (err) {
            setError('Failed to reject teacher.');
        } finally {
            setIsRejecting(false);
        }
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

    return (
        <div className="d-flex">
            <AdminNavbar 
                activeSection={activeSection} 
                handleSectionChange={(section) => navigate(`/admin-dashboard/${section}`)} 
            />
            
            <div className="flex-grow-1" style={{ marginLeft: '250px' }}>
                <div className="container-fluid" style={{ minWidth: '1200px', minHeight: '100vh', padding: '15px', overflow: 'hidden' }}>
                    <div className="row h-100">
                        <div className="col-12 h-100">
                            <div className="card shadow h-100">
                                <div className="card-header bg-primary text-white py-3" style={{ minHeight: '70px' }}>
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                        <h3 className="mb-0">Teacher Approval</h3>
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
                                                        placeholder="Search teachers..."
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
                                <div className="card-body p-3" style={{ height: 'calc(100% - 60px)', display: 'flex', flexDirection: 'column' }}>
                                    {error && <div className="alert alert-danger">{error}</div>}
                                    {loading ? (
                                        <div>Loading teachers...</div>
                                    ) : (
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 250px)', minHeight: 'calc(100vh - 250px)', overflow: 'auto' }}>
                                                <Table striped bordered hover className="mt-3 mb-0 text-sm" style={{ minWidth: 900, width: '100%' }}>
                                                    <thead className="table-dark position-sticky top-0 text-sm" style={{ zIndex: 1 }}>
                                                        <tr>
                                                            <th style={{ width: '22%', minWidth: 160, textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', padding: '8px 12px', fontSize: '0.97em' }}>Name</th>
                                                            <th style={{ width: '24%', minWidth: 180, textAlign: 'left', padding: '8px 12px', fontSize: '0.97em' }}>Email</th>
                                                            <th style={{ width: '12%', minWidth: 100, textAlign: 'center', padding: '8px 12px', fontSize: '0.97em' }}>Status</th>
                                                            <th style={{ width: '18%', minWidth: 120, textAlign: 'center', padding: '8px 12px', fontSize: '0.97em' }}>Registered Date</th>
                                                            <th style={{ width: '24%', minWidth: 180, textAlign: 'center', padding: '8px 12px', fontSize: '0.97em' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentTeachers.length === 0 ? (
                                                            <tr><td colSpan={5} className="text-center">No teachers found.</td></tr>
                                                        ) : (
                                                            currentTeachers.map(teacher => (
                                                                <tr key={teacher._id} style={{ height: 56 }}>
                                                                    <td style={{ verticalAlign: 'middle', whiteSpace: 'normal', wordBreak: 'break-word', padding: '8px 12px' }}>{teacher.name}</td>
                                                                    <td style={{ verticalAlign: 'middle', padding: '8px 12px' }}>{teacher.email}</td>
                                                                    <td style={{ verticalAlign: 'middle', textAlign: 'center', padding: '8px 12px' }}>
                                                                        <span className={`badge ${teacher.status === 'Approved' ? 'bg-success' : 'bg-warning'}`}>
                                                                            {teacher.status}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ verticalAlign: 'middle', textAlign: 'center', padding: '8px 12px' }}>
                                                                        {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : ''}
                                                                    </td>
                                                                    <td style={{ verticalAlign: 'middle', textAlign: 'center', padding: '8px 12px' }}>
                                                                        <div className="d-flex align-items-center justify-content-center gap-2 flex-nowrap">
                                                                            {teacher.status === 'Pending' && (
                                                                                <>
                                                                                    <Button
                                                                                        variant="success"
                                                                                        size="sm"
                                                                                        className="px-3 py-1 text-sm fw-semibold"
                                                                                        style={{ minWidth: 80, fontWeight: 600, borderRadius: 6, fontSize: 14, transition: 'background 0.18s, color 0.18s', boxShadow: 'none' }}
                                                                                        onClick={() => handleApproveClick(teacher)}
                                                                                        onMouseOver={e => { e.currentTarget.style.background = '#16a34a'; }}
                                                                                        onMouseOut={e => { e.currentTarget.style.background = ''; }}
                                                                                        title="Approve Teacher"
                                                                                    >
                                                                                        Approve
                                                                                    </Button>
                                                                                    <Button
                                                                                        variant="outline-danger"
                                                                                        size="sm"
                                                                                        className="px-3 py-1 text-sm fw-semibold"
                                                                                        style={{ minWidth: 80, fontWeight: 600, borderRadius: 6, fontSize: 14, color: '#ef4444', borderColor: '#ef4444', background: 'transparent', transition: 'background 0.18s, color 0.18s', boxShadow: 'none' }}
                                                                                        onClick={() => handleRejectClick(teacher)}
                                                                                        onMouseOver={e => { e.currentTarget.style.background = '#fee2e2'; }}
                                                                                        onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                                                                                        title="Reject Teacher"
                                                                                    >
                                                                                        Reject
                                                                                    </Button>
                                                                                </>
                                                                            )}
                                                                            {teacher.status === 'Approved' && (
                                                                                <Button
                                                                                    variant="outline-danger"
                                                                                    size="sm"
                                                                                    className="px-3 py-1 text-sm fw-semibold"
                                                                                    style={{ minWidth: 80, fontWeight: 600, borderRadius: 6, fontSize: 14, color: '#ef4444', borderColor: '#ef4444', background: 'transparent', transition: 'background 0.18s, color 0.18s', boxShadow: 'none' }}
                                                                                    onClick={() => handleRemoveClick(teacher)}
                                                                                    onMouseOver={e => { e.currentTarget.style.background = '#fee2e2'; }}
                                                                                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                                                                                    title="Remove Teacher"
                                                                                >
                                                                                    Remove
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </Table>
                                            </div>
                                            <div className="mt-2" style={{ minHeight: '40px' }}>
                                                {renderPagination()}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Approve Modal */}
                                <Modal
                                  show={showApproveModal && selectedTeacher}
                                  onHide={() => setShowApproveModal(false)}
                                  centered
                                  backdropClassName="custom-modal-backdrop"
                                  dialogClassName="custom-archive-modal-dialog"
                                >
                                  <div style={{ position: 'relative' }}>
                                    <Modal.Header
                                      closeButton={false}
                                      style={{ borderBottom: 'none', borderTopLeftRadius: 16, borderTopRightRadius: 16, background: '#2563eb', color: '#fff', padding: '1.5rem 2rem' }}
                                    >
                                      <Modal.Title style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: 0.5 }}>
                                        Confirm Approval
                                      </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body style={{ padding: '2rem', fontSize: '1.1rem', borderRadius: 16, background: 'transparent', color: '#334155', fontWeight: 500 }}>
                                      Are you sure you want to approve this teacher?
                                    </Modal.Body>
                                    <Modal.Footer style={{ borderTop: 'none', padding: '1.5rem 2rem', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, background: '#f8fafc' }}>
                                      <Button
                                        variant="secondary"
                                        onClick={() => setShowApproveModal(false)}
                                        style={{ minWidth: 110, fontWeight: 600, borderRadius: 8, marginRight: 8 }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        variant="primary"
                                        onClick={handleApproveConfirm}
                                        disabled={isApproving}
                                        style={{ minWidth: 110, fontWeight: 600, borderRadius: 8, boxShadow: '0 2px 8px rgba(37,99,235,0.15)', background: '#2563eb', border: 'none' }}
                                        aria-label="Confirm approve"
                                      >
                                        {isApproving ? 'Approving...' : 'Confirm'}
                                      </Button>
                                    </Modal.Footer>
                                  </div>
                                </Modal>

                                {/* Remove Modal for Approved Teachers */}
                                <Modal
                                  show={showRemoveModal && selectedTeacher && selectedTeacher.status === 'Approved'}
                                  onHide={() => setShowRemoveModal(false)}
                                  centered
                                  backdropClassName="custom-modal-backdrop"
                                  dialogClassName="custom-archive-modal-dialog"
                                >
                                  <div style={{ position: 'relative' }}>
                                    <Modal.Header
                                      closeButton={false}
                                      style={{ borderBottom: 'none', borderTopLeftRadius: 16, borderTopRightRadius: 16, background: '#ef4444', color: '#fff', padding: '1.5rem 2rem' }}
                                    >
                                      <Modal.Title style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: 0.5 }}>
                                        Remove Teacher
                                      </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body style={{ padding: '2rem', fontSize: '1.1rem', borderRadius: 16, background: 'transparent', color: '#334155', fontWeight: 500 }}>
                                      Are you sure you want to remove this teacher from the system?
                                    </Modal.Body>
                                    <Modal.Footer style={{ borderTop: 'none', padding: '1.5rem 2rem', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, background: '#f8fafc' }}>
                                      <Button
                                        variant="secondary"
                                        onClick={() => setShowRemoveModal(false)}
                                        style={{ minWidth: 110, fontWeight: 600, borderRadius: 8, marginRight: 8 }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        variant="danger"
                                        onClick={handleRemoveConfirm}
                                        disabled={isRemoving}
                                        style={{ minWidth: 110, fontWeight: 600, borderRadius: 8, boxShadow: '0 2px 8px rgba(239,68,68,0.15)', background: '#ef4444', border: 'none' }}
                                        aria-label="Confirm remove"
                                      >
                                        {isRemoving ? 'Removing...' : 'Remove'}
                                      </Button>
                                    </Modal.Footer>
                                  </div>
                                </Modal>

                                {/* Reject Modal for Pending Teachers */}
                                <Modal
                                  show={showRejectModal && selectedTeacher && selectedTeacher.status === 'Pending'}
                                  onHide={() => setShowRejectModal(false)}
                                  centered
                                  backdropClassName="custom-modal-backdrop"
                                  dialogClassName="custom-archive-modal-dialog"
                                >
                                  <div style={{ position: 'relative' }}>
                                    <Modal.Header
                                      closeButton={false}
                                      style={{ borderBottom: 'none', borderTopLeftRadius: 16, borderTopRightRadius: 16, background: '#ef4444', color: '#fff', padding: '1.5rem 2rem' }}
                                    >
                                      <Modal.Title style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: 0.5 }}>
                                        Reject Teacher
                                      </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body style={{ padding: '2rem', fontSize: '1.1rem', borderRadius: 16, background: 'transparent', color: '#334155', fontWeight: 500 }}>
                                      Are you sure you want to reject this teacher's registration?
                                    </Modal.Body>
                                    <Modal.Footer style={{ borderTop: 'none', padding: '1.5rem 2rem', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, background: '#f8fafc' }}>
                                      <Button
                                        variant="secondary"
                                        onClick={() => setShowRejectModal(false)}
                                        style={{ minWidth: 110, fontWeight: 600, borderRadius: 8, marginRight: 8 }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        variant="danger"
                                        onClick={handleRejectConfirm}
                                        disabled={isRejecting}
                                        style={{ minWidth: 110, fontWeight: 600, borderRadius: 8, boxShadow: '0 2px 8px rgba(239,68,68,0.15)', background: '#ef4444', border: 'none' }}
                                        aria-label="Confirm reject"
                                      >
                                        {isRejecting ? 'Rejecting...' : 'Reject'}
                                      </Button>
                                    </Modal.Footer>
                                  </div>
                                </Modal>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherManagement2;