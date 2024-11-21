import React, { useState } from 'react';
import { registerAdmin } from '../api';
import { useNavigate } from 'react-router-dom';

const AdminRegister = () => {
    const [adminData, setAdminData] = useState({
        admin_id: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        contact_number: ''
    });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setAdminData({ ...adminData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            const result = await registerAdmin(adminData);
            if (result.message === 'Admin created successfully') {
                navigate('/admin-dashboard');
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="admin_id" placeholder="Admin ID" onChange={handleChange} required />
            <input type="text" name="first_name" placeholder="First Name" onChange={handleChange} required />
            <input type="text" name="last_name" placeholder="Last Name" onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <input type="text" name="contact_number" placeholder="Contact Number" onChange={handleChange} required />
            {errorMessage && <div>{errorMessage}</div>}
            <button type="submit">Register</button>
        </form>
    );
};

export default AdminRegister;