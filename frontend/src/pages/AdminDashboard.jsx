import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserManagement from '../UserManagement/UserManagement';
import StudentRecords from '../Records/StudentRecords';
import TeacherRecords from '../Records/TeacherRecords';

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

        const handlePopState = () => {
            window.history.pushState(null, null, window.location.pathname);
        };

        window.history.pushState(null, null, window.location.pathname);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
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
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/', { replace: true });
        }
    };

    const handleSectionChange = (section) => {
        setActiveSection(section);
        navigate(`/admin-dashboard/${section}`);
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
                        <header className="d-flex align-items-center justify-content-between mb-4">
                            <div>
                                <h1 className="h3">Welcome, {userInfo?.name}</h1>
                                <p className="text-muted">Administrator</p>
                            </div>
                            <img
                                className="rounded-circle"
                                src={userInfo?.image}
                                alt={userInfo?.name}
                                style={{ width: '50px', height: '50px' }}
                            />
                        </header>

                        <div className="row g-3">
                            <div className="col-md-4">
                                <div className="card text-center">
                                    <div className="card-body">
                                        <h5 className="card-title">Total Students</h5>
                                        <p className="display-6 fw-bold text-primary">{stats.totalStudents}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card text-center">
                                    <div className="card-body">
                                        <h5 className="card-title">Total Teachers</h5>
                                        <p className="display-6 fw-bold text-primary">{stats.totalTeachers}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card text-center">
                                    <div className="card-body">
                                        <h5 className="card-title">Active Theses</h5>
                                        <p className="display-6 fw-bold text-primary">{stats.activeTheses}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <section className="mt-4">
                            <h2 className="h4">Recently Created Accounts</h2>
                            <div className="table-responsive">
                                <table className="table table-striped">
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
                                                    <span className={`badge bg-${account.role === 'student' ? 'primary' : 'secondary'}`}>{account.role}</span>
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
        <div className="d-flex">
            <div className="bg-dark position-fixed start-0 top-0 vh-100" style={{ width: '250px', boxShadow: '2px 0 5px rgba(0,0,0,0.2)' }}>
                <div className="d-flex flex-column h-100">
                    <div className="p-4 text-center">
                        <h5 className="text-white fw-bold mb-0">Admin Panel</h5>
                    </div>

                    <div className="px-3">
                        <ul className="nav flex-column gap-1">
                            {[
                                { name: 'Dashboard', section: 'dashboard' },
                                { name: 'User Management', section: 'user-management' },
                                { name: 'Student Records', section: 'student-records' },
                                { name: 'Teacher Records', section: 'teacher-records' },
                            ].map((item) => (
                                <li className="nav-item" key={item.section}>
                                    <button 
                                        className={`nav-link w-100 text-start rounded ${
                                            activeSection === item.section 
                                            ? 'active bg-primary text-white' 
                                            : 'text-white-50'
                                        }`}
                                        onClick={() => handleSectionChange(item.section)}
                                        style={{
                                            transition: 'all 0.2s ease',
                                            padding: '12px 16px',
                                            border: 'none',
                                            backgroundColor: activeSection === item.section ? '#0d6efd' : 'transparent',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                        }}
                                    >
                                        {item.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-auto p-3">
                        <button 
                            className="btn btn-link text-white w-100"
                            onClick={handleLogout}
                            style={{
                                border: 'none',
                                background: 'none',
                                fontSize: '14px',
                                fontWeight: '500',
                                textDecoration: 'none'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-grow-1 p-4" style={{ marginLeft: '250px' }}>
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminDashboard;