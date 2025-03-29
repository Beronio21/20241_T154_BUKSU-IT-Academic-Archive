import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TeacherNavbar from '../../Navbar/Teacher-Navbar/TeacherNavbar';
import TeacherTopbar from '../../Topbar/Teacher-Topbar/TeacherTopbar';
import axios from 'axios';

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
        <div className="d-flex">
            <TeacherTopbar 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                yearFilter={yearFilter} 
                setYearFilter={setYearFilter} 
                topicFilter={topicFilter} 
                setTopicFilter={setTopicFilter}
            />
            <TeacherNavbar />
            <div className="flex-grow-1 p-4" style={{ marginLeft: '250px', marginTop: '60px' }}>
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="submissions-grid">
                        {filterSubmissions().length === 0 ? (
                            <div className="no-submissions">
                                <i className="bi bi-inbox text-muted"></i>
                                <p>No submissions to review</p>
                            </div>
                        ) : (
                            filterSubmissions().map((submission) => (
                                <div 
                                    key={submission._id} 
                                    className="submission-card fade-in"
                                >
                                    <div className="submission-header">
                                        <h3>{submission.title}</h3>
                                        <span 
                                            className={`status-badge ${submission.status.toLowerCase()}`}
                                        >
                                            {submission.status}
                                        </span>
                                    </div>
                                    <div className="submission-content">
                                        <div className="info-group">
                                            <label>Abstract:</label>
                                            <p className="abstract-text">{submission.abstract}</p>
                                        </div>
                                    </div>
                                    <div className="submission-actions">
                                        <a 
                                            href={submission.docsLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-view"
                                        >
                                            <i className="bi bi-eye-fill me-2"></i>
                                            View Document
                                        </a>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
