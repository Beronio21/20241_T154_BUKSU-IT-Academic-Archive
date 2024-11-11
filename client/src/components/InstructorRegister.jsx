import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../styles/Register.css'; // Make sure to point to the correct CSS file

// Import images
import logo from '../images/buksulogo.png';
import leftImage from '../images/login1.png';
import googleLogo from '../images/google.jpg';

const InstructorRegister = () => {
    const [employeeId, setEmployeeId] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [department, setDepartment] = useState('');
    const [position, setPosition] = useState('');
    const [gender, setGender] = useState('');
    const [birthday, setBirthday] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

<<<<<<< HEAD
=======
        // Simple form validation
        if (!email || !password || !firstName || !lastName || !contactNumber || !gender || !birthday || !department || !position) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

>>>>>>> INTEGRATION
        try {
            const response = await fetch('http://localhost:5000/api/instructors', { // Adjusted endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    instructor_id: employeeId, // Ensure to match your backend schema
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password_hash: password, // Assuming you will hash it in the backend
                    contact_number: contactNumber,
                    department,
                    position,
                    gender,
                    birthday,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token); // Assuming you return a token
<<<<<<< HEAD
                login();
                navigate('/dashboard'); // Redirect to dashboard
=======
                login(); // Login the user after registration
                navigate('/dashboard'); // Redirect to the dashboard
>>>>>>> INTEGRATION
            } else {
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
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
                    <h1>Your Research Our Platform Register and Begin.</h1>
                    <div className="image-box">
                        <img src={leftImage} alt="Left side image" />
                    </div>
                    <h2>Redefining Academic Submissions for a Digital Age.</h2>
                </div>

                <div className="login-box">
                    <h1>ThesEase</h1>
                    <h2>Instructor Register</h2>
                    {error && <p className="error-message">{error}</p>}
                    <form onSubmit={handleRegister}>
                        <div className="input-group">
                            <input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="Employee ID" required />
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
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
                        </div>
                        <div className="input-group">
                            <input type="text" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="Contact Number" required />
                        </div>
                        <div className="input-group">
                            <input type="text" value={gender} onChange={(e) => setGender(e.target.value)} placeholder="Gender (e.g., Male, Female)" required />
                        </div>
                        <div className="input-group">
                            <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department" required />
                        </div>
                        <div className="input-group">
                            <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Position" required />
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Registering...' : 'Register'}
                        </button>

                        <div className="separator">
                            <span>or</span>
                        </div>

<<<<<<< HEAD
                        <button type="button" className="google-btn">
=======
                        <button type="button" className="google-btn" onClick={() => window.location.href = '/api/auth/google'}>
>>>>>>> INTEGRATION
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

export default InstructorRegister;
