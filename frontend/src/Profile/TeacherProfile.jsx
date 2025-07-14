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
    subject: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [missingFields, setMissingFields] = useState([]);

  // Check for missing required fields
  const validateProfile = (data) => {
    const missing = requiredFields.filter(field => !data[field]);
    setMissingFields(missing);
    return missing.length === 0;
  };

  const fetchProfile = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info')) || {};
      const profileData = {
        ...initialFormState,
        email: userInfo.email || '',
        name: userInfo.name || '',
        teacher_id: userInfo.teacher_id || '',
        contact_number: userInfo.contact_number || '',
        department: userInfo.department || '',
        gender: userInfo.gender || '',
        birthday: userInfo.birthday || '',
        image: userInfo.image || 'https://via.placeholder.com/150'
      };
      
      setFormData(profileData);
      validateProfile(profileData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile data');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateProfile(formData)) {
      alert('Please fill all required fields!');
      return;
    }
    
    try {
      const updatedInfo = {
        ...JSON.parse(localStorage.getItem('user-info')),
        ...formData
      };
      
      localStorage.setItem('user-info', JSON.stringify(updatedInfo));
      setShowModal(false);
      alert('Profile updated successfully!');
      fetchProfile(); // Refresh data
    } catch (err) {
      alert('Failed to save profile');
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
            <div className="alert alert-warning mb-4">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <strong>Profile Incomplete!</strong> Missing: {missingFields.join(', ')}. 
              Please <a href="#" onClick={() => setShowModal(true)} className="alert-link">update your profile</a>.
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
                    <DetailItem icon="bi-calendar" label="Birthday" value={formData.birthday} required missing={missingFields.includes('birthday')} />
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
                    <DetailItem icon="bi-book" label="Subject" value={formData.subject} />
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
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <FormField name="name" label="Full Name" value={formData.name} onChange={handleChange} required missing={missingFields.includes('name')} />
                      <FormField name="email" label="Email" type="email" value={formData.email} disabled />
                      <FormField name="teacher_id" label="Teacher ID" value={formData.teacher_id} onChange={handleChange} required missing={missingFields.includes('teacher_id')} />
                      <FormField name="contact_number" label="Contact Number" value={formData.contact_number} onChange={handleChange} required missing={missingFields.includes('contact_number')} />
                      <div className="col-md-6">
                        <label className="form-label">Department <span className="text-danger">*</span></label>
                        <select
                          name="department"
                          className={`form-select ${missingFields.includes('department') ? 'is-invalid' : ''}`}
                          value={formData.department}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                        {missingFields.includes('department') && <div className="invalid-feedback">Department is required</div>}
                      </div>
                      <FormField name="birthday" label="Birthday" type="date" value={formData.birthday} onChange={handleChange} required missing={missingFields.includes('birthday')} />
                      <div className="col-md-6">
                        <label className="form-label">Gender <span className="text-danger">*</span></label>
                        <select
                          name="gender"
                          className={`form-select ${missingFields.includes('gender') ? 'is-invalid' : ''}`}
                          value={formData.gender}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        {missingFields.includes('gender') && <div className="invalid-feedback">Gender is required</div>}
                      </div>
                      <FormField name="subject" label="Subject Teaching" value={formData.subject} onChange={handleChange} />
                    </div>
                    <div className="d-flex justify-content-end gap-3 mt-4">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
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