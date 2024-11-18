import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Modal.css';

const CreateStudentForm = ({ onClose, onStudentCreated }) => {
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/students/register', formData);
            alert('Student registered successfully!');
            onStudentCreated(); // Refresh the student list
            onClose(); // Close the modal
        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Register New Student</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Student ID<span className="required">*</span></label>
                            <input
                                type="text"
                                name="student_id"
                                value={formData.student_id}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>First Name<span className="required">*</span></label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Last Name<span className="required">*</span></label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email<span className="required">*</span></label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password<span className="required">*</span></label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Contact Number<span className="required">*</span></label>
                            <input
                                type="text"
                                name="contact_number"
                                value={formData.contact_number}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Gender<span className="required">*</span></label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Birthday<span className="required">*</span></label>
                            <input
                                type="date"
                                name="birthday"
                                value={formData.birthday}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Department<span className="required">*</span></label>
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Course<span className="required">*</span></label>
                            <input
                                type="text"
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Year Level<span className="required">*</span></label>
                            <input
                                type="number"
                                name="year_level"
                                value={formData.year_level}
                                onChange={handleChange}
                                min="1"
                                max="5"
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button 
                            type="button" 
                            className="cancel-button" 
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="submit-button" 
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Register Student'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateStudentForm; 