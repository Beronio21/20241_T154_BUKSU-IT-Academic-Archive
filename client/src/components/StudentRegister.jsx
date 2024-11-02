import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../styles/Register.css'; // Change to Register.css

// Import images
import logo from '../images/buksulogo.png';
import leftImage from '../images/login1.png';
import googleLogo from '../images/google.jpg';

const Register = () => {
    const [studentId, setStudentId] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [gender, setGender] = useState('');
    const [birthday, setBirthday] = useState('');
    const [department, setDepartment] = useState('');
    const [course, setCourse] = useState('');
    const [yearLevel, setYearLevel] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/students/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    student_id: studentId,
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password, // Sending unhashed password; hashing is handled in backend
                    contact_number: contactNumber,
                    gender,
                    birthday,
                    department,
                    course,
                    year_level: yearLevel,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                login();
                navigate('/dashboard');
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
            {/* Logo */}
            <div className="logo">
                <img src={logo} alt="ThesEase Logo" />
            </div>

            <div className="login-container">
                {/* Left section */}
                <div className="left-section">
                    <h1>Your Research Our Platform Register and Begin.</h1>
                    <div className="image-box">
                        <img src={leftImage} alt="Left side image" />
                    </div>
                    <h2>Redefining Academic Submissions for a Digital Age.</h2>
                </div>

                {/* Register Box */}
                <div className="login-box">
                    <h1>ThesEase</h1>
                    <h2>Register</h2>
                    {error && <p className="error-message">{error}</p>}
                    <form onSubmit={handleRegister}>
                        <div className="input-group">
                            <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Student ID" required />
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
                            <input type="text" value={gender} onChange={(e) => setGender(e.target.value)} placeholder="Gender" required />
                        </div>
                        <div className="input-group">
                            <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department" required />
                        </div>
                        <div className="input-group">
                            <input type="text" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="Course" required />
                        </div>
                        <div className="input-group">
                            <input type="text" value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} placeholder="Year Level" required />
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

export default Register;
