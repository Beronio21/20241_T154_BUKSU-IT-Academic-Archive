import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../styles/login.css';

// Import images
import logo from '../images/buksulogo.png';
import leftImage from '../images/login1.png';
import googleLogo from '../images/google.jpg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
<<<<<<< HEAD
            const response = await fetch('http://localhost:5000/api/students/login', {
=======
            // Determine if user is an instructor based on email
            const isInstructor = email.includes('@instructor.com');
            const endpoint = isInstructor
                ? 'http://localhost:5000/api/instructors/login' // Instructor endpoint
                : 'http://localhost:5000/api/students/login';    // Student endpoint

            const response = await fetch(endpoint, {
>>>>>>> INTEGRATION
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

<<<<<<< HEAD
            if (response.ok) {
                localStorage.setItem('token', data.token);
                login();
                navigate('/dashboard');
            } else {
=======
            // Debugging logs for better error understanding
            console.log('Response from server:', data);

            if (response.ok) {
                localStorage.setItem('token', data.token);  // Save token
                login();  // Update Auth context (if using context for auth)

                // Navigate based on user type
                if (isInstructor) {
                    navigate('/instructor-dashboard');
                } else {
                    navigate('/student-dashboard');
                }
            } else {
                // Show error message if response is not ok
>>>>>>> INTEGRATION
                setError(data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
<<<<<<< HEAD
                                type="text"
                                placeholder="Username or Email"
=======
                                type="email"  // Changed to 'email' type for validation
                                placeholder="Email"
>>>>>>> INTEGRATION
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
