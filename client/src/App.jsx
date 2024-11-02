// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard'; // Dashboard component

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
        <main>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} /> {/* Redirect to login */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <h2>Please log in</h2>} />
            </Routes>
        </main>
    );
};

export default App;
