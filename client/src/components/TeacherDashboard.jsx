// TeacherDashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/TeacherDashboard.css';

const TeacherDashboard = () => {
    const [instructor, setInstructor] = useState(null);
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        // Fetch instructor data and submissions when component mounts
        fetchInstructor();
        fetchSubmissions();
    }, []);

    const fetchInstructor = async () => {
        try {
            const response = await fetch('/api/instructors/profile'); // Adjust API path as necessary
            const data = await response.json();
            setInstructor(data);
        } catch (error) {
            console.error('Error fetching instructor data:', error);
        }
    };

    const fetchSubmissions = async () => {
        try {
            const response = await fetch('/api/theses'); // Adjust API path as necessary
            const data = await response.json();
            setSubmissions(data);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        }
    };

    return (
        <div className="teacher-dashboard">
            {/* Top Navigation Bar */}
            <header className="top-nav">
                <h2>Instructor Dashboard</h2>
                <div className="nav-items">
                    <span>Welcome, {instructor ? instructor.first_name : "Instructor"}</span>
                    <Link to="/profile">Profile Settings</Link>
                    <Link to="/logout">Log Out</Link>
                </div>
            </header>

            {/* Sidebar */}
            <aside className="sidebar">
                <ul>
                    <li><Link to="/instructor-dashboard">Dashboard Home</Link></li>
                    <li><Link to="/instructor">Thesis Submissions</Link></li>
                    <li><Link to="/notifications">Notifications</Link></li>
                    <li><Link to="/messages">Messages</Link></li>
                </ul>
            </aside>

            {/* Main Content Area */}
            <main className="content">
                {/* Dashboard Home */}
                <section className="dashboard-home">
                    <h3>Recent Submissions</h3>
                    <ul>
                        {submissions.map((submission) => (
                            <li key={submission._id}>
                                <span>{submission.title}</span>
                                <span>Status: {submission.status}</span>
                                <Link to={`/submissions/${submission._id}`}>View Details</Link>
                            </li>
                        ))}
                    </ul>
                </section>
            </main>
        </div>
    );
};

export default TeacherDashboard;
