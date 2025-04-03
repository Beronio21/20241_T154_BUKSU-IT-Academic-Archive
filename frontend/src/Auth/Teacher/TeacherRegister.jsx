import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import "./TeacherRegister.css"; // Ensure you have the appropriate styles

const TeacherRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    teacher_id: "",
    gender: "", // Default to empty to force selection
    role: "teacher", // Default role
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate gender selection
    if (!formData.gender) {
      setError("Please select a gender.");
      setLoading(false);
      return;
    }

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful!");
        navigate("/login");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
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
      <div className="std-reg__content">
        {/* Left side */}
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

        {/* Right side - Form */}
        <div className="std-reg__right">
          <div className="std-reg__form-wrapper">
            <h2 className="std-reg__form-title">Teacher Registration</h2>
            {error && <div className="std-reg__error">{error}</div>}
            
            <form onSubmit={handleSubmit} className="std-reg__form">
              <div className="std-reg__form-grid">
                {/* Input Fields */}
                {[
                  {
                    id: "teacher_id",
                    type: "text",
                    placeholder: "Instructor ID",
                    required: true,
                  },
                  {
                    id: "email",
                    type: "email",
                    placeholder: "Email",
                    required: true,
                  },
                  {
                    id: "name",
                    type: "text",
                    placeholder: "Full Name",
                    required: true,
                  },
                  {
                    id: "department",
                    type: "text",
                    placeholder: "Department",
                    required: false,
                  },
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

                {/* Gender Dropdown */}
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

                {/* Password and Confirm Password */}
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
                    placeholder="Re-Enter Password"
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

export default TeacherRegister; 