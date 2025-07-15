import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import "./TeacherRegister.css"; // Ensure you have the appropriate styles
import axios from "axios";
import { googleAuth } from "../../api";
import GoogleLogo from '../../Images/GoogleLogo.png';

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
              Must be a valid BUKSU Faculty Email
            </li>
            <li className="requirement-item">
              <span className="requirement-icon">✓</span>
              Format: username@buksu.edu.ph
            </li>
            <li className="requirement-item">
              <span className="requirement-icon">✓</span>
              Example: juan.delacruz@buksu.edu.ph
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

const TeacherRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    teacher_id: "",
    department: "",
    contact_number: "",
    location: "",
    birthday: "",
    gender: "",
    role: "teacher",
  });
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showGoogleLinkModal, setShowGoogleLinkModal] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const buksuEmailRegex = /^[a-zA-Z0-9._-]+@(buksu\.edu\.ph|gmail\.com)$/;
    return buksuEmailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateForm = () => {
    // Check required fields
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.gender) {
      setError("Please fill in all required fields");
      return false;
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid BUKSU faculty email");
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
        setError("Please enter a valid BUKSU faculty email");
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

  useEffect(() => {
    // Check for pending Google linking on component mount
    const pendingGoogleLinking = localStorage.getItem('pendingGoogleLinking');
    if (pendingGoogleLinking === 'true') {
      setShowGoogleLinkModal(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        contact_number: formData.contact_number,
        location: formData.location,
        birthday: formData.birthday,
        gender: formData.gender.toLowerCase(),
        role: "teacher"
      };

      const response = await axios.post("http://localhost:8080/api/teachers", registrationData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        setShowSuccessModal(true);
        setShowGoogleLinkModal(false);
        localStorage.removeItem('pendingGoogleLinking');
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
          localStorage.removeItem('pendingGoogleLinking'); // Clear state
          const { user, token } = result.data;
          
          // Store user info in localStorage
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

          // Redirect based on role
          if (user.role === "teacher") {
            navigate("/teacher-dashboard");
          } else {
            setError("Only teachers can register through this page");
            setShowErrorModal(true);
          }
        }
      } catch (error) {
        console.error("Google registration error:", error);
        setError(error.message || "Google registration failed");
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      localStorage.removeItem('pendingGoogleLinking'); // Clear state on error
      console.error("Google registration error:", error);
      setError("Google registration failed");
      setShowErrorModal(true);
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

      {/* Success Modal for Pending Approval */}
      {showSuccessModal && (
        <div className="success-modal">
          <div className="success-modal__content">
            <div className="success-modal__icon">✓</div>
            <h3 className="success-modal__title">Registration Submitted!</h3>
            <p className="success-modal__message">Your account is pending admin approval. You will be able to log in once approved.</p>
            <button className="modal-button" onClick={() => setShowSuccessModal(false)}>OK</button>
          </div>
        </div>
      )}

      {/* Google Linking Modal */}
      {showGoogleLinkModal && (
        <div className="success-modal">
          <div className="success-modal__content">
            <div className="success-modal__icon">✓</div>
            <h3 className="success-modal__title">Registration Successful!</h3>
            <p className="success-modal__message">
              To proceed, you must link your Google account for Google Drive uploads.
            </p>
            <button
              className="std-reg__google-btn"
              onClick={googleLogin}
              disabled={loading}
            >
              <span>{loading ? "Signing in..." : "Link Google Account"}</span>
              <img
                src={GoogleLogo}
                alt="Google logo"
                className="std-reg__google-icon"
                style={{ marginLeft: "10px" }}
              />
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="error-modal">
          <div className="error-modal__content">
            <h3 className="error-modal__title">Error</h3>
            <p className="error-modal__message">{error}</p>
            <button className="error-modal__button" onClick={() => setShowErrorModal(false)}>
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
            <h2 className="std-reg__form-title">Teacher Registration</h2>
            {error && <div className="std-reg__error">{error}</div>}
            
            <form onSubmit={handleSubmit} className="std-reg__form">
              <div className="std-reg__form-grid">
                {[
                  { id: "teacher_id", type: "text", placeholder: "Instructor ID", required: true },
                  { id: "email", type: "email", placeholder: "BUKSU Faculty Email", required: true },
                  { id: "name", type: "text", placeholder: "Full Name", required: true },
                  { id: "department", type: "text", placeholder: "Department", required: false },
                  { id: "contact_number", type: "text", placeholder: "Contact Number", required: true },
                  { id: "location", type: "text", placeholder: "Location", required: true },
                  { id: "birthday", type: "date", placeholder: "Birthday", required: true },
                ].map((input, index) => (
                  <div className="std-reg__input-group" key={index}>
                    <input
                      type={input.type}
                      id={input.id}
                      name={input.id}
                      className="std-reg__input"
                      placeholder={input.placeholder}
                      value={formData[input.id]}
                      onChange={handleChange}
                      required={input.required}
                    />
                  </div>
                ))}

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
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="I prefer not to say">I prefer not to say</option>
                  </select>
                </div>

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

              <button type="submit" className="std-reg__submit-btn" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>

              <div className="std-reg__divider">
                <span>or Register With</span>
              </div>

              <button
                type="button"
                className="btn btn-light border w-100 d-flex align-items-center justify-content-center gap-0 shadow-sm"
                onClick={googleLogin}
                disabled={loading}
                style={{background: "none", borderColor: "#ccc", marginTop: '0.5rem'}}
              >
                <img
                  src={GoogleLogo}
                  alt="Google logo"
                  style={{ width: "37px", height: "19px", marginRight: "0px" }}
                />
                <span className="fw-bold text-muted small-text">{loading ? "Signing in..." : "Register with Google"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherRegister;