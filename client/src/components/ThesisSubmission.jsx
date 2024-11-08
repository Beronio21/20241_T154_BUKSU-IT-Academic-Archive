import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import '../styles/ThesisSubmission.css'; // Assuming the styles are in this file

const ThesisSubmission = () => {
  const [file, setFile] = useState(null);
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Only PDF or DOCX files are allowed.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!file) {
      setError('Please select a file to upload.');
      setLoading(false);
      return;
    }

    // Simulate file upload logic
    setTimeout(() => {
      // Simulate successful upload
      alert('Thesis submitted successfully!');
      setLoading(false);
      setFile(null);
      setComments('');
    }, 2000);
  };

  return (
    <div className="thesis-submission-container">
      {/* Sidebar and Top Navigation Bar */}
      <div className="sidebar">
        <ul>
        <li><Link to="/student-dashboard">Dashboard Home</Link></li>
          <li><Link to="/thesis-submission">Thesis Submission</Link></li> {/* Add this link */}
          <li><Link to="/notifications">Notifications</Link></li> {/* Link to Notifications */}
          <li><Link to="/messages">Messages</Link></li>
          <li><Link to="/profile-settings">Profile Settings</Link></li>
          <li>Log Out</li>
        </ul>
      </div>

      <div className="main-content">
        {/* Top Navigation Bar */}
        <div className="top-nav">
          <div className="logo">University Logo</div>
          <div className="nav-icons">
            <div className="notifications">🔔</div>
            <div className="settings">⚙️</div>
            <div className="profile">
              <img src="profile-pic.jpg" alt="Profile" />
              <span>Student Name</span>
            </div>
          </div>
        </div>

        <div className="thesis-submission">
          <h2>Submit Your Thesis</h2>

          {/* Error Message */}
          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit} className="submission-form">
            {/* Upload Button */}
            <div className="file-upload">
              <label htmlFor="thesis-file" className="upload-label">
                Choose Thesis File (PDF or DOCX)
              </label>
              <input
                type="file"
                id="thesis-file"
                accept=".pdf, .docx"
                onChange={handleFileChange}
                className="file-input"
                required
              />
            </div>

            {/* Submission Guidelines */}
            <div className="guidelines">
              <h3>Submission Guidelines</h3>
              <ul>
                <li>Accepted formats: PDF, DOCX</li>
                <li>File size should not exceed 10MB</li>
                <li>Include a title page and table of contents in your submission</li>
              </ul>
            </div>

            {/* Comments Box */}
            <div className="comments-section">
              <label htmlFor="comments">Additional Comments (Optional)</label>
              <textarea
                id="comments"
                placeholder="Add any comments or notes for your instructor"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="comments-input"
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Uploading...' : 'Submit Thesis'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ThesisSubmission;
