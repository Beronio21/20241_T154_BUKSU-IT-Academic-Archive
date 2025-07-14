import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, InputGroup, Form, Pagination, Button, Modal, Nav, Alert } from 'react-bootstrap';
import { FaSearch, FaChevronDown } from 'react-icons/fa';

const ITEMS_PER_PAGE = 5;

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('pending');
  // Modal state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedApproveTeacher, setSelectedApproveTeacher] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectTeacher, setSelectedRejectTeacher] = useState(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedRemoveTeacher, setSelectedRemoveTeacher] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  // Remove the Form.Select dropdown and replace with a text-only dropdown beside the search input
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on search or tab change
  }, [searchTerm, activeTab]);

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

  // Filtered teachers by tab and search
  const filteredTeachers = teachers.filter(t =>
    (activeTab === 'pending' ? t.status === 'Pending' : t.status === 'Approved') &&
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.email.toLowerCase().includes(searchTerm.toLowerCase()))
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

  // Approve
  const handleApproveClick = (teacher) => {
    setSelectedApproveTeacher(teacher);
    setShowApproveModal(true);
  };
  const handleApproveConfirm = async () => {
    if (!selectedApproveTeacher) return;
    setIsApproving(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      };
      await axios.put(`http://localhost:8080/api/teachers/${selectedApproveTeacher._id}`, { status: 'Approved' }, config);
      setShowApproveModal(false);
      setSelectedApproveTeacher(null);
      fetchTeachers();
    } catch (err) {
      setError('Failed to approve teacher.');
    } finally {
      setIsApproving(false);
    }
  };
  const handleApproveCancel = () => {
    setShowApproveModal(false);
    setSelectedApproveTeacher(null);
  };

  // Reject
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
      fetchTeachers();
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

  // Remove
  const handleRemoveClick = (teacher) => {
    setSelectedRemoveTeacher(teacher);
    setShowRemoveModal(true);
  };
  const handleRemoveConfirm = async () => {
    if (!selectedRemoveTeacher) return;
    setIsRemoving(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      };
      await axios.delete(`http://localhost:8080/api/teachers/${selectedRemoveTeacher._id}`, config);
      setShowRemoveModal(false);
      setSelectedRemoveTeacher(null);
      fetchTeachers();
    } catch (err) {
      setError('Failed to remove teacher.');
    } finally {
      setIsRemoving(false);
    }
  };
  const handleRemoveCancel = () => {
    setShowRemoveModal(false);
    setSelectedRemoveTeacher(null);
  };

  // Table columns
  const columns = [
    { label: 'Name', key: 'name', style: { width: '22%', minWidth: 160, textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', padding: '8px 12px', fontSize: '0.97em' } },
    { label: 'Email', key: 'email', style: { width: '24%', minWidth: 180, textAlign: 'left', padding: '8px 12px', fontSize: '0.97em' } },
    { label: 'Status', key: 'status', style: { width: '12%', minWidth: 100, textAlign: 'center', padding: '8px 12px', fontSize: '0.97em' } },
    { label: activeTab === 'pending' ? 'Registration Date' : 'Date Approved', key: 'date', style: { width: '18%', minWidth: 120, textAlign: 'center', padding: '8px 12px', fontSize: '0.97em' } },
    { label: 'Actions', key: 'actions', style: { width: '24%', minWidth: 180, textAlign: 'center', padding: '8px 12px', fontSize: '0.97em' } },
  ];

  return (
    <div className="container-fluid" style={{ minWidth: '1200px', padding: '15px' }}>
      <div className="card shadow h-100">
        <div className="card-header bg-primary text-white py-3" style={{ minHeight: '70px' }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h3 className="mb-0">Teacher Management</h3>
            <div className="d-flex align-items-center justify-content-end flex-wrap gap-2" style={{ flex: 1, marginLeft: '24px' }}>
              <div className="search-dropdown-group d-flex align-items-center" style={{ gap: '0.25rem', flex: 1, minWidth: 220, maxWidth: 500 }}>
                <div className="search-container flex-grow-1" style={{ minWidth: '160px', maxWidth: '340px' }}>
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
                <div className="custom-status-dropdown position-relative ms-1" style={{ minWidth: 0, textAlign: 'right', height: 44, display: 'flex', alignItems: 'center' }}>
                  <span
                    className={`dropdown-toggle-text${dropdownOpen ? ' open' : ''}`}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{ fontWeight: 600, fontSize: '15px', color: '#fff', cursor: 'pointer', userSelect: 'none', padding: '0 10px', height: 44, display: 'inline-flex', alignItems: 'center', border: 'none', background: 'none', verticalAlign: 'middle' }}
                    tabIndex={0}
                    role="button"
                    aria-label="Filter by Status"
                  >
                    {activeTab === 'pending' ? 'Pending Teachers' : 'Approved Teachers'}
                    <span style={{ fontSize: '1.1em', marginLeft: 6, display: 'inline-block', color: '#fff', transition: 'transform 0.18s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}>
                      <FaChevronDown />
                    </span>
                  </span>
                  {dropdownOpen && (
                    <div className="dropdown-menu-status position-absolute end-0 mt-2" style={{ minWidth: 180, zIndex: 10, background: '#222', borderRadius: 8, boxShadow: '0 4px 16px rgba(30,41,59,0.10)', border: 'none', padding: '0.5rem 0' }}>
                      <div
                        className={`dropdown-item-status${activeTab === 'pending' ? ' active' : ''}`}
                        onClick={() => { setActiveTab('pending'); setDropdownOpen(false); }}
                        style={{ fontWeight: 500, fontSize: '1.04rem', color: activeTab === 'pending' ? '#60a5fa' : '#fff', padding: '8px 18px', cursor: 'pointer', background: 'none', border: 'none' }}
                      >
                        Pending Teachers
                      </div>
                      <div
                        className={`dropdown-item-status${activeTab === 'approved' ? ' active' : ''}`}
                        onClick={() => { setActiveTab('approved'); setDropdownOpen(false); }}
                        style={{ fontWeight: 500, fontSize: '1.04rem', color: activeTab === 'approved' ? '#60a5fa' : '#fff', padding: '8px 18px', cursor: 'pointer', background: 'none', border: 'none' }}
                      >
                        Approved Teachers
                      </div>
                    </div>
                  )}
                </div>
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
              <div className="table-section-label mb-2 mt-1">
                <span className="section-label-text">
                  {activeTab === 'pending' ? 'Pending Teachers' : 'Approved Teachers'}
                </span>
              </div>
              <div className="table-responsive" style={{ maxWidth: '100%', minWidth: 0, overflowX: 'auto', margin: '0 auto' }}>
                <Table striped bordered hover className="mt-3 mb-0 text-sm" style={{ minWidth: 900, width: '100%' }}>
                  <thead className="table-dark position-sticky top-0 text-sm" style={{ zIndex: 1 }}>
                    <tr>
                      {columns.map(col => (
                        <th key={col.key} style={col.style}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentTeachers.length === 0 ? (
                      <tr><td colSpan={columns.length} className="text-center">No teachers found.</td></tr>
                    ) : (
                      currentTeachers.map(teacher => (
                        <tr key={teacher._id}>
                          <td style={columns[0].style}>{teacher.name}</td>
                          <td style={columns[1].style}>{teacher.email}</td>
                          <td style={columns[2].style}>
                            <span className={`badge ${teacher.status === 'Approved' ? 'bg-success text-white' : teacher.status === 'Pending' ? 'bg-warning text-dark' : 'bg-danger text-white'}`} style={{ fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '6px 16px' }}>{teacher.status}</span>
                          </td>
                          <td style={columns[3].style}>{teacher[activeTab === 'pending' ? 'createdAt' : 'updatedAt'] ? new Date(teacher[activeTab === 'pending' ? 'createdAt' : 'updatedAt']).toLocaleDateString() : ''}</td>
                          <td style={columns[4].style}>
                            <div className="d-flex align-items-center justify-content-center gap-1 flex-wrap">
                              {activeTab === 'pending' && (
                                <>
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
                                </>
                              )}
                              <Button
                                variant={activeTab === 'pending' ? 'outline-dark' : 'danger'}
                                size="sm"
                                className="px-2 py-1 text-sm fw-semibold"
                                onClick={() => handleRemoveClick(teacher)}
                                style={{ minWidth: 60 }}
                                title="Remove Teacher"
                              >
                                Remove
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
      {/* Approve Modal */}
      {showApproveModal && selectedApproveTeacher && (
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
              Are you sure you want to approve this teacher?
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
      {/* Reject Modal */}
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
                Are you sure you want to reject this teacher?
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
      {/* Remove Modal */}
      {showRemoveModal && selectedRemoveTeacher && (
        <Modal
          show={showRemoveModal}
          onHide={handleRemoveCancel}
          centered
          backdropClassName="custom-modal-backdrop"
          dialogClassName="custom-archive-modal-dialog"
        >
          <div style={{ position: 'relative' }}>
            <Modal.Header
              closeButton={false}
              style={{ borderBottom: 'none', borderTopLeftRadius: 16, borderTopRightRadius: 16, background: '#111827', color: '#fff', padding: '1.5rem 2rem' }}
            >
              <Modal.Title style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: 0.5 }}>
                Remove Teacher
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: '2rem', fontSize: '1.1rem', borderRadius: 16, background: 'transparent', color: '#334155', fontWeight: 500 }}>
              Are you sure you want to permanently remove this teacher?
            </Modal.Body>
            <Modal.Footer style={{ borderTop: 'none', padding: '1.5rem 2rem', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, background: '#f8fafc' }}>
              <Button
                variant="secondary"
                onClick={handleRemoveCancel}
                style={{ minWidth: 110, fontWeight: 600, borderRadius: 8, marginRight: 8 }}
              >
                Cancel
              </Button>
              <Button
                variant="dark"
                onClick={handleRemoveConfirm}
                disabled={isRemoving}
                style={{ minWidth: 110, fontWeight: 600, borderRadius: 8, boxShadow: '0 2px 8px rgba(17,24,39,0.15)', background: '#111827', border: 'none' }}
                aria-label="Confirm remove"
              >
                {isRemoving ? 'Removing...' : 'Confirm'}
              </Button>
            </Modal.Footer>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TeacherManagement; 