import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutModal from '../../components/LogoutModal';
import './StudentTopbar.css';

const StudentTopbar = ({ userInfo, unreadCount, setShowNotifications, showNotifications, notifications, markAsRead }) => {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/', { replace: true });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const notificationStyles = {
        container: {
            position: 'relative',
            marginRight: '1rem',
            zIndex: 1031
        },
        dropdown: {
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: '-10px',
            width: '300px',
            backgroundColor: 'white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1031,
            border: '1px solid #ddd'
        },
        header: {
            padding: '10px',
            borderBottom: '1px solid #eee',
            backgroundColor: '#f8f9fa',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
        },
        list: {
            maxHeight: '350px',
            overflowY: 'auto',
            scrollbarWidth: 'thin'
        },
        item: (read) => ({
            padding: '12px',
            borderBottom: '1px solid #eee',
            backgroundColor: '#fff',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        }),
        timestamp: {
            fontSize: '0.8rem',
            color: '#666',
            marginTop: '4px'
        },
        emptyMessage: {
            padding: '20px',
            textAlign: 'center',
            color: '#666'
        },
        badge: {
            fontSize: '0.65rem'
        }
    };

    return (
        <nav className="navbar fixed-top navbar-expand-lg">
            <div className="container-fluid d-flex justify-content-between align-items-center">
                <div></div> {/* Left spacer for alignment */}
                <div className="d-flex align-items-center ms-auto">
                    <span
                        className="sign-in-link"
                        onClick={() => navigate('/login')}
                        tabIndex={0}
                        role="button"
                        style={{ cursor: 'pointer', fontSize: '1rem', fontWeight: 500, color: '#2c3e50', marginLeft: 16 }}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/login'); }}
                    >
                        Sign in
                    </span>
                </div>
            </div>
            {/* Logout Modal (kept for future use, but not shown) */}
            <LogoutModal
                show={showLogoutModal}
                onHide={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
            />
        </nav>
    );
};

export default StudentTopbar;
