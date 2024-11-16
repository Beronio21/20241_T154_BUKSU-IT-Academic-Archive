import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../styles/Register.css'; // Ensure this is the correct path for your CSS

// Import images
import logo from '../images/buksulogo.png';
import leftImage from '../images/login1.png';
import googleLogo from '../images/google.jpg';

const AdminRegister = () => {
    const [adminId, setAdminId] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [gender, setGender] = useState('');
    const [birthday, setBirthday] = useState('');
    const [role, setRole] = useState('admin'); // Default to 'admin'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic input validation
        if (!adminId || !firstName || !lastName || !email || !contactNumber || !gender || !birthday) {
            setError('Please fill in all required fields.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/admins/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    admin_id: adminId,
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password: password ? password : undefined, // Send password only if provided
                    contact_number: contactNumber,
                    gender,
                    birthday,
                    role,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                login();
                navigate('/admin-dashboard');
            } else {
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error("Registration error:", error);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="logo">
                <img src={logo} alt="ThesEase Logo" />
            </div>

            <div className="login-container">
                <div className="left-section">
                    <h1>Your Research, Our Platform. Register and Begin.</h1>
                    <div className="image-box">
                        <img src={leftImage} alt="Left side image" />
                    </div>
                    <h2>Redefining Academic Submissions for a Digital Age.</h2>
                </div>

                <div className="login-box">
                    <h1>ThesEase</h1>
                    <h2>Admin Register</h2>
                    {error && <p className="error-message">{error}</p>}
                    <form onSubmit={handleRegister}>
                        <div className="input-group">
                            <input type="text" value={adminId} onChange={(e) => setAdminId(e.target.value)} placeholder="Admin ID" required />
                        </div>
                        <div className="input-group">
                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" required />
                        </div>
                        <div className="input-group">
                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" required />
                        </div>
                        <div className="input-group">
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
                        </div>
                        <div className="input-group">
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (optional)" />
                        </div>
                        <div className="input-group">
                            <input type="text" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="Contact Number" required />
                        </div>
                        <div className="input-group">
                            <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                                <option value="" disabled>Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" required />
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Registering...' : 'Register'}
                        </button>

                        <div className="separator">
                            <span>or</span> 
                        </div>

                        <button type="button" className="google-btn">
                            <img src={googleLogo} alt="Google Logo" />
                            Register with Google
                        </button>

                        <div className="extra-options">
                            <p>Already have an account? <Link to="/login">Login</Link></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminRegister;
