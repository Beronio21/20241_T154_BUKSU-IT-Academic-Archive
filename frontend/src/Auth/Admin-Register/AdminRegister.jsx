import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminRegister = () => {
    const [formData, setFormData] = useState({
        adminId: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        contactNumber: '',
        role: 'admin'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registration successful!');
                navigate('/login');
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
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8 col-md-10">
                    <div className="card border-0 shadow-lg rounded-4">
                        <div className="card-header bg-primary text-white text-center py-3 rounded-top">
                            <h2 className="fw-bold mb-0">Admin Registration</h2>
                        </div>
                        <div className="card-body p-4">
                            {error && (
                                <div className="alert alert-danger text-center" role="alert">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                                <div className="row g-4">
                                    {/* Admin ID */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Admin ID</label>
                                        <input
                                            type="text"
                                            className="form-control shadow-sm rounded"
                                            name="adminId"
                                            placeholder="Enter Admin ID"
                                            value={formData.adminId}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    {/* Name */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Name</label>
                                        <input
                                            type="text"
                                            className="form-control shadow-sm rounded"
                                            name="name"
                                            placeholder="Enter Full Name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    {/* Email */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Email</label>
                                        <input
                                            type="email"
                                            className="form-control shadow-sm rounded"
                                            name="email"
                                            placeholder="Enter Email Address"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    {/* Contact Number */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Contact Number</label>
                                        <input
                                            type="text"
                                            className="form-control shadow-sm rounded"
                                            name="contactNumber"
                                            placeholder="Enter Contact Number"
                                            value={formData.contactNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {/* Password */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Password</label>
                                        <input
                                            type="password"
                                            className="form-control shadow-sm rounded"
                                            name="password"
                                            placeholder="Enter Password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    {/* Confirm Password */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Confirm Password</label>
                                        <input
                                            type="password"
                                            className="form-control shadow-sm rounded"
                                            name="confirmPassword"
                                            placeholder="Re-enter Password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                {/* Submit Button */}
                                <div className="d-grid mt-4">
                                    <button
                                        type="submit"
                                        className="btn btn-primary fw-bold shadow rounded"
                                        disabled={loading}
                                    >
                                        {loading ? 'Registering...' : 'Register'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRegister;
