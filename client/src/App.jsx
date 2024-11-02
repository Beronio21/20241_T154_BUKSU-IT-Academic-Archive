// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext'; // Ensure this path is correct

import Login from './components/Login';
import StudentRegister from './components/StudentRegister';
import InstructorRegister from './components/InstructorRegister';
import AdminRegister from './components/AdminRegister';
import Dashboard from './components/Dashboard';
import UserType from './components/UserType'; 

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
    const { isAuthenticated } = useAuth(); // Get authentication state

    return (
        <div>
            <Routes>
                <Route path="/" element={<Login />} /> {/* Redirect to login by default */}
                <Route path="/login" element={<Login />} />
                <Route path="/select-user-type" element={<UserType />} /> {/* Route to select user type */}
                <Route path="/register-student" element={<StudentRegister />} />
                <Route path="/register-instructor" element={<InstructorRegister />} />
                <Route path="/register-admin" element={<AdminRegister />} />
                <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <h2>Please log in</h2>} />
            </Routes>
        </div>
    );
};

export default App;
