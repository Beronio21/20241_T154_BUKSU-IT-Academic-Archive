import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';
import StudentProfile from './StudentProfile';
import SubmitThesis from './SubmitThesis';

const StudentDashboard = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [userInfo, setUserInfo] = useState(null);
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
        if (userData?.role !== 'student') {
            navigate('/login');
            return;
        }
        setUserInfo(userData);
    }, [navigate]);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            console.log('Fetching submissions...');
            const response = await fetch('http://localhost:8080/api/thesis/submissions');
            const data = await response.json();
            
            if (data.status === 'success') {
                console.log('Submissions received:', data.data.length);
                setSubmissions(data.data);
            } else {
                console.error('Failed to fetch submissions:', data.message);
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

    const renderContent = () => {
        switch(activeSection) {
            case 'profile':
                return <StudentProfile userInfo={userInfo} />;
            case 'submit-thesis':
                return <SubmitThesis />;
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
                                <p className="count">
                                    {submissions.filter(sub => sub.status === 'pending').length}
                                </p>
                            </div>
                            <div className="status-card">
                                <h3>Approved Chapters</h3>
                                <p className="count">
                                    {submissions.filter(sub => sub.status === 'approved').length}
                                </p>
                            </div>
                            <div className="status-card">
                                <h3>Upcoming Defense</h3>
                                <p>March 15, 2024</p>
                            </div>
                        </section>

                        <section className="submissions-section">
                            <h2>Recent Submissions</h2>
                            {loading ? (
                                <p>Loading submissions...</p>
                            ) : (
                                <table className="submissions-table">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Members</th>
                                            <th>Adviser</th>
                                            <th>Submission Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" style={{textAlign: 'center'}}>
                                                    No submissions yet
                                                </td>
                                            </tr>
                                        ) : (
                                            submissions.map((submission, index) => (
                                                <tr key={submission._id || index}>
                                                    <td>{submission.title}</td>
                                                    <td>{submission.members.join(', ')}</td>
                                                    <td>{submission.adviserEmail}</td>
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
                                                            className="btn-view"
                                                        >
                                                            View
                                                        </a>
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
                    <li 
                        className={activeSection === 'submit-thesis' ? 'active' : ''} 
                        onClick={() => setActiveSection('submit-thesis')}
                    >
                        Submit Thesis
                    </li>
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