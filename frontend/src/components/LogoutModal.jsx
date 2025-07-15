import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

const LogoutModal = ({ show, onHide, onConfirm }) => {
    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="md"
            className="logout-modal"
            backdrop="static"
            keyboard={false}
        >
            <Modal.Body className="text-center p-4">
                <div className="logout-icon-wrapper mb-3">
                    <div className="logout-icon-circle">
                        <FaUserCircle size={48} className="text-primary" />
                    </div>
                </div>
                <h4 className="mb-2" style={{ fontWeight: 700, letterSpacing: 0.2, fontSize: '1.13rem' }}>Sign Out</h4>
                <p className="text-muted mb-3" style={{ fontSize: '1.03rem' }}>
                    Are you sure you want to sign out?
                </p>
                <div className="d-flex justify-content-center gap-2 mt-3">
                    <Button
                        variant="light"
                        onClick={onHide}
                        className="btn-cancel px-3"
                        style={{ fontSize: '1.01rem' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={onConfirm}
                        className="btn-logout px-3 d-flex align-items-center gap-2 justify-content-center"
                        style={{ fontWeight: 600, fontSize: '1.01rem' }}
                    >
                        <FaSignOutAlt size={17} />
                        <span style={{ fontSize: '1.01rem', whiteSpace: 'nowrap' }}>Sign Out</span>
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default LogoutModal; 