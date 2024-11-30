import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import "../Styles/TeacherRegister.css"; // Make sure to create a separate CSS file for teacher registration.

const TeacherRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
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
    <div className="container-fluid d-flex align-items-center justify-content-center vh-100">
      <div className="row w-100">
        {/* Left Container: Image */}
        <div className="col-md-6 d-flex justify-content-center align-items-center">
          <div className="left-container d-flex justify-content-center align-items-center h-100">
            <img
              src="src/images/buksulogo.png" // Assuming 'buksulogo.png' is in the public/images folder
              alt="Illustration"
              className="img-fluid rounded"
              style={{ maxHeight: "80%", width: "auto" }}
            />
          </div>
        </div>

        {/* Right Container: Form */}
        <div className="col-md-6 d-flex justify-content-center align-items-center">
          <div className="card p-5 shadow-lg rounded" style={{ width: "90%" }}>
            <h2 className="text-center mb-4">Teacher Registration</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="row g-3">
              {/* Input Fields with teacher_id first */}
              {[
                {
                  id: "teacher_id",
                  type: "text",
                  label: "Teacher ID",
                  placeholder: "Enter your teacher ID",
                  required: true,
                },
                {
                  id: "name",
                  type: "text",
                  label: "Name",
                  placeholder: "Enter your full name",
                  required: true,
                },
                {
                  id: "email",
                  type: "email",
                  label: "Email",
                  placeholder: "Enter your email",
                  required: true,
                },
                {
                  id: "contactNumber",
                  type: "text",
                  label: "Contact Number",
                  placeholder: "Enter your contact number",
                  required: false,
                },
                {
                  id: "gender",
                  type: "select",
                  label: "Gender",
                  options: ["", "Male", "Female", "I prefer not to say"],
                  required: true,
                },
                {
                  id: "department",
                  type: "text",
                  label: "Department",
                  placeholder: "Enter your department",
                  required: false,
                },
              ].map((input, index) => (
                <div className="col-12 col-md-6" key={index}>
                  <label className="form-label" htmlFor={input.id}>
                    {input.label}
                  </label>
                  {input.type === "select" ? (
                    <select
                      id={input.id}
                      name={input.id}
                      className="form-control"
                      value={formData[input.id]}
                      onChange={handleChange}
                      required={input.required}
                    >
                      <option value="" disabled>
                        Select Gender
                      </option>
                      {input.options.slice(1).map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={input.type}
                      id={input.id}
                      name={input.id}
                      className="form-control"
                      placeholder={input.placeholder}
                      value={formData[input.id]}
                      onChange={handleChange}
                      required={input.required}
                    />
                  )}
                </div>
              ))}

              {/* Password and Confirm Password */}
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register"}
                </button>
              </div>

              {/* Divider Text */}
              <div className="col-12 text-center mt-3">
                <p className="mb-0">or Register with</p>
              </div>

              {/* Google Register Button */}
              <div className="col-12 text-center mt-2">
                <button
                  type="button"
                  className="google-login-btn"
                  onClick={googleLogin}
                  disabled={loading}
                >
                  <img
                    src="../src/Images/Googlelogo.png"
                    alt="Google logo"
                    style={{ width: '45px', height: '20px', marginLeft: '2px' }}
                  />
                  {loading ? "Signing in..." : "Register with Google"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherRegister;