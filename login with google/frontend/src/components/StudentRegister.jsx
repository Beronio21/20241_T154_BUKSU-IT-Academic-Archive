import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerStudent } from '../api'; // Assume you have an API function to handle registration

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
        year_level: 1
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);

        try {
            const result = await registerStudent(formData);
            if (result.status === 'success') {
                navigate('/student-dashboard');
            } else {
                setErrorMessage('Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setErrorMessage(
                error.response?.data?.message || 
                'Failed to register. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <h2>Student Registration</h2>
            <form onSubmit={handleSubmit}>
                {/* Form fields for student registration */}
                <input type="text" name="student_id" placeholder="Student ID" value={formData.student_id} onChange={handleChange} required />
                <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required />
                <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                <input type="text" name="contact_number" placeholder="Contact Number" value={formData.contact_number} onChange={handleChange} required />
                <input type="text" name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} required />
                <input type="date" name="birthday" placeholder="Birthday" value={formData.birthday} onChange={handleChange} required />
                <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} required />
                <input type="text" name="course" placeholder="Course" value={formData.course} onChange={handleChange} required />
                <input type="number" name="year_level" placeholder="Year Level" value={formData.year_level} onChange={handleChange} required />

                {/* Error message */}
                {errorMessage && <div className="error">{errorMessage}</div>}

                {/* Submit button */}
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
};

export default StudentRegister; 