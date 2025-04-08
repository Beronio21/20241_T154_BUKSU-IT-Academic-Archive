import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth, emailLogin } from "../../api";
import "./StudentRegister.css";
import axios from "axios";

const EmailRequirementsModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Email Requirements</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <ul className="email-requirements-list">
            <li className="requirement-item">
              <span className="requirement-icon">✓</span>
              Must be a valid Institutional Email
            </li>
            <li className="requirement-item">
              <span className="requirement-icon">✓</span>
              Format: ID_@student.buksu.edu.ph
            </li>
            <li className="requirement-item">
              <span className="requirement-icon">✓</span>
              Example: 20123****@student.buksu.edu.ph
            </li>
          </ul>
        </div>
        <div className="modal-footer">
          <button className="modal-button" onClick={onClose}>Got it!</button>
        </div>
      </div>
    </div>
  );
};

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    institution_id: "",
    email: "",
    full_name: "",
    course: "",
    school_year: "",
    gender: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(true);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const buksuEmailRegex = /^[0-9]+@student\.buksu\.edu\.ph$/;
    return buksuEmailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateForm = () => {
    // Check required fields
    if (!formData.institution_id || !formData.email || !formData.full_name || 
        !formData.course || !formData.school_year || !formData.gender || 
        !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields");
      return false;
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid BUKSU student email");
      return false;
    }

    // Validate password
    if (!validatePassword(formData.password)) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (error) {
      setError("");
    }

    // Validate email format in real-time
    if (name === "email" && value) {
      if (!validateEmail(value)) {
        setError("Please Enter Valid Institution Email");
      } else {
        setError("");
      }
    }

    // Validate password length in real-time
    if (name === "password" && value) {
      if (!validatePassword(value)) {
        setError("Password must be at least 6 characters long");
      } else {
        setError("");
      }
    }

    // Validate password match in real-time when confirm password changes
    if (name === "confirmPassword" && value) {
      if (value !== formData.password) {
        setError("Passwords do not match");
      } else {
        setError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/auth/register", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(response.data.message || "Registration failed. Please try again.");
        setShowErrorModal(true);
      }
    } catch (error) {
      if (error.response?.data?.message) {
        if (error.response.data.message.includes("duplicate key error")) {
          setError("This email is already registered. Please use a different email or try logging in.");
        } else {
          setError(error.response.data.message);
        }
      } else {
        setError("An error occurred. Please try again.");
      }
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const result = await googleAuth(tokenResponse.access_token);
        if (result.status === "success") {
          const { user, token } = result.data;
          localStorage.setItem(
            "user-info",
            JSON.stringify({
              id: user._id,
              name: user.name,
              email: user.email,
              image: user.image,
              role: user.role,
              token,
            })
          );
          navigate(`/${user.role}-dashboard`);
        }
      } catch (error) {
        console.error("Google registration error:", error);
        setError("Google registration failed");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google registration error:", error);
      setError("Google registration failed");
      setLoading(false);
    },
    scope: "email profile",
  });

  return (
    <div className="std-reg__container">
      <EmailRequirementsModal 
        show={showEmailModal} 
        onClose={() => setShowEmailModal(false)} 
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal">
          <div className="success-modal__content">
            <div className="success-modal__icon">✓</div>
            <h3 className="success-modal__title">Success!</h3>
            <p className="success-modal__message">Registration successful! Redirecting to login...</p>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="error-modal">
          <div className="error-modal__content">
            <h3 className="error-modal__title">Error</h3>
            <p className="error-modal__message">{error}</p>
            <button
              className="error-modal__button"
              onClick={() => setShowErrorModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="std-reg__content">
        <div className="std-reg__left">
          <img
            src="../src/Images/buksulogov2.png"
            alt="BukSU Logo"
            className="std-reg__logo"
          />
          <h1 className="std-reg__title">
            Welcome to BUKSU
            <span className="std-reg__subtitle">IT Capstone Archive</span>
          </h1>
          <p className="std-reg__description">
            Please fill in the details below to create your account and join our community.
          </p>
        </div>

        <div className="std-reg__right">
          <div className="std-reg__form-wrapper">
            <h2 className="std-reg__form-title">Register</h2>
            {error && <div className="std-reg__error">{error}</div>}
            
            <form onSubmit={handleSubmit} className="std-reg__form">
              <div className="std-reg__form-grid">
                {/* Institution ID */}
                <div className="std-reg__input-group">
                  <input
                    type="text"
                    id="institution_id"
                    name="institution_id"
                    className="std-reg__input"
                    placeholder="Institution ID"
                    value={formData.institution_id}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="std-reg__input-group">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="std-reg__input"
                    placeholder="Institution Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Full Name */}
                <div className="std-reg__input-group">
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    className="std-reg__input"
                    placeholder="Full Name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Course */}
                <div className="std-reg__input-group">
                  <input
                    type="text"
                    id="course"
                    name="course"
                    className="std-reg__input"
                    placeholder="Course"
                    value={formData.course}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* School Year */}
                <div className="std-reg__input-group">
                  <select
                    id="school_year"
                    name="school_year"
                    className="std-reg__input"
                    value={formData.school_year}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>School Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                {/* Gender */}
                <div className="std-reg__input-group">
                  <select
                    id="gender"
                    name="gender"
                    className="std-reg__input"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">I prefer not to say</option>
                  </select>
                </div>

                {/* Password */}
                <div className="std-reg__input-group">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="std-reg__input"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div className="std-reg__input-group">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="std-reg__input"
                    placeholder="Re-enter Your Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="std-reg__submit-btn" 
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>

              <div className="std-reg__divider">
                <span>or Register With</span>
              </div>

              <button
                type="button"
                className="std-reg__google-btn"
                onClick={googleLogin}
                disabled={loading}
              >
                <img
                  src="../src/Images/Googlelogo.png"
                  alt="Google logo"
                  className="std-reg__google-icon"
                />
                <span>{loading ? "Signing in..." : "Register with Google"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;