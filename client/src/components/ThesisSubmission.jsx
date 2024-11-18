//ThesisSubmission.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // You can use Axios for making API requests
import '../styles/ThesisSubmission.css';

// Set Axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

const ThesisSubmission = () => {
  const [file, setFile] = useState(null);
  const [comments, setComments] = useState('');
  const [instructor, setInstructor] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch instructors when component mounts
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await axios.get('/api/instructors'); // API call to fetch instructors
        setInstructors(response.data); // Set fetched instructors in state
      } catch (error) {
        setError('Failed to load instructors');
      }
    };

    fetchInstructors();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        selectedFile.type === 'application/pdf' ||
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
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
  
    if (!instructor) {
      setError('Please select an instructor.');
      setLoading(false);
      return;
    }
  
    // Create form data to send file and metadata
    const formData = new FormData();
    formData.append('file', file);
    formData.append('studentId', '12345'); // Replace with the logged-in student's ID
    formData.append('instructorId', instructor);
    formData.append('comments', comments);
  
    try {
      const response = await axios.post('/api/thesis', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      alert(response.data.message); // Show success message
  
      // Create a text file confirmation
      const confirmationContent = `Thesis Submission Confirmation:
  - Instructor: ${instructor}
  - Comments: ${comments || 'No additional comments'}
  - File: ${file.name}`;
  
      const blob = new Blob([confirmationContent], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Thesis_Submission_Confirmation.txt`;
      link.click();
  
      // Reset form
      setFile(null);
      setComments('');
      setInstructor('');
    } catch (error) {
      setError('Failed to submit thesis. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="thesis-submission-container">
      <div className="sidebar">
        <ul>
          <li><Link to="/student-dashboard">Dashboard Home</Link></li>
          <li><Link to="/student/thesis-submission">Thesis Submission</Link></li>
          <li><Link to="/notifications">Notifications</Link></li>
          <li><Link to="/messages">Messages</Link></li>
          <li><Link to="/profile-settings">Profile Settings</Link></li>
          <li>Log Out</li>
        </ul>
      </div>

      <div className="main-content">
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

          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit} className="submission-form">
            {/* Instructor Selection */}
            <div className="form-group">
              <label htmlFor="instructor">Select Instructor</label>
              <select
                id="instructor"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                required
              >
                <option value="">-- Choose an Instructor --</option>
                {instructors.map((inst) => (
                  <option key={inst._id} value={inst._id}>
                    {inst.first_name} {inst.last_name}
                  </option>
                ))}
              </select>
            </div>

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
