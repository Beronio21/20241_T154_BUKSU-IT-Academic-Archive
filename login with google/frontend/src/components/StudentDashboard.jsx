import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';
import StudentProfile from './StudentProfile';

const StudentDashboard = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const data = localStorage.getItem('user-info');
        if (!data) {
            navigate('/login');
            return;
        }
        const userData = JSON.parse(data);
        if (userData?.role !== 'student') {
            navigate('/login');
            return;
        }
        setUserInfo(userData);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user-info');
        navigate('/login');
    };

    const renderContent = () => {
        switch(activeSection) {
            case 'profile':
                return <StudentProfile userInfo={userInfo} />;
            case 'dashboard':
                return (
                    <>
                        <header className="header">
                            <div className="user-info">
                                <h1>Welcome, {userInfo?.name}</h1>
                                <p>Student ID: {userInfo?.student_id || 'N/A'}</p>
                            </div>
                            <img className="profile-picture" src={userInfo?.image} alt={userInfo?.name} />
                        </header>

                        <section className="status-cards">
                            <div className="status-card">
                                <h3>Pending Reviews</h3>
                                <p className="count">2</p>
                            </div>
                            <div className="status-card">
                                <h3>Approved Chapters</h3>
                                <p className="count">3</p>
                            </div>
                            <div className="status-card">
                                <h3>Upcoming Defense</h3>
                                <p>March 15, 2024</p>
                            </div>
                        </section>

                        <section className="submissions-section">
                            <h2>Recent Submissions</h2>
                            <table className="submissions-table">
                                <thead>
                                    <tr>
                                        <th>Chapter</th>
                                        <th>Submission Date</th>
                                        <th>Status</th>
                                        <th>Feedback</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Chapter 1 - Introduction</td>
                                        <td>2024-02-20</td>
                                        <td><span className="status-pending">Under Review</span></td>
                                        <td>Pending</td>
                                        <td>
                                            <button className="btn-view">View</button>
                                            <button className="btn-edit">Edit</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Chapter 2 - Literature Review</td>
                                        <td>2024-02-15</td>
                                        <td><span className="status-approved">Approved</span></td>
                                        <td>Excellent work</td>
                                        <td>
                                            <button className="btn-view">View</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>
                    </>
                );
            // ... other cases
            default:
                return null;
        }
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <h2>Student Menu</h2>
                <ul>
                    <li 
                        className={activeSection === 'dashboard' ? 'active' : ''} 
                        onClick={() => setActiveSection('dashboard')}
                    >
                        Dashboard
                    </li>
                    <li 
                        className={activeSection === 'profile' ? 'active' : ''} 
                        onClick={() => setActiveSection('profile')}
                    >
                        My Profile
                    </li>
                    <li>Submit Thesis</li>
                    <li>My Submissions</li>
                    <li>Schedule</li>
                    <li>Messages</li>
                    <li>Notifications</li>
                    <li onClick={handleLogout}>Log Out</li>
                </ul>
            </aside>

            <main className="main-content">
                {renderContent()}
            </main>
        </div>
    );
};

export default StudentDashboard; 