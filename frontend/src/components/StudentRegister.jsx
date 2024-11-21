import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentRegister = () => {
    const [formData, setFormData] = useState({
        student_id: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        contact_number: '',
        gender: '',
        birthday: '',
        department: '',
        course: '',
        year_level: ''
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/students/register', formData);
            if (response.data.message === 'Student registered successfully') {
                navigate('/login'); // Redirect to login page after successful registration
            }
        } catch (error) {
            console.error('Registration error:', error);
            setErrorMessage(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2>Student Registration</h2>
            <form onSubmit={handleSubmit}>
                {/* Form fields for student registration */}
                <input type="text" name="student_id" placeholder="Student ID" onChange={handleChange} required />
                <input type="text" name="first_name" placeholder="First Name" onChange={handleChange} required />
                <input type="text" name="last_name" placeholder="Last Name" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <input type="text" name="contact_number" placeholder="Contact Number" onChange={handleChange} required />
                <input type="text" name="gender" placeholder="Gender" onChange={handleChange} required />
                <input type="date" name="birthday" placeholder="Birthday" onChange={handleChange} required />
                <input type="text" name="department" placeholder="Department" onChange={handleChange} required />
                <input type="text" name="course" placeholder="Course" onChange={handleChange} required />
                <input type="number" name="year_level" placeholder="Year Level" onChange={handleChange} required />
                
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
};

export default StudentRegister;