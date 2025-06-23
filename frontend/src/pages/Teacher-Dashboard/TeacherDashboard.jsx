import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import TeacherProfile from '../../Profile/TeacherProfile';
import SubmitThesis from '../../components/SubmitThesis';
import CommentDocs from '../../components/CommentDocs';
import Calendar from '../../components/Calendar';
import SendGmail from '../../Communication/SendGmail';
import ScheduleTable from '../../components/ScheduleTable';
import DefenseSchedule from '../../components/DefenseSchedule';
import ReviewSubmission from '../../components/ReviewSubmission';
import StudentList from '../../components/StudentList';
import TeacherNotification from '../../components/TeacherNotification';
import TeacherNavbar from '../../Navbar/Teacher-Navbar/TeacherNavbar';
import TeacherTopbar from '../../Topbar/Teacher-Topbar/TeacherTopbar';
import { Modal } from 'react-bootstrap';
import axios from 'axios';
import Dashboard from '../Student-Dashboard/Dashboard';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import './TeacherDashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const TeacherDashboard = () => {

    const [activeSection, setActiveSection] = useState('dashboard');
    const [userInfo, setUserInfo] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [feedbackForm, setFeedbackForm] = useState({ comment: '', status: 'pending' });
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [titleSearch, setTitleSearch] = useState('');
    const [dateSearch, setDateSearch] = useState('');
    const [categorySearch, setCategorySearch] = useState('');
    const [statistics, setStatistics] = useState(null);
    
    const categories = ['IoT', 'AI', 'ML', 'Sound', 'Camera']; // Define your categories

    useEffect(() => {
        const storedUserInfo = localStorage.getItem('user-info');
        if (!storedUserInfo) {
            navigate('/login', { replace: true });
            return;
        }
        const userData = JSON.parse(storedUserInfo);
        if (userData?.role !== 'teacher') {
            navigate('/login', { replace: true });
            return;
        }
        setUserInfo(userData);
        
        if (location.pathname === '/teacher-dashboard') {
            navigate('/teacher-dashboard/dashboard', { replace: true });
        }
    }, [navigate, location]);

    // Fetch submissions when userInfo is available
    useEffect(() => {
        if (userInfo?.email) {
            fetchSubmissions();
        }
    }, [userInfo]);

    const fetchSubmissions = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/thesis/submissions/adviser?email=${userInfo.email}`);
            setSubmissions(response.data.data);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
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
        navigate(`/teacher-dashboard/${section}`);
    };

    const handleAddFeedback = (submission) => {
        setShowModal(true);
        setFeedbackForm({ comment: '', status: 'pending' });
    };

    const handleSubmitFeedback = () => {
        // Implement the logic to submit feedback
        console.log('Feedback submitted:', feedbackForm);
        setShowModal(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return '#ffd700';
            case 'approved':
                return '#4caf50';
            case 'rejected':
                return '#f44336';
            case 'revision':
                return '#2196f3';
            default:
                return '#ccc';
        }
    };

    const filteredSubmissions = submissions.filter(submission => {
        const matchesTitle = submission.title.toLowerCase().includes(titleSearch.toLowerCase());
        const matchesDate = dateSearch ? new Date(submission.createdAt).toLocaleDateString() === new Date(dateSearch).toLocaleDateString() : true;
        const matchesCategory = categorySearch ? submission.category === categorySearch : true;

        return matchesTitle && matchesDate && matchesCategory;
    });

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/thesis/teacher-statistics');
                setStatistics(response.data.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load statistics. Please try again later.');
                setLoading(false);
            }
        };

        fetchStatistics();
    }, []);

    if (loading) {
        return <div className="loading">Loading statistics...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!statistics) {
        return <div className="error">No statistics available</div>;
    }

    // Prepare data for the bar chart (Submissions by Status)
    const submissionsByStatusData = {
        labels: Object.keys(statistics.submissionsByStatus),
        datasets: [
            {
                label: 'Submissions by Status',
                data: Object.values(statistics.submissionsByStatus),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)', // Pending
                    'rgba(54, 162, 235, 0.6)', // Approved
                    'rgba(255, 206, 86, 0.6)', // Rejected
                    'rgba(75, 192, 192, 0.6)', // Revision
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Prepare data for the pie chart (Submissions by Student)
    const submissionsByStudentData = {
        labels: Object.keys(statistics.submissionsByStudent),
        datasets: [
            {
                label: 'Submissions by Student',
                data: Object.values(statistics.submissionsByStudent),
                backgroundColor: [
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(201, 203, 207, 0.6)',
                ],
                borderColor: [
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(201, 203, 207, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return <TeacherProfile userInfo={userInfo} />;
            case 'submit-thesis':
                return <SubmitThesis />;
            case 'comment-docs':
                return <CommentDocs />;
            case 'calendar':
                return <Calendar />;
            case 'send-gmail':
                return <SendGmail />;
            case 'schedule':
                return <ScheduleTable />;
            case 'defenseschedule':
                return <DefenseSchedule />;
            case 'review-submissions':
                return <ReviewSubmission />;
            case 'student-list':
                return <StudentList />;
            case 'dashboard':
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="d-flex">
            <TeacherTopbar userInfo={userInfo} handleLogout={handleLogout} />
            <TeacherNavbar activeSection={activeSection} handleSectionChange={handleSectionChange} />
            <div className="flex-grow-1 p-4" style={{ marginLeft: '250px', marginTop: '60px' }}>
                <Routes>
                    <Route path="/dashboard" element={renderContent()} />
                    <Route path="/profile" element={<TeacherProfile userInfo={userInfo} />} />
                    <Route path="/submit-thesis" element={<SubmitThesis />} />
                    <Route path="/comment-docs" element={<CommentDocs />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/send-gmail" element={<SendGmail />} />
                    <Route path="/schedule" element={<ScheduleTable />} />
                    <Route path="/defenseschedule" element={<DefenseSchedule />} />
                    <Route path="/review-submissions" element={<ReviewSubmission />} />
                    <Route path="/student-list" element={<StudentList />} />
                    <Route path="*" element={<Navigate to="/teacher-dashboard/dashboard" replace />} />
                </Routes>
            </div>
        </div>
    );
};

export default TeacherDashboard;

