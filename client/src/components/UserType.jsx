import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/UserType.css";

import adminIcon from "../images/Admin.png";
import instructorIcon from "../images/Teacher.png";
import studentIcon from "../images/user.png";

const UserType = () => {
  const [selectedUserType, setSelectedUserType] = useState("admin"); // Default to admin
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  // Automatically select 'admin' by default on component mount
  useEffect(() => {
    setSelectedUserType("admin"); // Default selection
  }, []);

  // Handle user type selection
  const handleUserTypeClick = (type) => {
    setSelectedUserType(type);
    setShowError(false); // Hide error message when user selects a type
  };

  // Proceed to the registration page for the selected user type
  const handleProceed = () => {
    if (!selectedUserType) {
      setShowError(true); // Show error if no user type is selected
      return;
    }

    // Navigate to the registration page of the selected user type (admin, instructor, student)
    navigate(`/register-${selectedUserType}`);
  };

  useEffect(() => {
    if (showError) {
      console.log("Error message displayed");
    }
  }, [showError]);

  return (
    <div className="user-type-container">
      <h2>
        <span className="partial-underline">Sel</span>ect a User Type
      </h2>
      <div className="user-type-options">
        <div
          onClick={() => handleUserTypeClick("admin")}
          className={`user-type-card ${selectedUserType === "admin" ? "selected" : ""}`}
        >
          <img src={adminIcon} alt="Admin Icon" className="user-icon" />
          <p>Admin</p>
        </div>
        <div
          onClick={() => handleUserTypeClick("instructor")}
          className={`user-type-card ${selectedUserType === "instructor" ? "selected" : ""}`}
        >
          <img src={instructorIcon} alt="Instructor Icon" className="user-icon" />
          <p>Instructor</p>
        </div>
        <div
          onClick={() => handleUserTypeClick("student")}
          className={`user-type-card ${selectedUserType === "student" ? "selected" : ""}`}
        >
          <img src={studentIcon} alt="Student Icon" className="user-icon" />
          <p>Student</p>
        </div>
      </div>

      {/* Error message before proceeding */}
      {showError && (
        <p className="error-message">Please select a user type to proceed.</p>
      )}

      <div className="user-type-navigation">
        <button className="back-button" onClick={() => navigate(-1)}>
          Back
        </button>
        <button
          className={`next-button ${selectedUserType ? "active" : ""}`}
          onClick={handleProceed}
        >
          <span className="arrow-icon">→</span>
        </button>
      </div>
    </div>
  );
};

export default UserType;
