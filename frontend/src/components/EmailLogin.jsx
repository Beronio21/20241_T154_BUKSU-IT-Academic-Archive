import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EmailLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                const { user, token } = result.data;
                
                localStorage.setItem('user-info', JSON.stringify({
                    name: user.name,
                    email: user.email,
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
            setErrorMessage('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
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
            </form>
        </div>
    );
};

export default EmailLogin; 