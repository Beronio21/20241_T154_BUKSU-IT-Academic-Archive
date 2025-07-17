import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaIdBadge, FaPhone, FaBuilding, FaBirthdayCake, FaVenusMars, FaMapMarkerAlt, FaLock } from 'react-icons/fa';

const departments = [
  'Computer Science',
  'Information Technology',
  'Information Systems',
  'Computer Engineering',
  'Software Engineering'
];

const TeacherProfileForm = ({ formData, setFormData, onSubmit, onCancel, missingFields = [], isEdit = true, disabledFields = [] }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const currentYear = new Date().getFullYear();

  // Helper for tooltips
  const renderTooltip = (msg) => (
    <Tooltip>{msg}</Tooltip>
  );

  return (
    <form onSubmit={onSubmit} style={{ background: '#f9fafb', borderRadius: 18, boxShadow: '0 4px 24px rgba(30,41,59,0.10)', padding: '2rem 2.5rem', minWidth: 320, maxWidth: 700, margin: '0 auto' }}>
      <div className="row g-4 g-lg-5">
        {/* Left Column */}
        <div className="col-12 col-md-6 d-flex flex-column gap-4">
          <FormField
            icon={<FaUser className="me-2 text-primary" />}
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            missing={missingFields.includes('name')}
            disabled={disabledFields.includes('name')}
            helper="Enter your full legal name."
          />
          <FormField
            icon={<FaEnvelope className="me-2 text-primary" />}
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            missing={missingFields.includes('email')}
            disabled
            helper="Your BUKSU faculty email."
          />
          <FormField
            icon={<FaIdBadge className="me-2 text-primary" />}
            name="teacher_id"
            label="Teacher ID"
            value={formData.teacher_id}
            onChange={handleChange}
            required
            missing={missingFields.includes('teacher_id')}
            disabled={disabledFields.includes('teacher_id')}
            helper="Your unique teacher ID."
          />
          <FormField
            icon={<FaPhone className="me-2 text-primary" />}
            name="contact_number"
            label="Contact Number"
            value={formData.contact_number}
            onChange={handleChange}
            required
            missing={missingFields.includes('contact_number')}
            disabled={disabledFields.includes('contact_number')}
            helper="e.g. 09XXXXXXXXX"
          />
          <div className="form-group mb-0">
            <label className="form-label fw-semibold">Department <span className="text-danger">*</span></label>
            <div className="d-flex align-items-center">
              <FaBuilding className="me-2 text-primary" />
              <select
                name="department"
                className={`form-select form-control-lg ${missingFields.includes('department') ? 'is-invalid' : ''}`}
                value={formData.department}
                onChange={handleChange}
                required
                disabled={disabledFields.includes('department')}
                style={{ height: 48 }}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            {missingFields.includes('department') && <div className="invalid-feedback">Department is required</div>}
            <div className="form-text text-muted mt-1" style={{ fontSize: '0.95rem' }}>Select your department.</div>
          </div>
        </div>
        {/* Right Column */}
        <div className="col-12 col-md-6 d-flex flex-column gap-4">
          <FormField
            icon={<FaBirthdayCake className="me-2 text-primary" />}
            name="birthday"
            label="Birthday"
            type="date"
            value={formData.birthday}
            onChange={handleChange}
            required
            missing={missingFields.includes('birthday')}
            disabled={disabledFields.includes('birthday')}
            min="1900-01-01"
            max={`${currentYear}-12-31`}
            helper="Pick your birth date."
          />
          <div className="form-group mb-0">
            <label className="form-label fw-semibold">Gender <span className="text-danger">*</span></label>
            <div className="d-flex align-items-center">
              <FaVenusMars className="me-2 text-primary" />
              <select
                name="gender"
                className={`form-select form-control-lg ${missingFields.includes('gender') ? 'is-invalid' : ''}`}
                value={formData.gender}
                onChange={handleChange}
                required
                disabled={disabledFields.includes('gender')}
                style={{ height: 48 }}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            {missingFields.includes('gender') && <div className="invalid-feedback">Gender is required</div>}
            <div className="form-text text-muted mt-1" style={{ fontSize: '0.95rem' }}>Select your gender.</div>
          </div>
          <FormField
            icon={<FaMapMarkerAlt className="me-2 text-primary" />}
            name="location"
            label="Location"
            value={formData.location}
            onChange={handleChange}
            disabled={disabledFields.includes('location')}
            helper="e.g. Malaybalay City, Bukidnon"
          />
          <div className="form-group mb-0">
            <label className="form-label fw-semibold">Status</label>
            <div className="d-flex align-items-center">
              <FaIdBadge className="me-2 text-primary" />
              <span className="form-control-plaintext ps-2" style={{ fontWeight: 500, fontSize: 16 }}>{formData.status || 'Active'}</span>
            </div>
            <div className="form-text text-muted mt-1" style={{ fontSize: '0.95rem' }}>Your current account status.</div>
          </div>
        </div>
        {/* Full-width bottom row for password */}
        <div className="col-12 mt-2">
          <FormField
            icon={<FaLock className="me-2 text-primary" />}
            name="password"
            label="New Password"
            type="password"
            value={formData.password || ''}
            onChange={handleChange}
            disabled={disabledFields.includes('password')}
            helper="Leave blank to keep current. Password must be at least 6 characters."
          />
        </div>
        {/* Bottom-right aligned buttons */}
        <div className="col-12 d-flex justify-content-end gap-3 mt-4">
          <button type="button" className="btn btn-secondary px-4 py-2 fw-semibold" onClick={onCancel} style={{ borderRadius: 8, minWidth: 120 }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary px-5 py-2 fw-semibold" style={{ borderRadius: 8, fontSize: 18, minWidth: 180 }}>
            Save Changes
          </button>
        </div>
      </div>
    </form>
  );
};

// Improved FormField with icon, floating label, and helper text
const FormField = ({ icon, name, label, type = 'text', value, onChange, disabled = false, required = false, missing = false, min, max, helper }) => (
  <div className="form-group mb-0" style={{ width: '100%' }}>
    <label htmlFor={name} className="form-label fw-semibold">{label}{required && <span className="text-danger ms-1">*</span>}</label>
    <div className="position-relative">
      <input
        type={name === 'contact_number' ? 'tel' : (name === 'birthday' ? 'date' : type)}
        className={`form-control form-control-lg ps-5 ${missing ? 'is-invalid' : ''}`}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        pattern={name === 'contact_number' ? '[0-9]{11,}' : undefined}
        maxLength={name === 'contact_number' ? 15 : undefined}
        min={min}
        max={max}
        placeholder={label}
        autoComplete="off"
        style={{ paddingLeft: 38, borderRadius: 8, height: 48 }}
      />
      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>{icon}</span>
    </div>
    {missing && <div className="invalid-feedback">{label} is required</div>}
    {helper && <div className="form-text text-muted mt-1" style={{ fontSize: '0.95rem' }}>{helper}</div>}
  </div>
);

export default TeacherProfileForm; 