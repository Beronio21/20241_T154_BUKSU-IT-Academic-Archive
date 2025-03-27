import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import "./StudentRegister.css";

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    student_id: "",
    name: "",
    email: "",
    contactNumber: "",
    course: "",
    year: "",
    password: "",
    confirmPassword: "",
    role: "student", // Default role
    gender: "",
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

    // Validate year selection
    if (!formData.year) {
      setError("Please select a year.");
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
            <h2 className="text-center mb-4">Student Registration</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="row g-3">
              {/* Input Fields */}
              {[
                {
                  id: "student_id",
                  type: "text",
                  label: "Student ID",
                  placeholder: "Enter your student ID",
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
                  id: "course",
                  type: "text",
                  label: "Course",
                  placeholder: "Enter your course",
                  required: false,
                },
              ].map((input, index) => (
                <div className="col-12 col-md-6" key={index}>
                  <label className="form-label" htmlFor={input.id}>
                    {input.label}
                  </label>
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
                </div>
              ))}

              {/* Year Dropdown */}
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="year">
                  Year
                </label>
                <select
                  id="year"
                  name="year"
                  className="form-control"
                  value={formData.year}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select Year
                  </option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>

              {/* Gender Dropdown */}
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="gender">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="form-control"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

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
                <p className="mb-0">or Register With</p>
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

export default StudentRegister;