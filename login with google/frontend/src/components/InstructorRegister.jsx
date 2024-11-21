import React, { useState } from 'react';
import { registerInstructor } from '../api';
import { useNavigate } from 'react-router-dom';

const InstructorRegister = () => {
    const [formData, setFormData] = useState({
        instructor_id: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        contact_number: '',
        birthday: '',
        gender: '',
        department: '',
        position: '',
        profile_picture: ''
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
            const result = await registerInstructor(formData);
            if (result) {
                navigate('/login');
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Form fields for instructor registration */}
            <input type="text" name="instructor_id" placeholder="Instructor ID" onChange={handleChange} required />
            <input type="text" name="first_name" placeholder="First Name" onChange={handleChange} required />
            <input type="text" name="last_name" placeholder="Last Name" onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <input type="text" name="contact_number" placeholder="Contact Number" onChange={handleChange} required />
            <input type="date" name="birthday" onChange={handleChange} required />
            <input type="text" name="gender" placeholder="Gender" onChange={handleChange} required />
            <input type="text" name="department" placeholder="Department" onChange={handleChange} required />
            <input type="text" name="position" placeholder="Position" onChange={handleChange} required />
            
            {errorMessage && <div className="error">{errorMessage}</div>}

            <button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
            </button>
        </form>
    );
};

export default InstructorRegister;