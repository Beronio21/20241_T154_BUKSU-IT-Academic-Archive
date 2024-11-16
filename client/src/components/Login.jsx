
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../styles/login.css';


// Import images
import logo from '../images/buksulogo.png';
import leftImage from '../images/login1.png';
import googleLogo from '../images/google.jpg';
import React, { useState, useEffect } from 'react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        if (token) {
            const userType = localStorage.getItem('userType'); // Assuming you stored userType when logging in
            if (userType === 'instructor') {
                navigate('/instructor-dashboard');
            } else if (userType === 'student') {
                navigate('/student-dashboard');
            } else if (userType === 'admin') {
                navigate('/admin-dashboard');
            }
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const isInstructor = email.includes('@buksu.edu.ph');
            const isStudent = email.includes('@student.buksu.edu.ph');
            const isAdmin = email.includes('@gmail.com');
            
            let endpoint;
            if (isInstructor) {
                endpoint = 'http://localhost:5000/api/instructors/login';
            } else if (isStudent) {
                endpoint = 'http://localhost:5000/api/students/login';
            } else if (isAdmin) {
                endpoint = 'http://localhost:5000/api/admins/login';
            } else {
                setError('Please enter a valid email address for Instructor, Student, or Admin.');
                setLoading(false);
                return;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
<<<<<<< HEAD
                // Use the login function from AuthContext to store token and update state
                login(data.token);

                // Redirect user based on their role
                if (isInstructor) navigate('/instructor-dashboard');
                else if (isStudent) navigate('/student-dashboard');
                else if (isAdmin) navigate('/admin-dashboard');
=======
                localStorage.setItem('token', data.token);
                localStorage.setItem('userType', isInstructor ? 'instructor' : isStudent ? 'student' : 'admin'); // Storing userType

                login();

                if (isInstructor) {
                    navigate('/instructor-dashboard');
                } else if (isStudent) {
                    navigate('/student-dashboard');
                } else if (isAdmin) {
                    navigate('/admin-dashboard');
                }
>>>>>>> DEVELOPER
            } else {
                setError(data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

<<<<<<< HEAD
=======

>>>>>>> DEVELOPER
    
    return (
        <div className="login-page">
            {/* Logo */}
            <div className="logo">
                <img src={logo} alt="ThesEase Logo" />
            </div>

            <div className="login-container">
                {/* Left section */}
                <div className="left-section">
                    <h1>Your Research, Our Platform. Login and Begin.</h1>
                    <div className="image-box">
                        <img src={leftImage} alt="Left side image" />
                    </div>
                    <h2>Redefining Academic Submissions for a Digital Age.</h2>
                </div>

                {/* Login Box */}
                <div className="login-box">
                    <h1>ThesEase</h1>
                    <h2>Login</h2>
                    {error && <p className="error-message">{error}</p>}
                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>

                        <div className="separator">
                            <span>or</span>
                        </div>

                        <button type="button" className="google-btn">
                            <img src={googleLogo} alt="Google Logo" />
                            Login with Google
                        </button>

                        <div className="extra-options">
                            <a href="#">Forgot Password?</a>
                            <p>
                                Don't have an account? 
                                <Link to="/select-user-type"> Register</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
