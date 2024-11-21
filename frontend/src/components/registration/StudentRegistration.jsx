import React, { useState } from 'react';
import './Registration.css';

const StudentRegistration = () => {
    const [formData, setFormData] = useState({
        student_id: '',
        email: '',
        name: '',
        contact_number: '',
        location: '',
        birthday: '',
        gender: '',
        course: '',
        year: '',
        password: '',
        confirm_password: ''
    });

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        
        // Student ID validation (10 numbers)
        if (!/^\d{10}$/.test(formData.student_id)) {
            newErrors.student_id = 'Student ID must be 10 digits';
        }

        // Contact number validation
        if (!/^\d{11}$/.test(formData.contact_number)) {
            newErrors.contact_number = 'Contact number must be 11 digits';
        }

        // Required fields
        const requiredFields = ['name', 'location', 'birthday', 'gender', 'course', 'year'];
        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
            }
        });

        // Password validation
        if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match';
        }

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        
        if (Object.keys(validationErrors).length === 0) {
            // Submit form data
            console.log('Form submitted:', formData);
        } else {
            setErrors(validationErrors);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="registration-container">
            <h2>Student Registration</h2>
            <form onSubmit={handleSubmit} className="registration-form">
                <div className="form-group">
                    <label>Student ID</label>
                    <input
                        type="text"
                        name="student_id"
                        value={formData.student_id}
                        onChange={handleChange}
                        placeholder="Enter 10-digit Student ID"
                    />
                    {errors.student_id && <span className="error">{errors.student_id}</span>}
                </div>

                <div className="form-group">
                    <label>Contact Number</label>
                    <input
                        type="tel"
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleChange}
                        placeholder="Enter contact number"
                    />
                    {errors.contact_number && <span className="error">{errors.contact_number}</span>}
                </div>

                <div className="form-group">
                    <label>Location</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Enter your address"
                    />
                    {errors.location && <span className="error">{errors.location}</span>}
                </div>

                <div className="form-group">
                    <label>Birthday</label>
                    <input
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleChange}
                    />
                    {errors.birthday && <span className="error">{errors.birthday}</span>}
                </div>

                <div className="form-group">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    {errors.gender && <span className="error">{errors.gender}</span>}
                </div>

                <div className="form-group">
                    <label>Course</label>
                    <input
                        type="text"
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        placeholder="Enter your course"
                    />
                    {errors.course && <span className="error">{errors.course}</span>}
                </div>

                <div className="form-group">
                    <label>Year</label>
                    <select name="year" value={formData.year} onChange={handleChange}>
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                    </select>
                    {errors.year && <span className="error">{errors.year}</span>}
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                    />
                    {errors.password && <span className="error">{errors.password}</span>}
                </div>

                <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        placeholder="Confirm password"
                    />
                    {errors.confirm_password && <span className="error">{errors.confirm_password}</span>}
                </div>

                <button type="submit" className="submit-btn">Register</button>
            </form>
        </div>
    );
};

export default StudentRegistration; 