import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const data = localStorage.getItem('user-info');
        const userData = JSON.parse(data);
        setUserInfo(userData);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user-info');
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <h2>Menu</h2>
                <ul>
                    <li>Dashboard</li>
                    <li>Submission</li>
                    <li>Notification</li>
                    <li>Chats</li>
                    <li>Profile</li>
                    <li onClick={handleLogout}>Log Out</li>
                </ul>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="header">
                    <h1>Welcome, {userInfo?.name}</h1>
                    <img className="profile-picture" src={userInfo?.image} alt={userInfo?.name} />
                </header>

                {/* Submissions List */}
                <section className="submissions-section">
                    <h2>Your Submissions</h2>
                    <table className="submissions-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Feedback</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Example row: Replace with actual data */}
                            <tr>
                                <td>Sample Thesis Title</td>
                                <td>2024-11-14</td>
                                <td>Pending</td>
                                <td>No Feedback</td>
                                <td>
                                    <button>View</button>
                                    <button>Edit</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
