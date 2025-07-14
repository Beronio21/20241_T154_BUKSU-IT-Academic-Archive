import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth, emailLogin } from "../../api";
import "./StudentRegister.css";
import axios from "axios";

const googleLogoUrl = "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png";

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
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    student_id: "",
    course: "",
    year: "",
    gender: "",
    role: "student",
  });

  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(true);
  const [showGoogleLinkModal, setShowGoogleLinkModal] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const buksuEmailRegex = /^[a-zA-Z0-9._-]+@student\.buksu\.edu\.ph$/;
    return buksuEmailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateForm = () => {
    // Check required fields
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || 
        !formData.student_id || !formData.course || !formData.year || !formData.gender) {
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
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        student_id: formData.student_id,
        course: formData.course,
        year: formData.year,
        gender: formData.gender.toLowerCase(),
        role: "student"
      };

      const response = await axios.post("http://localhost:8080/api/register", registrationData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        setShowSuccessModal(false);
        setShowGoogleLinkModal(true);
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
    <div className="student-register-disabled" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
      <h2>Student Registration Not Required</h2>
      <p>All students now have guest access to the public dashboard. Please go to the <a href="/student-dashboard/dashboard">Student Dashboard</a>.</p>
    </div>
  );
};

export default StudentRegister;