import React, { useState, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Modal from 'react-bootstrap/Modal';
import SuccessModal from '../components/SuccessModal';
import TeacherProfileForm from '../components/TeacherProfileForm';
import { io } from 'socket.io-client';
import { useToast } from '../components/NotificationToast';

const departments = [
  'Computer Science',
  'Information Technology',
  'Information Systems',
  'Computer Engineering', 
  'Software Engineering'
];

const requiredFields = ['name', 'teacher_id', 'contact_number', 'department', 'gender', 'birthday'];

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
    image: 'https://via.placeholder.com/150',
    role: 'teacher',
    subject: '',
    status: 'Active'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { showToast } = useToast();
  const [saveLoading, setSaveLoading] = useState(false);

  // Check for missing required fields
  const validateProfile = (data) => {
    const missing = requiredFields.filter(field => !data[field]);
    setMissingFields(missing);
    return missing.length === 0;
  };

  // Fetch profile from backend
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info')) || {};
      const response = await fetch('http://localhost:8080/api/profile', {
        headers: {
          'Authorization': `Bearer ${userInfo.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setFormData({ ...initialFormState, ...data.data });
      validateProfile(data.data);
      // Sync localStorage
      localStorage.setItem('user-info', JSON.stringify({ ...userInfo, ...data.data }));
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile data');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saveLoading) return;
    if (!validateProfile(formData)) {
      alert('Please fill all required fields!');
      return;
    }
    setSaveLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      const payload = {
        name: formData.name,
        teacher_id: formData.teacher_id,
        contact_number: formData.contact_number,
        department: formData.department,
        gender: formData.gender,
        birthday: formData.birthday,
        location: formData.location,
        ...(formData.status && ['Active','Inactive','Pending','Approved','Rejected'].includes(formData.status) ? { status: formData.status } : {}),
        ...(formData.password ? { password: formData.password } : {})
      };
      const response = await fetch('http://localhost:8080/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userInfo.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update profile');
        alert(errorData.message || 'Failed to save profile');
        setSaveLoading(false);
        return;
      }
      const data = await response.json();
      // Sync localStorage
      localStorage.setItem('user-info', JSON.stringify({ ...userInfo, ...data.data }));
      setShowModal(false);
      setShowSuccessModal(true);
      showToast('Profile updated successfully!');
      await fetchProfile();
      setTimeout(() => setShowSuccessModal(false), 2000);
    } catch (err) {
      setError(err.message || 'Failed to save profile');
      alert(err.message || 'Failed to save profile');
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // Socket.IO real-time updates
    const userInfo = JSON.parse(localStorage.getItem('user-info'));
    const socket = io('http://localhost:8080');
    socket.on('teacherUpdated', (payload) => {
      if (payload.teacherId === userInfo?.id || payload.teacherId === userInfo?._id) {
        fetchProfile();
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Helper to format birthday
  const formatBirthday = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // fallback to raw if invalid
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="container-fluid py-2 px-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-grow text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      ) : (
        <>
          {/* Warning Alert for Missing Fields */}
          {missingFields.length > 0 && (
            <div className="alert alert-warning mb-4 d-flex align-items-center" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(251,191,36,0.08)', background: '#fffbe6', border: '1.5px solid #facc15' }}>
              <i className="bi bi-emoji-smile text-warning me-3" style={{ fontSize: 32 }}></i>
              <div>
                <strong className="d-block" style={{ fontSize: '1.1rem', color: '#b45309' }}>Let's Complete Your Profile!</strong>
                <span style={{ color: '#a16207', fontSize: '1rem' }}>
                  To get the best experience, please provide all required information in your profile.
                </span>
              </div>
            </div>
          )}

          {/* Profile Card */}
          <div className="row">
            <div className="col-lg-4 mb-4">
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white text-center">
                  <img 
                    src={formData.image} 
                    alt="Profile" 
                    className="rounded-circle border border-4 border-white my-3"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                  <h5>{formData.name || 'No name'}</h5>
                  <small className="text-white-50">{formData.department || 'No department'}</small>
                </div>
                <div className="card-body">
                  <button 
                    className="btn btn-primary w-100"
                    onClick={() => setShowModal(true)}
                    disabled={saveLoading}
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    {missingFields.length ? 'Complete Profile' : 'Edit Profile'}
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="col-lg-8">
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">
                    <i className="bi bi-person-lines-fill text-primary me-2"></i>
                    Personal Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <DetailItem icon="bi-envelope" label="Email" value={formData.email} required />
                    <DetailItem icon="bi-telephone" label="Contact" value={formData.contact_number} required missing={missingFields.includes('contact_number')} />
                    <DetailItem icon="bi-geo-alt" label="Location" value={formData.location} />
                    <DetailItem icon="bi-calendar" label="Birthday" value={formatBirthday(formData.birthday)} required missing={missingFields.includes('birthday')} />
                    <DetailItem icon="bi-gender-ambiguous" label="Gender" value={formData.gender} required missing={missingFields.includes('gender')} />
                  </div>
                </div>
              </div>

              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">
                    <i className="bi bi-mortarboard text-primary me-2"></i>
                    Academic Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <DetailItem icon="bi-person-badge" label="Teacher ID" value={formData.teacher_id} required missing={missingFields.includes('teacher_id')} />
                    <DetailItem icon="bi-building" label="Department" value={formData.department} required missing={missingFields.includes('department')} />
                  
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Modal */}
          {showModal && (
            <div className="custom-modal show" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000, background: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="custom-modal-content" style={{ width: '95%', maxWidth: 700, borderRadius: 18, background: '#fff', boxShadow: '0 8px 32px rgba(30,41,59,0.18)', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div className="custom-modal-header" style={{ borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: '1.5rem 2.5rem 1.1rem 2.5rem', background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: 'none' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.45rem', letterSpacing: 0.5, margin: 0, flex: 1, textAlign: 'center', textShadow: '0 2px 8px rgba(30,41,59,0.10)' }}>
                    {missingFields.length ? 'Complete Your Profile' : 'Edit Profile'}
                  </h3>
                </div>
                <div className="custom-modal-body" style={{ padding: '2.2rem 2.5rem 2.2rem 2.5rem', fontSize: '1.08rem', color: '#334155', fontWeight: 500, borderRadius: 18, background: 'transparent', textAlign: 'left' }}>
                  <TeacherProfileForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmit}
                    onCancel={() => setShowModal(false)}
                    missingFields={missingFields}
                    isEdit={true}
                    disabledFields={['email', 'status']}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Success Modal */}
          <SuccessModal
            show={showSuccessModal}
            onHide={() => setShowSuccessModal(false)}
            title="Profile updated successfully!"
            message="Your changes have been saved."
          />
        </>
      )}
    </div>
  );
};

// Reusable components
const DetailItem = ({ icon, label, value, required = false, missing = false }) => (
  <div className="col-md-6 mb-3">
    <div className="d-flex align-items-center">
      <i className={`bi ${icon} me-2 text-primary`}></i>
      <div>
        <strong>{label}:</strong> {value || 'Not set'}
        {required && missing && <span className="text-danger ms-2"> (Required)</span>}
      </div>
    </div>
  </div>
);

const FormField = ({ name, label, type = 'text', value, onChange, disabled = false, required = false, missing = false }) => (
  <div className="col-md-6">
    <label htmlFor={name} className="form-label">{label}</label>
    <input
      type={type}
      className={`form-control ${missing ? 'is-invalid' : ''}`}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
    />
    {missing && <div className="invalid-feedback">{label} is required</div>}
  </div>
);

export default TeacherProfile;