import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './src/AuthContext';

import Login from './src/components/Login';
import StudentRegister from './src/components/StudentRegister';
import InstructorRegister from './src/components/InstructorRegister';
import AdminRegister from './src/components/AdminRegister';
import Dashboard from './src/components/Dashboard';
import UserType from './src/components/UserType';
import DashboardStudent from './src/components/DashboardStudent';
import ThesisSubmission from './src/components/ThesisSubmission';
import Notification from './src/components/Notifications';
import Messages from './src/components/Messages';
import ProfileSettings from './src/components/ProfileSettings';
import TeacherDashboard from './src/components/TeacherDashboard';
import ThesisSubmissionsPage from './src/components/ThesisSubmissionsPage';
import StudentSubmitThesis from './src/components/StudentSubmitThesis';
import InstructorReviewThesis from './src/components/InstructorReviewThesis';
import AdminDashboard from './src/components/AdminDashboard';
import ProtectedRoute from './src/components/ProtectedRoute';
import UserManagement from './src/components/UserManagement';



const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Main />
            </Router>
        </AuthProvider>
    );
};

const Main = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate(); // Use `useNavigate` for programmatic navigation

    useEffect(() => {
        // Redirect to the appropriate dashboard if already logged in
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        
        if (token) {
            if (userType === 'student') {
                navigate('/student-dashboard');
            } else if (userType === 'instructor') {
                navigate('/instructor-dashboard');
            } else if (userType === 'admin') {
                navigate('/admin-dashboard');
            }
        }
    }, [isAuthenticated, navigate]);

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/select-user-type" element={<UserType />} />
            <Route path="/register-student" element={<StudentRegister />} />
            <Route path="/register-instructor" element={<InstructorRegister />} />
            <Route path="/register-admin" element={<AdminRegister />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/student-dashboard" element={<DashboardStudent />} />
                <Route path="/thesis-submission" element={<ThesisSubmission />} />
                <Route path="/notifications" element={<Notification />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/profile-settings" element={<ProfileSettings />} />
                <Route path="/instructor-dashboard" element={<TeacherDashboard />} />
                <Route path="/thesis-review" element={<ThesisSubmissionsPage />} />
                <Route path="/student" element={<StudentSubmitThesis />} />
                <Route path="/instructor" element={<InstructorReviewThesis />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/user-management" element={<UserManagement />} />
            </Route>
        </Routes>
    );
};

export default App;
