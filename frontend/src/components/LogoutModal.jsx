import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

const LogoutModal = ({ show, onHide, onConfirm }) => {
    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="sm"
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
                <h4 className="mb-2">Sign Out</h4>
                <p className="text-muted mb-4">
                    Are you sure you want to sign out?
                </p>
                <div className="d-flex justify-content-center gap-2">
                    <Button
                        variant="light"
                        onClick={onHide}
                        className="btn-cancel px-4"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={onConfirm}
                        className="btn-logout px-4 d-flex align-items-center justify-content-center gap-2"
                    >
                        <FaSignOutAlt size={16} />
                        Sign Out
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default LogoutModal; 