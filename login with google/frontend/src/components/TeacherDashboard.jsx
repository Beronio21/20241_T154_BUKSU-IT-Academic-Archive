import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherDashboard.css';  // We'll use the same CSS file

const TeacherDashboard = () => {
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const data = localStorage.getItem('user-info');
        if (!data) {
            navigate('/login');
            return;
        }
        const userData = JSON.parse(data);
        if (userData?.role !== 'teacher') {
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
                <h2>Teacher Menu</h2>
                <ul>
                    <li>Dashboard</li>
                    <li>Review Submissions</li>
                    <li>Student List</li>
                    <li>Defense Schedule</li>
                    <li>Messages</li>
                    <li>Notifications</li>
                    <li>My Profile</li>
                    <li onClick={handleLogout}>Log Out</li>
                </ul>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="header">
                    <div className="user-info">
                        <h1>Welcome, {userInfo?.name}</h1>
                        <p>Teacher ID: {userInfo?.teacherId || 'N/A'}</p>
                    </div>
                    <img className="profile-picture" src={userInfo?.image} alt={userInfo?.name} />
                </header>

                {/* Status Overview */}
                <section className="status-cards">
                    <div className="status-card">
                        <h3>Pending Reviews</h3>
                        <p className="count">5</p>
                    </div>
                    <div className="status-card">
                        <h3>Students Assigned</h3>
                        <p className="count">12</p>
                    </div>
                    <div className="status-card">
                        <h3>Upcoming Defenses</h3>
                        <p className="count">3</p>
                    </div>
                </section>

                {/* Recent Submissions to Review */}
                <section className="submissions-section">
                    <h2>Recent Submissions to Review</h2>
                    <table className="submissions-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Chapter</th>
                                <th>Submission Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>John Doe</td>
                                <td>Chapter 1 - Introduction</td>
                                <td>2024-02-20</td>
                                <td><span className="status-pending">Pending Review</span></td>
                                <td>
                                    <button className="btn-view">View</button>
                                    <button className="btn-review">Review</button>
                                </td>
                            </tr>
                            <tr>
                                <td>Jane Smith</td>
                                <td>Chapter 2 - Literature Review</td>
                                <td>2024-02-19</td>
                                <td><span className="status-in-progress">In Progress</span></td>
                                <td>
                                    <button className="btn-view">View</button>
                                    <button className="btn-review">Continue Review</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* Upcoming Defense Schedule */}
                <section className="defense-schedule">
                    <h2>Upcoming Defense Schedule</h2>
                    <table className="submissions-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Venue</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Alice Johnson</td>
                                <td>March 15, 2024</td>
                                <td>10:00 AM</td>
                                <td>Room 301</td>
                                <td>
                                    <button className="btn-view">View Details</button>
                                </td>
                            </tr>
                            <tr>
                                <td>Bob Wilson</td>
                                <td>March 17, 2024</td>
                                <td>2:00 PM</td>
                                <td>Room 405</td>
                                <td>
                                    <button className="btn-view">View Details</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    );
};

export default TeacherDashboard; 