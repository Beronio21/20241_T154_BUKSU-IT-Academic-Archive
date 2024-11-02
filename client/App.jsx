// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext'; // Import AuthContext
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
        </div>
    );
};

export default App;
