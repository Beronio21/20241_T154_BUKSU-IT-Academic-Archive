import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import axios from 'axios';
import LogoutModal from '../../components/LogoutModal';
import './TeacherTopbar.css';

const TeacherTopbar = ({ userInfo }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/notifications', {
                    params: { recipientEmail: userInfo.email },
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                
                const notifications = response.data.data || [];
                setNotifications(notifications);
                setUnreadCount(notifications.filter(n => !n.read).length);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [userInfo]);

    const markAsRead = async (id) => {
        try {
            await axios.patch(`http://localhost:8080/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setNotifications(notifications.map(n => 
                n._id === id ? {...n, read: true} : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/', { replace: true });
    };

    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const seconds = Math.floor((now - date) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 7) {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } else if (days > 0) {
            return `${days}d ago`;
        } else if (hours > 0) {
            return `${hours}h ago`;
        } else if (minutes > 0) {
            return `${minutes}m ago`;
        } else {
            return 'Just now';
        }
    };

    return (
        <nav className="navbar fixed-top navbar-expand-lg" style={{
            backgroundColor: 'transparent',
           
        }}>
            <div className="container-fluid">
                <div className="d-flex align-items-center ms-auto">
                    <div className="dropdown">
                        <button 
                            className="p-0 dropdown-toggle d-flex align-items-center"
                            type="button"
                            id="userDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            style={{ background: 'none', border: 'none', color: 'inherit' }}
                        >
                            <img
                                src={userInfo?.image || 'https://via.placeholder.com/32'}
                                alt="Profile"
                                className="rounded-circle me-2"
                                width="32"
                                height="32"
                            />
                            <span>{userInfo?.name || 'Teacher'}</span>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                            <li>
                                <button 
                                    className="dropdown-item" 
                                    onClick={() => navigate('/teacher-dashboard/profile')}
                                >
                                    <i className="bi bi-person me-2"></i>
                                    Profile
                                </button>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <button 
                                    className="dropdown-item text-danger" 
                                    onClick={() => setShowLogoutModal(true)}
                                >
                                    <i className="bi bi-box-arrow-right me-2"></i>
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Logout Modal */}
            <LogoutModal
                show={showLogoutModal}
                onHide={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
            />
        </nav>
    );
};

export default TeacherTopbar;
