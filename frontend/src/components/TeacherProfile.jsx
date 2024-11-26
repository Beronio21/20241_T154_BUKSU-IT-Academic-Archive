import React, { useState, useEffect } from 'react';
import './TeacherProfile.css';

const departments = [
    'Computer Science',
    'Information Technology',
    'Information Systems',
    'Computer Engineering',
    'Software Engineering'
];

const TeacherProfile = () => {
    const initialFormState = {
        name: '',
        email: '',
        teacher_id: '',
        contact_number: '',
        location: '',
        birthday: '',
        gender: '',
        department: '',
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

    const fetchTeacherProfile = async () => {
        try {
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
            
            const formattedData = {
                ...initialFormState,
                ...data.data,
                teacher_id: data.data.teacher_id,
                birthday: data.data.birthday 
                    ? new Date(data.data.birthday).toISOString().split('T')[0] 
                    : '',
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
        fetchTeacherProfile();
        
        const intervalId = setInterval(checkServerConnection, 30000);
        
        return () => clearInterval(intervalId);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value || ''
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
                    teacher_id: formData.teacher_id,
                    contact_number: formData.contact_number,
                    location: formData.location,
                    birthday: formData.birthday,
                    gender: formData.gender,
                    department: formData.department,
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
                    <button onClick={fetchTeacherProfile}>Retry</button>
                </div>
            ) : (
                <div className="profile-layout">
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
                                <label>Teacher ID:</label>
                                <span>{formData.teacher_id || 'Not set'}</span>
                            </div>
                            <div className="info-item">
                                <label>Department:</label>
                                <span>{formData.department || 'Not set'}</span>
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
                                <label>Profile Status:</label>
                                <span className={formData.isProfileComplete ? 'complete' : 'incomplete'}>
                                    {formData.isProfileComplete ? 'Complete' : 'Incomplete'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="profile-content">
                        <div className="profile-header">
                            <h2>Teacher Profile</h2>
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
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Teacher ID</label>
                                    <input
                                        type="text"
                                        name="teacher_id"
                                        value={formData.teacher_id || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Contact Number</label>
                                    <input
                                        type="text"
                                        name="contact_number"
                                        value={formData.contact_number || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Birthday</label>
                                    <input
                                        type="date"
                                        name="birthday"
                                        value={formData.birthday || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender || ''}
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
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirm_password"
                                        value={formData.confirm_password || ''}
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

export default TeacherProfile; 