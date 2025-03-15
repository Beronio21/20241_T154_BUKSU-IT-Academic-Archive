import React, { useState, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Modal from 'react-bootstrap/Modal';

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
        isProfileComplete: false,
        facebook: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [serverStatus, setServerStatus] = useState('checking');
    const [isEditing, setIsEditing] = useState(false);
    const [showModal, setShowModal] = useState(false);

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
                    facebook: formData.facebook,
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
            <div className="row mb-2">
                <div className="col-12">
                    <div className={`alert ${serverStatus === 'connected' ? 'alert-success' : 'alert-warning'} 
                        d-flex align-items-center justify-content-between shadow-sm rounded-4 mb-0`}>
                        <div className="d-flex align-items-center">
                            <i className={`bi ${serverStatus === 'connected' ? 'bi-wifi' : 'bi-wifi-off'} fs-5 me-2`}></i>
                            <span>{serverStatus === 'connected' ? 'Server Connected' : 'Connection Error'}</span>
                        </div>
                        {serverStatus === 'error' && (
                            <button className="btn btn-sm btn-outline-warning" onClick={checkServerConnection}>
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                Retry
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="spinner-grow text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="alert alert-danger rounded-4 shadow-sm">
                    <div className="d-flex align-items-center">
                        <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                        <div className="flex-grow-1">{error}</div>
                        <button className="btn btn-danger ms-3" onClick={fetchTeacherProfile}>
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            Retry
                        </button>
                    </div>
                </div>
            ) : (
                <div className="row g-2" style={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
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
                                                onClick={() => setShowModal(true)}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                                Edit Profile
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm rounded-4 mt-2">
                            <div className="card-body p-3">
                                <h5 className="card-title d-flex align-items-center mb-2">
                                    <i className="bi bi-person-lines-fill me-2 text-primary"></i>
                                    Contact Information
                                </h5>
                                <div className="vstack gap-2">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-4 bg-primary bg-opacity-10 p-2">
                                            <i className="bi bi-telephone-fill text-primary fs-5"></i>
                                        </div>
                                        <div className="ms-2">
                                            <small className="text-muted text-uppercase">Phone</small>
                                            <div className="fw-medium">
                                                {formData.contact_number || 'Not set'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-4 bg-primary bg-opacity-10 p-2">
                                            <i className="bi bi-geo-alt-fill text-primary fs-5"></i>
                                        </div>
                                        <div className="ms-2">
                                            <small className="text-muted text-uppercase">Location</small>
                                            <div className="fw-medium">
                                                {formData.location || 'Not set'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-4 bg-primary bg-opacity-10 p-2">
                                            <i className="bi bi-facebook text-primary fs-5"></i>
                                        </div>
                                        <div className="ms-2 flex-grow-1">
                                            <small className="text-muted text-uppercase">Facebook</small>
                                            <div className="fw-medium">
                                                {formData.facebook ? (
                                                    <a 
                                                        href={formData.facebook.startsWith('http') ? formData.facebook : `https://${formData.facebook}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="d-inline-flex align-items-center text-decoration-none px-3 py-2 rounded-pill"
                                                        style={{
                                                            backgroundColor: 'rgba(24, 119, 242, 0.1)',
                                                            color: '#1877F2',
                                                            transition: 'all 0.3s ease',
                                                            maxWidth: '250px',
                                                            border: '1px solid rgba(24, 119, 242, 0.2)'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.backgroundColor = 'rgba(24, 119, 242, 0.15)';
                                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(24, 119, 242, 0.2)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.backgroundColor = 'rgba(24, 119, 242, 0.1)';
                                                            e.currentTarget.style.transform = 'none';
                                                            e.currentTarget.style.boxShadow = 'none';
                                                        }}
                                                    >
                                                        <span className="text-truncate" style={{ maxWidth: '180px' }}>
                                                            {formData.facebook.replace(/^https?:\/\/(www\.)?(facebook\.com\/)?/, '')}
                                                        </span>
                                                        <i className="bi bi-box-arrow-up-right ms-2 opacity-75"></i>
                                                    </a>
                                                ) : (
                                                    <span className="text-muted fst-italic d-flex align-items-center">
                                                        <i className="bi bi-dash-circle me-1"></i>
                                                        Not connected
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-body p-4">
                                <h5 className="card-title d-flex align-items-center mb-3">
                                    <i className="bi bi-mortarboard-fill me-2 text-primary"></i>
                                    Academic Information
                                </h5>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-4 bg-primary bg-opacity-10 p-2">
                                                <i className="bi bi-person-badge-fill text-primary fs-5"></i>
                                            </div>
                                            <div className="ms-2">
                                                <small className="text-muted text-uppercase">Teacher ID</small>
                                                <div className="fw-medium">
                                                    {formData.teacher_id || 'Not set'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-4 bg-primary bg-opacity-10 p-2">
                                                <i className="bi bi-building-fill text-primary fs-5"></i>
                                            </div>
                                            <div className="ms-2">
                                                <small className="text-muted text-uppercase">Department</small>
                                                <div className="fw-medium">
                                                    {formData.department || 'Not set'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-4 bg-primary bg-opacity-10 p-2">
                                                <i className="bi bi-envelope-fill text-primary fs-5"></i>
                                            </div>
                                            <div className="ms-2">
                                                <small className="text-muted text-uppercase">Email</small>
                                                <div className="fw-medium">
                                                    {formData.email || 'Not set'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-body p-4">
                                <h5 className="card-title d-flex align-items-center mb-3">
                                    <i className="bi bi-person-fill me-2 text-primary"></i>
                                    Personal Details
                                </h5>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-4 bg-primary bg-opacity-10 p-2">
                                                <i className="bi bi-calendar-event-fill text-primary fs-5"></i>
                                            </div>
                                            <div className="ms-2">
                                                <small className="text-muted text-uppercase">Birthday</small>
                                                <div className="fw-medium">
                                                    {formData.birthday || 'Not set'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-4 bg-primary bg-opacity-10 p-2">
                                                <i className="bi bi-gender-ambiguous text-primary fs-5"></i>
                                            </div>
                                            <div className="ms-2">
                                                <small className="text-muted text-uppercase">Gender</small>
                                                <div className="fw-medium">
                                                    {formData.gender || 'Not set'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                            <Modal.Header className="text-black">
                                <Modal.Title className="w-100 text-center">Edit Profile</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="p-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label htmlFor="name" className="form-label">Name</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="name" 
                                                name="name" 
                                                value={formData.name} 
                                                onChange={handleChange} 
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="email" className="form-label">Email</label>
                                            <input 
                                                type="email" 
                                                className="form-control" 
                                                id="email" 
                                                name="email" 
                                                value={formData.email} 
                                                onChange={handleChange} 
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="contact_number" className="form-label">Contact Number</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="contact_number" 
                                                name="contact_number" 
                                                value={formData.contact_number} 
                                                onChange={handleChange} 
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="location" className="form-label">Location</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="location" 
                                                name="location" 
                                                value={formData.location} 
                                                onChange={handleChange} 
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="teacher_id" className="form-label">Teacher ID</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="teacher_id" 
                                                name="teacher_id" 
                                                value={formData.teacher_id} 
                                                onChange={handleChange} 
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="department" className="form-label">Department</label>
                                            <select 
                                                id="department" 
                                                name="department" 
                                                className="form-select" 
                                                value={formData.department} 
                                                onChange={handleChange}
                                            >
                                                <option value="">Select Department</option>
                                                {departments.map(dept => (
                                                    <option key={dept} value={dept}>{dept}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="birthday" className="form-label">Birthday</label>
                                            <input 
                                                type="date" 
                                                className="form-control" 
                                                id="birthday" 
                                                name="birthday" 
                                                value={formData.birthday} 
                                                onChange={handleChange} 
                                                max={`${new Date().getFullYear()}-12-31`}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="gender" className="form-label">Gender</label>
                                            <select 
                                                id="gender" 
                                                name="gender" 
                                                className="form-select" 
                                                value={formData.gender} 
                                                onChange={handleChange}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="facebook" className="form-label">Facebook</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="facebook" 
                                                name="facebook" 
                                                value={formData.facebook} 
                                                onChange={handleChange} 
                                                placeholder="Facebook Profile URL"
                                            />
                                        </div>
                                        <div className="col-12 d-flex gap-2 justify-content-end">
                                            <button type="submit" className="btn btn-primary px-4" onClick={handleSubmit}>
                                                <i className="bi bi-check2 me-2"></i>
                                                Save Changes
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-light"
                                                onClick={() => setShowModal(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </Modal.Body>
                        </Modal>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherProfile;