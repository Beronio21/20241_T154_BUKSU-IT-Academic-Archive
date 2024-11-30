import React, { useState, useEffect } from 'react';
import '../Styles/StudentProfile.css';

const StudentProfile = () => {
    // Initialize all form fields with empty strings
    const initialFormState = {
        name: '',
        email: '',
        student_id: '',
        contact_number: '',
        location: '',
        birthday: '',
        gender: '',
        course: '',
        year: '',
        password: '',
        confirm_password: '',
        image: '',
        role: '',
        isProfileComplete: false
    };

    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [serverStatus, setServerStatus] = useState('checking');
    const [isEditing, setIsEditing] = useState(false);

    const checkServerConnection = async () => {
        try {
            const response = await fetch('http://localhost:8080/health');
            const data = await response.json();
            
            if (data.status === 'success') {
                setServerStatus('connected');
                setError(null);
                return true;
            } else {
                setServerStatus('error');
                setError('Server is not responding correctly');
                return false;
            }
        } catch (error) {
            console.error('Server connection error:', error);
            setServerStatus('error');
            setError('Cannot connect to server. Please check if the backend is running.');
            return false;
        }
    };

    const fetchUserProfile = async () => {
        try {
            // Check server connection first
            const isServerConnected = await checkServerConnection();
            if (!isServerConnected) return;

            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            if (!userInfo?.token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('http://localhost:8080/api/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch profile');
            }

            const data = await response.json();
            
            // Ensure all fields have at least empty string values
            const formattedData = {
                ...initialFormState, // Start with initial empty values
                ...data.data, // Override with actual data
                // Format date if it exists
                birthday: data.data.birthday 
                    ? new Date(data.data.birthday).toISOString().split('T')[0] 
                    : '',
                // Ensure password fields are empty when loading profile
                password: '',
                confirm_password: ''
            };

            setFormData(formattedData);
            setLoading(false);
            setError(null);
        } catch (error) {
            console.error('Profile fetch error:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
        
        // Set up periodic server checks
        const intervalId = setInterval(checkServerConnection, 30000); // Check every 30 seconds
        
        return () => clearInterval(intervalId);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value || '' // Ensure value is never undefined
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            if (!userInfo?.token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('http://localhost:8080/api/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    student_id: formData.student_id,
                    contact_number: formData.contact_number,
                    location: formData.location,
                    birthday: formData.birthday,
                    gender: formData.gender,
                    course: formData.course,
                    year: formData.year,
                    ...(formData.password && { password: formData.password })
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            const data = await response.json();
            setFormData(prev => ({
                ...prev,
                ...data.data,
                password: '',
                confirm_password: ''
            }));

            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Update error:', error);
            alert(error.message || 'Failed to update profile');
        }
    };

    return (
        <div className="profile-container">
            {/* Server Status Indicator */}
            <div className={`server-status ${serverStatus}`}>
                {serverStatus === 'checking' && 'Checking server connection...'}
                {serverStatus === 'connected' && 'Server Connected'}
                {serverStatus === 'error' && 'Server Connection Error'}
            </div>

            {loading ? (
                <div className="loading">Loading profile data...</div>
            ) : error ? (
                <div className="error-message">
                    {error}
                    <button onClick={fetchUserProfile}>Retry</button>
                </div>
            ) : (
                <div className="profile-layout">
                    {/* Side Profile Info */}
                    <div className="profile-sidebar">
                        <div className="profile-info-card">
                            <h3>Profile Information</h3>
                            <div className="info-item">
                                <label>Name:</label>
                                <span>{formData.name || 'Not set'}</span>
                            </div>
                            <div className="info-item">
                                <label>Email:</label>
                                <span>{formData.email || 'Not set'}</span>
                            </div>
                            <div className="info-item">
                                <label>Student ID:</label>
                                <span>{formData.student_id || 'Not set'}</span>
                            </div>
                            <div className="info-item">
                                <label>Contact:</label>
                                <span>{formData.contact_number || 'Not set'}</span>
                            </div>
                            <div className="info-item">
                                <label>Location:</label>
                                <span>{formData.location || 'Not set'}</span>
                            </div>
                            <div className="info-item">
                                <label>Birthday:</label>
                                <span>{formData.birthday || 'Not set'}</span>
                            </div>
                            <div className="info-item">
                                <label>Gender:</label>
                                <span>{formData.gender || 'Not set'}</span>
                            </div>
                            <div className="info-item">
                                <label>Course:</label>
                                <span>{formData.course || 'Not set'}</span>
                            </div>
                            <div className="info-item">
                                <label>Year:</label>
                                <span>{formData.year || 'Not set'}</span>
                            </div>
                            <div className="info-item">
                                <label>Profile Status:</label>
                                <span className={formData.isProfileComplete ? 'complete' : 'incomplete'}>
                                    {formData.isProfileComplete ? 'Complete' : 'Incomplete'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Existing Form Content */}
                    <div className="profile-content">
                        <div className="profile-header">
                            <h2>Student Profile</h2>
                            {!isEditing && (
                                <button 
                                    className="edit-btn"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Student ID</label>
                                    <input
                                        type="text"
                                        name="student_id"
                                        value={formData.student_id || ''} // Ensure value is never undefined
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Contact Number</label>
                                    <input
                                        type="text"
                                        name="contact_number"
                                        value={formData.contact_number || ''} // Ensure value is never undefined
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Birthday</label>
                                    <input
                                        type="date"
                                        name="birthday"
                                        value={formData.birthday}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Course</label>
                                    <input
                                        type="text"
                                        name="course"
                                        value={formData.course}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Year</label>
                                    <input
                                        type="number"
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirm_password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="form-group">
                                    <button type="submit" disabled={!isEditing}>
                                        {isEditing ? 'Save Changes' : 'Edit Profile'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProfile; 