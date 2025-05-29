import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';
import './SuccessModal.css';

const SuccessModal = ({ show, onHide, title, message }) => {
    const handleClose = (e) => {
        e.preventDefault();
        if (onHide) {
            onHide();
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            size="sm"
            className="success-modal"
            backdrop="static"
            keyboard={false}
        >
            <Modal.Body className="text-center p-4">
                <div className="success-icon-wrapper mb-3">
                    <div className="success-icon-circle">
                        <FaCheckCircle size={48} className="text-success" />
                    </div>
                </div>
                <h4 className="mb-2">{title}</h4>
                <p className="text-muted mb-4">
                    {message}
                </p>
                <div className="d-flex justify-content-center">
                    <Button
                        variant="success"
                        onClick={handleClose}
                        className="btn-confirm px-4 d-flex align-items-center justify-content-center"
                        style={{ zIndex: 1050 }}
                    >
                        OK
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default SuccessModal; 