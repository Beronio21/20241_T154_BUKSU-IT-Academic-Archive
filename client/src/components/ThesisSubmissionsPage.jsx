import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ThesisSubmissionsPage.css';

const ThesisSubmissionsPage = () => {
  // State variables
  const [submissions, setSubmissions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch submissions from API
  const fetchSubmissions = async () => {
    try {
      const response = await axios.get('/api/theses', {
        params: { status: statusFilter, search: searchQuery },
      });
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  // Fetch submissions on load and whenever filter/search changes
  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter, searchQuery]);

  // Handle status filter change
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="thesis-submissions-page">
      <h1>Thesis Submissions</h1>

      {/* Filter and Search Bar */}
      <div className="filter-search-bar">
        <select value={statusFilter} onChange={handleStatusChange}>
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="In Review">In Review</option>
          <option value="Approved">Approved</option>
          <option value="Revisions Required">Revisions Required</option>
        </select>
        
        <input
          type="text"
          placeholder="Search by name, title, or date"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* Table/List of Submissions */}
      <table className="submissions-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Thesis Title</th>
            <th>Submission Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr key={submission._id}>
              <td>{submission.studentName}</td>
              <td>{submission.thesisTitle}</td>
              <td>{new Date(submission.submissionDate).toLocaleDateString()}</td>
              <td>{submission.status}</td>
              <td>
                <button onClick={() => openReview(submission._id)}>Review</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Helper function to open the review page/modal
const openReview = (id) => {
  // Replace with actual navigation or modal logic
  console.log(`Open review for thesis with ID: ${id}`);
};

export default ThesisSubmissionsPage;
