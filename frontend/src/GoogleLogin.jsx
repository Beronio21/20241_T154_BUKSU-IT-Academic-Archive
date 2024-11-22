import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth, emailLogin } from "./api";
import { useNavigate } from 'react-router-dom';
import React from "react";
import './App.css';
import ReCAPTCHA from "react-google-recaptcha";

const GoogleLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);

        if (!recaptchaToken) {
            setErrorMessage('Please complete the reCAPTCHA.');
            setLoading(false);
            return;
        }

        try {

             // Send the recaptchaToken to your server for verification
             const response = await fetch('http://localhost:8080/api/verify-recaptcha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ recaptchaToken }),
            });

            const recaptchaData = await response.json();

            if (!recaptchaData.success) {
                setErrorMessage('reCAPTCHA verification failed. Please try again.');
                setLoading(false);
                return;
            }

            const result = await emailLogin(email, password);
            
            if (result.status === 'success') {
                const { user, token } = result.data;
                
                localStorage.setItem('user-info', JSON.stringify({
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                    token
                }));

                switch(user.role) {
                    case 'student':
                        navigate('/student-dashboard');
                        break;
                    case 'teacher':
                        navigate('/teacher-dashboard');
                        break;
                    case 'admin':
                        navigate('/admin-dashboard');
                        break;
                    default:
                        setErrorMessage('Invalid user role');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage(
                error.response?.data?.message || 
                'Invalid email or password'
            );
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                console.log('Google response:', tokenResponse);
                
                const result = await googleAuth(tokenResponse.access_token);
                console.log('Auth result:', result);
                
                if (result.status === 'success') {
                    const { user, token } = result.data;
                    
                    localStorage.setItem('user-info', JSON.stringify({
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: user.role,
                        token
                    }));

                    switch(user.role) {
                        case 'student':
                            navigate('/student-dashboard');
                            break;
                        case 'teacher':
                            navigate('/teacher-dashboard');
                            break;
                        case 'admin':
                            navigate('/admin-dashboard');
                            break;
                        default:
                            setErrorMessage('Invalid user role');
                    }
                }
            } catch (error) {
                console.error('Login error:', error);
                setErrorMessage(
                    error.response?.data?.message || 
                    'Failed to login. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        },
        onError: (error) => {
            console.error('Google login error:', error);
            setErrorMessage('Google login failed');
            setLoading(false);
        },
        scope: 'email profile',
    });

    return (
        <section className="background-radial-gradient overflow-hidden">
            <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
                <div className="row gx-lg-5 align-items-center mb-5">
                    <div className="col-lg-6 mb-5 mb-lg-0" style={{ zIndex: 10 }}>
                        <h1 className="my-5 display-5 fw-bold ls-tight" style={{ color: 'hsl(218, 81%, 95%)' }}>
                            Online Submission and <br />
                            <span style={{ color: 'hsl(218, 81%, 75%)' }}>Review System</span>
                        </h1>
                        <p className="mb-4 opacity-70" style={{ color: 'hsl(218, 81%, 85%)' }}>
                            Welcome to the Online Thesis Submission and Review System
                        </p>
                    </div>

                    <div className="col-lg-6 mb-5 mb-lg-0 position-relative">
                        <div id="radius-shape-1" className="position-absolute rounded-circle shadow-5-strong"></div>
                        <div id="radius-shape-2" className="position-absolute shadow-5-strong"></div>

                        <div className="card bg-glass">
                            <div className="card-body px-4 py-5 px-md-5">
                                <form onSubmit={handleSubmit}>

                                    {/* Email input */}
                                    <div className="form-outline mb-4">
                                        <input
                                            type="email"
                                            id="form3Example3"
                                            className="form-control"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="Enter your email"
                                        />
                                        <label className="form-label" htmlFor="form3Example3">
                                            Email address
                                        </label>
                                    </div>

                                    {/* Password input */}
                                    <div className="form-outline mb-4">
                                        <input
                                            type="password"
                                            id="form3Example4"
                                            className="form-control"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="Enter your password"
                                        />
                                        <label className="form-label" htmlFor="form3Example4">
                                            Password
                                        </label>
                                    </div>

                                    {/* Error message */}
                                    {errorMessage && (
                                        <div className="alert alert-danger" role="alert">
                                            {errorMessage}
                                        </div>
                                    )}

                                        <div className="d-flex justify-content-center mb-4">
                                        <ReCAPTCHA
                                            sitekey="6LfREoYqAAAAABFQTQf5IG6SVrRmgcyz5p-C1gls"
                                            onChange={(token) => setRecaptchaToken(token)}
                                        />
                                    </div>

                                    {/* Submit button */}
                                    <div className="d-flex justify-content-center mb-4">
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary w-100"
                                            disabled={loading}
                                        >
                                            {loading ? 'Logging in...' : 'Log In'}
                                        </button>
                                    </div>

                                    {/* Social media sign-in buttons */}
                                    <div className="text-center">
                                        <p>or sign up with:</p>
                                            {/* Google Sign-in Button */}
                                        <button
                                            type="button"
                                            className="btn btn-primary mb-4 w-100" // Added w-100 class here
                                            onClick={googleLogin}
                                            disabled={loading}
                                        >
                                            Sign in with Google<i className="bi bi-google me-2"></i> {/* Google Icon */}
                                        </button>

                                        {/* Registration buttons */}
                                        <div className="d-flex justify-content-between">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => navigate('/student-register')}
                                            >
                                                Register as Student
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => navigate('/instructor-register')}
                                            >
                                                Register as Instructor
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => navigate('/admin-register')}
                                            >
                                                Register as Admin
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GoogleLogin;