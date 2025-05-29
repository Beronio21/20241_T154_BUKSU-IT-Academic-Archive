import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserManagement from '../../UserManagement/UserManagement';
import StudentRecords from '../../Records/StudentRecords';
import TeacherRecords from '../../Records/TeacherRecords';
import AdminTopbar from '../../Topbar/Admin-Topbar/AdminTopbar';
import AdminNavbar from '../../Navbar/Admin-Navbar/AdminNavbar';
import AdminRegister from '../../Auth/AdminRegister';
import ReviewSubmission from '../../components/ReviewSubmission';
import CapstoneManagement from '../../components/CapstoneManagement';
import { Table } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const AdminDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    activeTheses: 0,
  });
  const [recentAccounts, setRecentAccounts] = useState([]);
  const navigate = useNavigate();

  // Load user info and stats on component mount
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('user-info');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
    fetchStats();

    // Prevent navigation and prompt user on page unload or back navigation
    const preventNavigation = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handlePopState = () => {
      window.history.pushState(null, null, window.location.pathname);
    };

    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', preventNavigation);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', preventNavigation);
    };
  }, []);

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      };

      // Fetch students count
      const studentsRes = await axios.get('http://localhost:8080/api/students', config);
      const teachersRes = await axios.get('http://localhost:8080/api/teachers', config);
      const thesesRes = await axios.get('http://localhost:8080/api/thesis', config);

      setStats({
        totalStudents: Array.isArray(studentsRes.data) ? studentsRes.data.length : 0,
        totalTeachers: Array.isArray(teachersRes.data) ? teachersRes.data.length : 0,
        activeTheses: Array.isArray(thesesRes.data) ? thesesRes.data.length : 0,
      });

      // Get recent accounts (last 5 from both students and teachers)
      const allAccounts = [
        ...(Array.isArray(studentsRes.data) ? studentsRes.data.map(s => ({ ...s, type: 'student' })) : []),
        ...(Array.isArray(teachersRes.data) ? teachersRes.data.map(t => ({ ...t, type: 'teacher' })) : [])
      ];

      // Sort by creation date and take last 5
      const sortedAccounts = allAccounts.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ).slice(0, 5);

      setRecentAccounts(sortedAccounts);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Handle user logout
  const handleLogout = () => {
    // Clear user info from local storage or state
    localStorage.removeItem("user-info");
    // Redirect to login page
    navigate("/login");
  };

  // Change active section
  const handleSectionChange = (section) => {
    setActiveSection(section);
    navigate(`/admin-dashboard/${section}`);
  };

  // Render content based on the active section
  const renderContent = () => {
    switch (activeSection) {
      case 'user-management':
        return <UserManagement />;
      case 'student-records':
        return <StudentRecords />;
      case 'teacher-records':
        return <TeacherRecords />;
      case 'review-submissions':
        return <ReviewSubmission />;
      case 'capstone-management':
        return <CapstoneManagement />;
      case 'admin-register':
        return <AdminRegister />;
      case 'dashboard':
      default:
        return (
          <div className="dashboard-content p-4">
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

            {/* Dashboard content */}
            <div className="row g-4">
              {/* Stats Cards */}
              <div className="col-md-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Total Students</h5>
                    <h2 className="mb-0">{stats.totalStudents}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Total Teachers</h5>
                    <h2 className="mb-0">{stats.totalTeachers}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Active Theses</h5>
                    <h2 className="mb-0">{stats.activeTheses}</h2>
                  </div>
                </div>
              </div>

              {/* Recent Accounts Table */}
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title mb-4">Recent Accounts</h5>
                    <div className="table-responsive">
                      <Table hover className="align-middle">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Type</th>
                            <th>Date Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentAccounts.map((account, index) => (
                            <tr key={index}>
                              <td>{account.name}</td>
                              <td>{account.email}</td>
                              <td>
                                <span className={`badge ${account.type === 'student' ? 'bg-info' : 'bg-success'}`}>
                                  {account.type}
                                </span>
                              </td>
                              <td>{new Date(account.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="d-flex">
      <AdminNavbar activeSection={activeSection} handleSectionChange={handleSectionChange} />
      <div className="flex-grow-1" style={{ marginLeft: '250px' }}>
        <AdminTopbar userInfo={userInfo} />
        <div style={{ paddingTop: '60px' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
