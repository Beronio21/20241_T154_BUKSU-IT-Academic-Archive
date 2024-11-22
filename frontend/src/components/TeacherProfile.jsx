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
        confirm_password: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isProfileComplete, setIsProfileComplete] = useState(false);

    useEffect(() => {
        fetchTeacherProfile();
    }, []);

    const fetchTeacherProfile = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            console.log('User Info:', userInfo);

            if (!userInfo?.token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('http://localhost:8080/api/teacher', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            console.log('Response status:', response.status);

            const data = await response.json();
            console.log('Profile data:', data);

            if (data.status === 'success') {
                setFormData(prev => ({
                    ...prev,
                    ...data.data
                }));
                setIsProfileComplete(data.isProfileComplete);
                setIsEditing(!data.isProfileComplete);
            } else {
                throw new Error(data.message);
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Profile fetch error:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('user-info'));
            const response = await fetch('http://localhost:8080/api/teacher', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    password: formData.password
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const data = await response.json();
            console.log('Profile updated:', data);
            // Handle successful update
        } catch (error) {
            console.error('Update error:', error);
            // Handle error
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="profile-container">
            <div className="profile-layout">
                {/* Profile Sidebar */}
                <div className="profile-sidebar">
                    <div className="profile-info-card">
                        <div className="profile-image">
                            <img src={formData.image || 'default-avatar.png'} alt="Profile" />
                        </div>
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
                    </div>
                </div>

                {/* Main Profile Content */}
                <div className="profile-content">
                    <div className="profile-header">
                        <h2>Teacher Profile</h2>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="edit-btn">
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Teacher ID</label>
                                <input
                                    type="text"
                                    name="teacher_id"
                                    value={formData.teacher_id || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="Format: T-YYYY-XXXX"
                                />
                            </div>

                            <div className="form-group">
                                <label>Department</label>
                                <select
                                    name="department"
                                    value={formData.department || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>
                                            {dept}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Contact Number</label>
                                <input
                                    type="text"
                                    name="contact_number"
                                    value={formData.contact_number}
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

                            {isEditing && (
                                <>
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Confirm Password</label>
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            value={formData.confirm_password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {isEditing && (
                            <div className="button-group">
                                <button type="submit" className="save-btn">
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => {
                                        setIsEditing(false);
                                        fetchTeacherProfile();
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TeacherProfile; 