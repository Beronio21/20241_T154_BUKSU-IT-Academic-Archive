import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherProfile from './TeacherProfile';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [currentView, setCurrentView] = useState('dashboard');
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
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

    // Fetch submissions when userInfo is available
    useEffect(() => {
        if (userInfo?.email) {
            fetchSubmissions();
        }
    }, [userInfo]);

    const fetchSubmissions = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/thesis/submissions/adviser?email=${encodeURIComponent(userInfo.email)}`
            );
            const data = await response.json();
            
            if (data.status === 'success') {
                setSubmissions(data.data);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('user-info');
        navigate('/login');
    };

    // Handle menu item clicks
    const handleMenuClick = (view) => {
        setCurrentView(view);
    };

    // Render content based on current view
    const renderContent = () => {
        switch(currentView) {
            case 'profile':
                return <TeacherProfile />;
            case 'dashboard':
            default:
                return (
                    <>
                        <header className="header">
                            <div className="user-info">
                                <h1>Welcome, {userInfo?.name}</h1>
                                <p>Teacher ID: {userInfo?.teacherId || 'N/A'}</p>
                            </div>
                            <img className="profile-picture" src={userInfo?.image} alt={userInfo?.name} />
                        </header>

                        <section className="status-cards">
                            <div className="status-card">
                                <h3>Pending Reviews</h3>
                                <p className="count">
                                    {submissions.filter(sub => sub.status === 'pending').length}
                                </p>
                            </div>
                            <div className="status-card">
                                <h3>Students Assigned</h3>
                                <p className="count">{submissions.length}</p>
                            </div>
                            <div className="status-card">
                                <h3>Upcoming Defenses</h3>
                                <p className="count">3</p>
                            </div>
                        </section>

                        <section className="submissions-section">
                            <h2>Recent Submissions to Review</h2>
                            {loading ? (
                                <p>Loading submissions...</p>
                            ) : (
                                <table className="submissions-table">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Members</th>
                                            <th>Submission Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{textAlign: 'center'}}>
                                                    No submissions to review
                                                </td>
                                            </tr>
                                        ) : (
                                            submissions.map((submission) => (
                                                <tr key={submission._id}>
                                                    <td>{submission.title}</td>
                                                    <td>{submission.members.join(', ')}</td>
                                                    <td>{formatDate(submission.createdAt)}</td>
                                                    <td>
                                                        <span className={`status-${submission.status.toLowerCase()}`}>
                                                            {submission.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <a 
                                                            href={submission.docsLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn-view"
                                                        >
                                                            View
                                                        </a>
                                                        <button 
                                                            className="btn-review"
                                                            onClick={() => handleReview(submission._id)}
                                                        >
                                                            Review
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </section>
                    </>
                );
        }
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <h2>Teacher Menu</h2>
                <ul>
                    <li 
                        className={currentView === 'dashboard' ? 'active' : ''} 
                        onClick={() => handleMenuClick('dashboard')}
                    >
                        Dashboard
                    </li>
                    <li>Review Submissions</li>
                    <li>Student List</li>
                    <li>Defense Schedule</li>
                    <li>Messages</li>
                    <li>Notifications</li>
                    <li 
                        className={currentView === 'profile' ? 'active' : ''} 
                        onClick={() => handleMenuClick('profile')}
                    >
                        My Profile
                    </li>
                    <li onClick={handleLogout}>Log Out</li>
                </ul>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {renderContent()}
            </main> 
        </div>
    );
};

export default TeacherDashboard; 