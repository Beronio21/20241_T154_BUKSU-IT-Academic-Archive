import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const data = localStorage.getItem('user-info');
        if (!data) {
            navigate('/login');
            return;
        }
        const userData = JSON.parse(data);
        if (userData?.role !== 'admin') {
            navigate('/login');
            return;
        }
        setUserInfo(userData);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user-info');
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <h2>Admin Panel</h2>
                <ul>
                    <li>Dashboard</li>
                    <li>User Management</li>
                    <li>Student Records</li>
                    <li>Teacher Records</li>
                    <li>Defense Schedule</li>
                    <li>System Settings</li>
                    <li>Reports</li>
                    <li onClick={handleLogout}>Log Out</li>
                </ul>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="header">
                    <div className="user-info">
                        <h1>Welcome, {userInfo?.name}</h1>
                        <p>Administrator</p>
                    </div>
                    <img className="profile-picture" src={userInfo?.image} alt={userInfo?.name} />
                </header>

                {/* Status Overview */}
                <section className="status-cards">
                    <div className="status-card">
                        <h3>Total Students</h3>
                        <p className="count">150</p>
                    </div>
                    <div className="status-card">
                        <h3>Total Teachers</h3>
                        <p className="count">25</p>
                    </div>
                    <div className="status-card">
                        <h3>Active Theses</h3>
                        <p className="count">45</p>
                    </div>
                    <div className="status-card">
                        <h3>Upcoming Defenses</h3>
                        <p className="count">8</p>
                    </div>
                </section>

                {/* Recent Activities */}
                <section className="activities-section">
                    <h2>Recent Activities</h2>
                    <table className="activities-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>User</th>
                                <th>Activity</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>2024-02-20</td>
                                <td>John Doe</td>
                                <td>New Student Registration</td>
                                <td><span className="status-pending">Pending Approval</span></td>
                                <td>
                                    <button className="btn-view">View</button>
                                    <button className="btn-approve">Approve</button>
                                </td>
                            </tr>
                            <tr>
                                <td>2024-02-19</td>
                                <td>Dr. Smith</td>
                                <td>Defense Schedule Update</td>
                                <td><span className="status-approved">Completed</span></td>
                                <td>
                                    <button className="btn-view">View</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* System Statistics */}
                <section className="statistics-section">
                    <h2>System Statistics</h2>
                    <div className="statistics-grid">
                        <div className="stat-card">
                            <h3>Thesis Submissions</h3>
                            <div className="stat-content">
                                <div className="stat-item">
                                    <span>Today</span>
                                    <p>12</p>
                                </div>
                                <div className="stat-item">
                                    <span>This Week</span>
                                    <p>45</p>
                                </div>
                                <div className="stat-item">
                                    <span>This Month</span>
                                    <p>156</p>
                                </div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <h3>User Activity</h3>
                            <div className="stat-content">
                                <div className="stat-item">
                                    <span>Active Users</span>
                                    <p>85</p>
                                </div>
                                <div className="stat-item">
                                    <span>New Users</span>
                                    <p>15</p>
                                </div>
                                <div className="stat-item">
                                    <span>Total Logins</span>
                                    <p>324</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminDashboard; 