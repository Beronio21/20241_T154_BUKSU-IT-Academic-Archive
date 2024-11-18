import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../AuthContext';
import '../styles/Login.css';

import seenIcon from '../images/seen.png';
import hideIcon from '../images/hide.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false); // For toggling password visibility
    const navigate = useNavigate();
    const { login } = useAuth();
    const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // Replace with your actual Client ID

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
                sessionStorage.setItem('token', data.token);
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
                body: JSON.stringify({ token: credentialResponse.credential }),
            });

            const data = await response.json();

            if (data.success) {
                sessionStorage.setItem('token', data.token);
                login();
                navigate('/dashboard');
            } else {
                setError(data.message || 'Google login failed.');
            }
        } catch (error) {
            console.error('Error during Google login:', error);
            setError('An error occurred during Google login.');
        }
    };

    const handleGoogleLoginError = () => {
        setError('Google login was unsuccessful. Please try again.');
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="login-box">
                <h2>Login to open your Account</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Institutional Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group password-group">
                        <input
                            type={isPasswordVisible ? 'text' : 'password'} // Toggle password visibility
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <span 
                            className="password-toggle" 
                            onClick={togglePasswordVisibility}
                        >
                            {/* Use image for eye toggle */}
                            <img 
                                src={isPasswordVisible ? seenIcon : hideIcon}
                                alt="Toggle password visibility"
                                className="eye-icon"
                            />
                        </span>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <div className="forgot-password">
                        <Link to="/forgot-password">Forgot password?</Link>
                    </div>

                    <div className="separator">
                        <span>OR</span>
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
                                Login with Google
                            </button>
                        )}
                    />

                    <div className="extra-options">
                        <p>
                            Don’t have an account? <Link to="/select-user-type">Register here</Link>
                        </p>
                    </div>
                </form>
            </div>
        </GoogleOAuthProvider>
    );
};

export default Login;
