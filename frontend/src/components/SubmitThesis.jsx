import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDrivePicker from 'react-google-drive-picker';
import '../Styles/SubmitThesis.css';

const SubmitThesis = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    members: [''],
    adviserEmail: '',
    docsLink: '',
    abstract: '',
    keywords: '',
    department: 'Computer Science',
    academic_year: new Date().getFullYear().toString()
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openPicker] = useDrivePicker();

  useEffect(() => {
    const loadGoogleAPI = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          window.gapi.load('client:picker', () => {
            console.log('Google Picker API loaded');
          });
        };
        document.body.appendChild(script);
      }
    };

    loadGoogleAPI();
  }, []);

  const handleInputChange = (e, index = null) => {
    const { name, value } = e.target;

    if (name === 'members' && index !== null) {
      const updatedMembers = [...formData.members];
      updatedMembers[index] = value;
      setFormData(prev => ({ ...prev, members: updatedMembers }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addMember = () => {
    setFormData(prev => ({ ...prev, members: [...prev.members, ''] }));
  };

  const removeMember = (index) => {
    if (formData.members.length > 1) {
      setFormData(prev => ({
        ...prev,
        members: prev.members.filter((_, i) => i !== index)
      }));
    }
  };

  const handleOpenPicker = () => {
    const userInfo = JSON.parse(localStorage.getItem('user-info'));
    const googleDriveToken = userInfo?.googleDriveToken;

    if (!googleDriveToken) {
      alert('Please log in with Google to access Drive files.');
      return;
    }

    if (!window.google?.picker) {
      alert('Google Picker is still loading. Please try again in a moment.');
      return;
    }

    openPicker({
      clientId: "736065879191-hhi3tmfi3ftr54m6r37ilftckkbcojsb.apps.googleusercontent.com",
      developerKey: "AIzaSyBefZhoxSibx9ORWrmhrH3I8L_Cz1OB33E",
      viewId: "DOCS",
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: false,
      token: googleDriveToken,
      callbackFunction: (data) => {
        if (data.action === 'picked') {
          setFormData(prev => ({
            ...prev,
            docsLink: data.docs[0].url
          }));
        }
      },
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      setFormData(prev => ({
        ...prev,
        docsLink: file.name
      }));
    } else {
      alert('Please select a file smaller than 10MB');
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Thesis title is required');
      return false;
    }
    if (!formData.adviserEmail.includes('@')) {
      setError('Valid adviser email is required');
      return false;
    }
    if (!formData.docsLink) {
      setError('Document link is required');
      return false;
    }
    if (!formData.abstract.trim()) {
      setError('Abstract is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));

      const submissionData = {
        title: formData.title,
        members: formData.members.filter(member => member.trim() !== ''),
        adviserEmail: formData.adviserEmail,
        docsLink: formData.docsLink,
        email: userInfo.email,
        abstract: formData.abstract,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        department: formData.department,
        academic_year: parseInt(formData.academic_year)
      };

      const response = await fetch('http://localhost:8080/api/thesis/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify(submissionData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Submission failed');
      }

      alert('Thesis submitted successfully!');
      navigate('/student-dashboard');
    } catch (error) {
      console.error('Submission error:', error);
      setError(error.message || 'Failed to submit thesis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-thesis-container container py-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">Submit Thesis</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label className="form-label">Thesis Title*</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Adviser Email*</label>
                <input
                  type="email"
                  name="adviserEmail"
                  className="form-control"
                  value={formData.adviserEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Abstract*</label>
              <textarea
                name="abstract"
                className="form-control"
                rows="4"
                value={formData.abstract}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label className="form-label">Keywords (comma separated)</label>
                <input
                  type="text"
                  name="keywords"
                  className="form-control"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  placeholder="e.g., AI, Machine Learning"
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Department*</label>
                <select
                  name="department"
                  className="form-select"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Academic Year*</label>
                <input
                  type="number"
                  name="academic_year"
                  className="form-control"
                  value={formData.academic_year}
                  onChange={handleInputChange}
                  min="2000"
                  max="2100"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Team Members*</label>
              {formData.members.map((member, index) => (
                <div key={index} className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control"
                    value={member}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Member name"
                    required
                  />
                  {formData.members.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => removeMember(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={addMember}
              >
                Add Member
              </button>
            </div>

            <div className="mb-4">
              <label className="form-label">Thesis Document*</label>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-2">
                  <span className={formData.docsLink ? "text-success" : "text-muted"}>
                    {formData.docsLink || 'No document selected'}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleOpenPicker}
                  >
                    Select from Google Drive
                  </button>
                </div>
                <div className="text-center">OR</div>
                <div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="form-control"
                    accept=".pdf,.doc,.docx"
                  />
                  <small className="text-muted">Max 10MB (PDF, DOC, DOCX)</small>
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger mb-3">
                {error}
              </div>
            )}

            <div className="d-grid gap-2">
              <button
                type="submit"
                className="btn btn-success btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Thesis'
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitThesis;