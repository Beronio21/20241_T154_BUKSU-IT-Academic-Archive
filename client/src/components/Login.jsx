import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'; //
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
    const GOOGLE_CLIENT_ID = "736065879191-b45t9nomm8n44ifvnebg86o5veerr00e.apps.googleusercontent.com"; // Replace with your actual Client ID

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/students/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('token', data.token);  // Use sessionStorage instead of localStorage for more security
                login();
                navigate('/dashboard');
            } else {
                setError(data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            const response = await fetch('http://localhost:5000/api/students/google-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: credentialResponse.credential }), // This is the token sent to backend
            });
    
            const data = await response.json();
    
            if (data.success) {
                sessionStorage.setItem('token', data.token);  // Store the token securely
                login();
                navigate('/dashboard');
            } else {
                setError(data.message || 'Google login failed.');
            }
        } catch (error) {
            console.error('Error during Google login:', error);  // Add logging for debugging
            setError('An error occurred during Google login.');
        }
    };
    

    const handleGoogleLoginError = () => {
        setError('Google login was unsuccessful. Please try again.');
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
                                    type="text"
                                    placeholder="Username or Email"
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

                            <GoogleLogin
                                onSuccess={handleGoogleLoginSuccess}
                                onError={handleGoogleLoginError}
                                useOneTap
                                render={(renderProps) => (
                                    <button 
                                        type="button" 
                                        className="google-btn" 
                                        onClick={renderProps.onClick} 
                                        disabled={renderProps.disabled}
                                    >
                                        <img src={googleLogo} alt="Google Logo" />
                                        Login with Google
                                    </button>
                                )}
                            />

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
        </GoogleOAuthProvider>
    );
};

export default Login;
// cant login using my existing account in mongodb