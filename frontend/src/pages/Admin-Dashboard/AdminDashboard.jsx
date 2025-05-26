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
      // Removed logout confirmation
      // if (window.confirm('Are you sure you want to leave this page?')) {
      //   handleLogout();
      // }
    };

    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', preventNavigation);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', preventNavigation);
    };
  }, []);

  // Fetch statistics from the backend
  const fetchStats = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      const config = {
        headers: {
          'Authorization': `Bearer ${userInfo?.token}`,
          'Content-Type': 'application/json',
        },
      };

      const studentsResponse = await axios.get('http://localhost:8080/api/students', config);
      const teachersResponse = await axios.get('http://localhost:8080/api/teachers', config);

      // Combine student and teacher data, and sort by creation date
      const allUsers = [...studentsResponse.data, ...teachersResponse.data]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setRecentAccounts(allUsers);
      setStats({
        totalStudents: studentsResponse.data.length,
        totalTeachers: teachersResponse.data.length,
        activeTheses: 0, // You can update this if you have active theses data
      });
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
          <>
            <AdminTopbar userInfo={userInfo} />
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
              <div className="card shadow">
                <div className="card-header bg-primary text-white py-3">
                  <h2 className="h4 mb-0">Recently Created Accounts</h2>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <div style={{ minHeight: '300px' }}>
                      <Table hover className="mb-0">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 border-bottom" style={{ width: '200px' }}>Name</th>
                            <th className="px-4 py-3 border-bottom" style={{ width: '100px' }}>Role</th>
                            <th className="px-4 py-3 border-bottom" style={{ width: '150px' }}>ID</th>
                            <th className="px-4 py-3 border-bottom" style={{ width: '250px' }}>Email</th>
                            <th className="px-4 py-3 border-bottom" style={{ width: '200px' }}>Created Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentAccounts.map((account) => (
                            <tr key={account._id}>
                              <td className="px-4 py-3">{account.name}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`badge ${
                                    account.student_id 
                                      ? 'bg-primary-subtle text-primary'
                                      : 'bg-secondary-subtle text-secondary'
                                  } px-3 py-2 rounded-pill d-inline-flex align-items-center`}
                                  style={{ fontSize: '0.85em', fontWeight: '500' }}
                                >
                                  <i className={`bi ${
                                    account.student_id 
                                      ? 'bi-mortarboard-fill'
                                      : 'bi-person-workspace'
                                  } me-1`}></i>
                                  {account.student_id ? 'Student' : 'Teacher'}
                                </span>
                              </td>
                              <td className="px-4 py-3">{account.student_id || account.teacher_id}</td>
                              <td className="px-4 py-3">{account.email}</td>
                              <td className="px-4 py-3">
                                {new Date(account.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      {recentAccounts.length === 0 && (
                        <div className="text-center py-5">
                          <p className="text-muted mb-0">No recent accounts found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="d-flex">
      <AdminNavbar activeSection={activeSection} handleSectionChange={handleSectionChange} />
      <div className="flex-grow-1 p-4" style={{ marginLeft: '250px', marginTop: '60px' }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
