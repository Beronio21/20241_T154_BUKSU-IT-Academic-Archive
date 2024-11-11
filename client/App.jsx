<<<<<<< HEAD
// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext'; // Import AuthContext
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard'; // Dashboard component
=======
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './src/AuthContext';

import Login from './src/components/Login';
import StudentRegister from './src/components/StudentRegister';
import InstructorRegister from './src/components/InstructorRegister';
import AdminRegister from './src/components/AdminRegister';
import Dashboard from './src/components/Dashboard';
import UserType from './src/components/UserType';
import DashboardStudent from './src/components/DashboardStudent';
import ThesisSubmission from './src/components/ThesisSubmission';
import Notification from './src/components/Notifications'; // Import the Notification component
import Messages from './src/components/Messages'; // Import the Messages component
import ProfileSettings from './src/components/ProfileSettings';
import TeacherDashboard from './src/components/TeacherDashboard'; // Instructor dashboard
import ThesisSubmissionsPage from './src/components/ThesisSubmissionsPage';
import StudentSubmitThesis from './src/components/StudentSubmitThesis';
import InstructorReviewThesis from './src/components/InstructorReviewThesis';
>>>>>>> INTEGRATION

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Main />
            </Router>
        </AuthProvider>
<<<<<<< HEAD
    );
};

const Main = () => {
    const { isAuthenticated } = useAuth(); // Get authentication state

    return (
        <div>
            <header>
                <h1>Online Thesis Submission and Review System</h1>
                {!isAuthenticated && (
                    <nav>
                        <ul>
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <Link to="/login">Login</Link>
                            </li>
                            <li>
                                <Link to="/register">Register</Link>
                            </li>
                        </ul>
                    </nav>
                )}
            </header>
            <main>
                <Routes>
                    <Route path="/" element={<h2>Welcome to the System</h2>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    {isAuthenticated && (
                        <Route path="/dashboard" element={<Dashboard />} /> // Dashboard route
                    )}
                </Routes>
            </main>
=======
    ); 
};

const Main = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/select-user-type" element={<UserType />} />
                <Route path="/register-student" element={<StudentRegister />} />
                <Route path="/register-instructor" element={<InstructorRegister />} />
                <Route path="/register-admin" element={<AdminRegister />} />
                <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <h2>Please log in</h2>} />
                <Route path="/student-dashboard" element={<DashboardStudent />} />
                <Route path="/thesis-submission" element={<ThesisSubmission />} />
                <Route path="/notifications" element={<Notification />} /> {/* Route for notifications */}
                <Route path="/messages" element={<Messages />} /> {/* Route for Messages */}
                <Route path="/profile-settings" element={<ProfileSettings />} />
                <Route path="/instructor-dashboard" element={<TeacherDashboard />} />
                <Route path="/thesis-review" element={<ThesisSubmissionsPage />} />
                <Route path="/student" element={<StudentSubmitThesis />} />
                <Route path="/instructor" element={<InstructorReviewThesis />} />

            </Routes>
>>>>>>> INTEGRATION
        </div>
    );
};

export default App;
