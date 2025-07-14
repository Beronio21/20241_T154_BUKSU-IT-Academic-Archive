import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, InputGroup, Form, Pagination, Button, Modal, Alert } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

const ITEMS_PER_PAGE = 5;

const TeacherApproval = () => {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectTeacher, setSelectedRejectTeacher] = useState(null);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    fetchPendingTeachers();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm]);

  const fetchPendingTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      };
      const res = await axios.get('http://localhost:8080/api/teachers', config);
      const pending = res.data.filter(t => t.status === 'Pending');
      setPendingTeachers(pending);
    } catch (err) {
      setError('Failed to fetch pending teachers.');
    } finally {
      setLoading(false);
    }
  };

  // Search and pagination logic
  const filteredTeachers = pendingTeachers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentTeachers = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE) || 1);
  }, [filteredTeachers]);

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
      fetchPendingTeachers();
    } catch (err) {
      setError('Failed to approve teacher.');
    } finally {
      setIsApproving(false);
    }
  };
  const handleApproveCancel = () => {
    setShowApproveModal(false);
    setSelectedTeacher(null);
  };

  const handleRejectClick = (teacher) => {
    setSelectedRejectTeacher(teacher);
    setShowRejectModal(true);
  };
  const handleRejectConfirm = async () => {
    if (!selectedRejectTeacher) return;
    setIsRejecting(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      };
      await axios.delete(`http://localhost:8080/api/teachers/${selectedRejectTeacher._id}`, config);
      setShowRejectModal(false);
      setSelectedRejectTeacher(null);
      fetchPendingTeachers();
    } catch (err) {
      setError('Failed to reject teacher.');
    } finally {
      setIsRejecting(false);
    }
  };
  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setSelectedRejectTeacher(null);
  };

  return (
    <div className="container-fluid" style={{ minWidth: '1200px', padding: '15px' }}>
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
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
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
            <div>Loading...</div>
          ) : (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div className="table-responsive" style={{ maxWidth: '100%', minWidth: 0, overflowX: 'auto', margin: '0 auto' }}>
                <Table striped bordered hover className="mt-3 mb-0 text-sm" style={{ minWidth: 900, width: '100%' }}>
                  <thead className="table-dark position-sticky top-0 text-sm" style={{ zIndex: 1 }}>
                    <tr>
                      <th style={{ width: '22%', minWidth: 160, textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', padding: '8px 12px', fontSize: '0.97em' }}>Name</th>
                      <th style={{ width: '24%', minWidth: 180, textAlign: 'left', padding: '8px 12px', fontSize: '0.97em' }}>Email</th>
                      <th style={{ width: '12%', minWidth: 100, textAlign: 'center', padding: '8px 12px', fontSize: '0.97em' }}>Status</th>
                      <th style={{ width: '18%', minWidth: 120, textAlign: 'center', padding: '8px 12px', fontSize: '0.97em' }}>Registration Date</th>
                      <th style={{ width: '18%', minWidth: 120, textAlign: 'center', padding: '8px 12px', fontSize: '0.97em' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTeachers.length === 0 ? (
                      <tr><td colSpan="5" className="text-center">No pending teachers.</td></tr>
                    ) : (
                      currentTeachers.map(teacher => (
                        <tr key={teacher._id}>
                          <td style={{ verticalAlign: 'middle', whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: 220, textAlign: 'left', fontWeight: 500, color: '#222', padding: '8px 12px' }}>{teacher.name}</td>
                          <td style={{ verticalAlign: 'middle', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '8px 12px' }}>{teacher.email}</td>
                          <td style={{ verticalAlign: 'middle', textAlign: 'center', maxWidth: 100, minWidth: 100, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '8px 12px' }}>
                            <span className="badge bg-warning text-dark" style={{ fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '6px 16px' }}>{teacher.status}</span>
                          </td>
                          <td style={{ verticalAlign: 'middle', textAlign: 'center', maxWidth: 140, minWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '8px 12px' }}>{teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : ''}</td>
                          <td style={{ verticalAlign: 'middle', textAlign: 'center', maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '8px 12px' }}>
                            <div className="d-flex align-items-center justify-content-center gap-1 flex-wrap">
                              <Button
                                variant="success"
                                size="sm"
                                className="px-2 py-1 text-sm fw-semibold"
                                onClick={() => handleApproveClick(teacher)}
                                style={{ minWidth: 60 }}
                                title="Approve Teacher"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                className="px-2 py-1 text-sm fw-semibold"
                                onClick={() => handleRejectClick(teacher)}
                                style={{ minWidth: 60 }}
                                title="Reject Teacher"
                              >
                                Reject
                              </Button>
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
      </div>
      {/* Confirmation Modal for Approve */}
      {showApproveModal && selectedTeacher && (
        <Modal
          show={showApproveModal}
          onHide={handleApproveCancel}
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
                Approve Teacher
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: '2rem', fontSize: '1.1rem', borderRadius: 16, background: 'transparent', color: '#334155', fontWeight: 500 }}>
              Are you sure? You are about to approve this teacher.
            </Modal.Body>
            <Modal.Footer style={{ borderTop: 'none', padding: '1.5rem 2rem', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, background: '#f8fafc' }}>
              <Button
                variant="secondary"
                onClick={handleApproveCancel}
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
      )}
      {/* Confirmation Modal for Reject */}
      {showRejectModal && selectedRejectTeacher && (
        <Modal
          show={showRejectModal}
          onHide={handleRejectCancel}
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
              Are you sure? You are about to reject this teacher.
            </Modal.Body>
            <Modal.Footer style={{ borderTop: 'none', padding: '1.5rem 2rem', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, background: '#f8fafc' }}>
              <Button
                variant="secondary"
                onClick={handleRejectCancel}
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
                {isRejecting ? 'Rejecting...' : 'Confirm'}
              </Button>
            </Modal.Footer>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TeacherApproval; 