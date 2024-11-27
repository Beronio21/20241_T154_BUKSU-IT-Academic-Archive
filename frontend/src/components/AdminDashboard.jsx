import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';
import UserManagement from './UserManagement';
import StudentRecords from './StudentRecords';
import TeacherRecords from './TeacherRecords';

const AdminDashboard = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        activeTheses: 0
    });
    const [recentAccounts, setRecentAccounts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUserInfo = localStorage.getItem('user-info');
        if (storedUserInfo) {
            setUserInfo(JSON.parse(storedUserInfo));
        }
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const config = {
                headers: {
                    'Authorization': `Bearer ${userInfo?.token}`,
                    'Content-Type': 'application/json'
                }
            };

            const studentsResponse = await axios.get('http://localhost:8080/api/students', config);
            const teachersResponse = await axios.get('http://localhost:8080/api/teachers', config);

            const allUsers = [...studentsResponse.data, ...teachersResponse.data]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);

            setRecentAccounts(allUsers);
            setStats({
                totalStudents: studentsResponse.data.length,
                totalTeachers: teachersResponse.data.length,
                activeTheses: 0
            });

        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user-info');
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'user-management':
                return <UserManagement />;
            case 'student-records':
                return <StudentRecords />;
            case 'teacher-records':
                return <TeacherRecords />;
            case 'dashboard':
            default:
                return (
                    <>
                        <header className="header">
                            <div className="user-info">
                                <h1>Welcome, {userInfo?.name}</h1>
                                <p>Administrator</p>
                            </div>
                            <img className="profile-picture" src={userInfo?.image} alt={userInfo?.name} />
                        </header>
                        <section className="status-cards">
                            <div className="status-card">
                                <h3>Total Students</h3>
                                <p className="count">{stats.totalStudents}</p>
                            </div>
                            <div className="status-card">
                                <h3>Total Teachers</h3>
                                <p className="count">{stats.totalTeachers}</p>
                            </div>
                            <div className="status-card">
                                <h3>Active Theses</h3>
                                <p className="count">{stats.activeTheses}</p>
                            </div>
                        </section>

                        {/* New Recent Accounts Section */}
                        <section className="recent-accounts">
                            <h2>Recently Created Accounts</h2>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Role</th>
                                            <th>ID</th>
                                            <th>Email</th>
                                            <th>Created Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentAccounts.map(account => (
                                            <tr key={account._id}>
                                                <td>{account.name}</td>
                                                <td>
                                                    <span className={`role-badge ${account.role}`}>
                                                        {account.role}
                                                    </span>
                                                </td>
                                                <td>{account.student_id || account.teacher_id}</td>
                                                <td>{account.email}</td>
                                                <td>{new Date(account.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                );
        }
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <h2>Admin Panel</h2>
                <ul>
                    <li 
                        className={activeSection === 'dashboard' ? 'active' : ''}
                        onClick={() => setActiveSection('dashboard')}
                    >
                        Dashboard
                    </li>
                    <li 
                        className={activeSection === 'user-management' ? 'active' : ''}
                        onClick={() => setActiveSection('user-management')}
                    >
                        User Management
                    </li>
                    <li 
                        className={activeSection === 'student-records' ? 'active' : ''}
                        onClick={() => setActiveSection('student-records')}
                    >
                        Student Records
                    </li>
                    <li 
                        className={activeSection === 'teacher-records' ? 'active' : ''}
                        onClick={() => setActiveSection('teacher-records')}
                    >
                        Teacher Records
                    </li>
                    <li onClick={handleLogout}>Log Out</li>
                </ul>
            </aside>

            <main className="main-content">
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboard; 