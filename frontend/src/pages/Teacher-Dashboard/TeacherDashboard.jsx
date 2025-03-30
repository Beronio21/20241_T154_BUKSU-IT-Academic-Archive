import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TeacherNavbar from '../../Navbar/Teacher-Navbar/TeacherNavbar';
import TeacherTopbar from '../../Topbar/Teacher-Topbar/TeacherTopbar';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const TeacherDashboard = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [topicFilter, setTopicFilter] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const storedUserInfo = localStorage.getItem('user-info');
        if (!storedUserInfo) {
            navigate('/login', { replace: true });
            return;
        }

        if (location.pathname === '/teacher-dashboard') {
            navigate('/teacher-dashboard/dashboard', { replace: true });
        }
    }, [navigate, location]);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/thesis/submissions');
            setSubmissions(response.data.data);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterSubmissions = () => {
        return submissions.filter(submission => {
            const matchesSearch = submission.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesYear = yearFilter ? submission.year === yearFilter : true;
            const matchesTopic = topicFilter && topicFilter !== 'All Topics' 
                ? submission.topic.toLowerCase() === topicFilter.toLowerCase() 
                : true;

            return matchesSearch && matchesYear && matchesTopic;
        });
    };

    return (
        <div className="d-flex flex-column">
            <TeacherTopbar 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                yearFilter={yearFilter} 
                setYearFilter={setYearFilter} 
                topicFilter={topicFilter} 
                setTopicFilter={setTopicFilter}
            />
            <div className="d-flex">
                <TeacherNavbar />
                <div className="container mt-4">
                    <h2 className="mb-3">Thesis Submissions</h2>
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <ul className="list-group">
                            {filterSubmissions().length === 0 ? (
                                <li className="list-group-item text-center text-muted py-4">
                                    <i className="bi bi-inbox-fill fs-2"></i>
                                    <p className="mt-2">No submissions to review</p>
                                </li>
                            ) : (
                                filterSubmissions().map((submission) => (
                                    <li key={submission._id} className="list-group-item border rounded shadow-sm mb-3 p-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h5 className="mb-1">{submission.title}</h5>
                                                <p className="mb-1 text-muted"><strong>Abstract:</strong> {submission.abstract}</p>
                                            </div>
                                            <span className={`badge bg-${submission.status.toLowerCase() === 'approved' ? 'success' : 'warning'} text-uppercase`}>
                                                {submission.status}
                                            </span>
                                        </div>
                                        <div className="mt-2 d-flex justify-content-between align-items-center">
                                            <a 
                                                href={submission.docsLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="btn btn-primary btn-sm"
                                            >
                                                <i className="bi bi-eye-fill me-2"></i> View Document
                                            </a>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
