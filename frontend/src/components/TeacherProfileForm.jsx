import React from 'react';

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

  return (
    <form onSubmit={onSubmit}>
      <div className="row g-3">
        <FormField name="name" label="Full Name" value={formData.name} onChange={handleChange} required missing={missingFields.includes('name')} disabled={disabledFields.includes('name')} />
        <FormField name="email" label="Email" type="email" value={formData.email} onChange={handleChange} required missing={missingFields.includes('email')} disabled />
        <FormField name="teacher_id" label="Teacher ID" value={formData.teacher_id} onChange={handleChange} required missing={missingFields.includes('teacher_id')} disabled={disabledFields.includes('teacher_id')} />
        <FormField name="contact_number" label="Contact Number" value={formData.contact_number} onChange={handleChange} required missing={missingFields.includes('contact_number')} disabled={disabledFields.includes('contact_number')} />
        <div className="col-md-6">
          <label className="form-label">Department <span className="text-danger">*</span></label>
          <select
            name="department"
            className={`form-select ${missingFields.includes('department') ? 'is-invalid' : ''}`}
            value={formData.department}
            onChange={handleChange}
            required
            disabled={disabledFields.includes('department')}
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          {missingFields.includes('department') && <div className="invalid-feedback">Department is required</div>}
        </div>
        <FormField name="birthday" label="Birthday" type="date" value={formData.birthday} onChange={handleChange} required missing={missingFields.includes('birthday')} disabled={disabledFields.includes('birthday')} min="1900-01-01" max={`${currentYear}-12-31`} />
        <div className="col-md-6">
          <label className="form-label">Gender <span className="text-danger">*</span></label>
          <select
            name="gender"
            className={`form-select ${missingFields.includes('gender') ? 'is-invalid' : ''}`}
            value={formData.gender}
            onChange={handleChange}
            required
            disabled={disabledFields.includes('gender')}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {missingFields.includes('gender') && <div className="invalid-feedback">Gender is required</div>}
        </div>
        <FormField name="location" label="Location" value={formData.location} onChange={handleChange} disabled={disabledFields.includes('location')} />
       
        {/* Status dropdown for admin editing */}
        {isEdit && !disabledFields.includes('status') ? (
          <div className="col-md-6">
            <label className="form-label">Status</label>
            <select
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
              required
              disabled={disabledFields.includes('status')}
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        ) : (
          <FormField name="status" label="Status" value={formData.status} disabled />
        )}
        {isEdit && (
          <FormField name="password" label="New Password (leave blank to keep current)" type="password" value={formData.password || ''} onChange={handleChange} disabled={disabledFields.includes('password')} />
        )}
      </div>
      <div className="d-flex justify-content-end gap-3 mt-4">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </div>
    </form>
  );
};

const FormField = ({ name, label, type = 'text', value, onChange, disabled = false, required = false, missing = false, min, max }) => (
  <div className="col-md-6">
    <label htmlFor={name} className="form-label">{label}</label>
    <input
      type={name === 'contact_number' ? 'tel' : (name === 'birthday' ? 'date' : type)}
      className={`form-control ${missing ? 'is-invalid' : ''}`}
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
    />
    {missing && <div className="invalid-feedback">{label} is required</div>}
  </div>
);

export default TeacherProfileForm; 