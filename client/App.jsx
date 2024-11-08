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
                
            </Routes>
        </div>
    );
};

export default App;
