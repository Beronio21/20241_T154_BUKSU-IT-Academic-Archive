import React, { useState, useEffect } from 'react';
import '../Styles/TeacherProfile.css';
import { Modal } from 'react-bootstrap';

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
        <div className="container-fluid py-2 px-4" style={{ backgroundColor: '#f8f9fa', height: '100vh', overflow: 'hidden' }}>
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
                <div className="row g-2" style={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
                    {/* Left Column */}
                    <div className="col-lg-4">
                        {/* Profile Card */}
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
                            <div className="card-body p-0">
                                <div className="bg-primary bg-gradient p-3 text-white text-center">
                                    <div className="position-relative d-inline-block mb-2">
                                        <img 
                                            src={formData.image || 'https://via.placeholder.com/150'} 
                                            alt={formData.name}
                                            className="rounded-circle border border-4 border-white shadow"
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </div>
                                    <h5 className="mb-1">{formData.name}</h5>
                                    <p className="mb-1 opacity-75">
                                        <i className="bi bi-person-workspace me-1"></i>
                                        {formData.role || 'Teacher'}
                                    </p>
                                </div>
                                <div className="p-3">
                                    <div className="d-grid gap-2">
                                        {!isEditing && (
                                            <button 
                                                className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                                Edit Profile
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Card */}
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-body p-4">
                                <h5 className="card-title d-flex align-items-center mb-3">
                                    <i className="bi bi-person-lines-fill me-2 text-primary"></i>
                                    Contact Information
                                </h5>
                                <div className="vstack gap-3">
                                    {/* Contact Details */}
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-4 bg-primary bg-opacity-10 p-2">
                                            <i className="bi bi-telephone-fill text-primary fs-5"></i>
                                        </div>
                                        <div className="ms-3">
                                            <small className="text-muted text-uppercase">Phone</small>
                                            <div className="fw-medium">{formData.contact_number || 'Not set'}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-4 bg-primary bg-opacity-10 p-2">
                                            <i className="bi bi-geo-alt-fill text-primary fs-5"></i>
                                        </div>
                                        <div className="ms-3">
                                            <small className="text-muted text-uppercase">Location</small>
                                            <div className="fw-medium">{formData.location || 'Not set'}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-4 bg-primary bg-opacity-10 p-2">
                                            <i className="bi bi-envelope-fill text-primary fs-5"></i>
                                        </div>
                                        <div className="ms-3">
                                            <small className="text-muted text-uppercase">Email</small>
                                            <div className="fw-medium">{formData.email || 'Not set'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-lg-8">
                        {/* Academic Information Card */}
                        <div className="card border-0 shadow-sm rounded-4 mb-3">
                            <div className="card-body p-4">
                                <h5 className="card-title d-flex align-items-center mb-3">
                                    <i className="bi bi-mortarboard-fill me-2 text-primary"></i>
                                    Academic Information
                                </h5>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-4 bg-primary bg-opacity-10 p-2">
                                                <i className="bi bi-person-badge-fill text-primary fs-5"></i>
                                            </div>
                                            <div className="ms-3">
                                                <small className="text-muted text-uppercase">Teacher ID</small>
                                                <div className="fw-medium">{formData.teacher_id || 'Not set'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-4 bg-primary bg-opacity-10 p-2">
                                                <i className="bi bi-building-fill text-primary fs-5"></i>
                                            </div>
                                            <div className="ms-3">
                                                <small className="text-muted text-uppercase">Department</small>
                                                <div className="fw-medium">{formData.department || 'Not set'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Details Card */}
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-body p-4">
                                <h5 className="card-title d-flex align-items-center mb-3">
                                    <i className="bi bi-person-fill me-2 text-primary"></i>
                                    Personal Details
                                </h5>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-4 bg-primary bg-opacity-10 p-2">
                                                <i className="bi bi-calendar-event-fill text-primary fs-5"></i>
                                            </div>
                                            <div className="ms-3">
                                                <small className="text-muted text-uppercase">Birthday</small>
                                                <div className="fw-medium">{formData.birthday || 'Not set'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-4 bg-primary bg-opacity-10 p-2">
                                                <i className="bi bi-gender-ambiguous text-primary fs-5"></i>
                                            </div>
                                            <div className="ms-3">
                                                <small className="text-muted text-uppercase">Gender</small>
                                                <div className="fw-medium">{formData.gender || 'Not set'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Profile Modal */}
            <Modal show={isEditing} onHide={() => setIsEditing(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
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
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default TeacherProfile; 