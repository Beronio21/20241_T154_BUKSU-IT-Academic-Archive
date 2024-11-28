import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const handleGoogleRegister = () => {
    // Implement your Google registration logic here
    alert("Google registration coming soon!");
  };

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
                  id: "password",
                  type: "password",
                  label: "Password",
                  placeholder: "Create a password",
                  required: true,
                },
                {
                  id: "confirmPassword",
                  type: "password",
                  label: "Confirm Password",
                  placeholder: "Confirm your password",
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
                  id: "department",
                  type: "text",
                  label: "Department",
                  placeholder: "Enter your department",
                  required: false,
                }
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

              {/* Google Register Button */}
              <div className="col-12 text-center mt-3">
                <button
                  type="button"
                  className="btn btn-outline-danger w-100"
                  onClick={handleGoogleRegister}
                >
                  Or Register With Google
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