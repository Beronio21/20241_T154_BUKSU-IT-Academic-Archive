import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import "../Styles/StudentRegister.css";

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    student_id: "",
    name: "",
    email: "",
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
    <section>
      {/* Jumbotron */}
      <div className="px-4 py-5 text-center text-lg-start">
        <div className="container-fluid">
          <div className="row gx-lg-5 align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h1 className="my-5 display-4 fw-bold ls-tight">
                Welcome to BUKSU <br />
                <span className="text-primary">IT Capstone Archive</span>
              </h1>
              <p style={{ color: "hsl(217, 10%, 50.8%)" }}>
                Please fill in the details below to create your account and join our community.
              </p>
            </div>

            <div className="col-lg-6 mb-5 mb-lg-0">
              <div className="card" style={{ maxWidth: "500px", margin: "0 auto" }}>
                <div className="card-body py-4 px-md-4"> {/* Reduced padding */}
                  <h2 className="text-center mb-4">Register</h2>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      {/* Input Fields */}
                      {[
                        {
                          id: "student_id",
                          type: "text",
                          placeholder: "Institution ID",
                          required: true,
                        },
                        {
                          id: "name",
                          type: "text",
                          placeholder: "Full Name",
                          required: true,
                        },
                        {
                          id: "email",
                          type: "email",
                          placeholder: "Institution Email",
                          required: true,
                        },
                        {
                          id: "course",
                          type: "text",
                          placeholder: "Course",
                          required: false,
                        },
                      ].map((input, index) => (
                        <div className="col-12 col-md-6" key={index}>
                          <div className="form-outline mb-4">
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
                        </div>
                      ))}

                      {/* Year Dropdown */}
                      <div className="col-12 col-md-6">
                        <div className="form-outline mb-4">
                          <select
                            id="year"
                            name="year"
                            className="form-control"
                            value={formData.year}
                            onChange={handleChange}
                            required
                          >
                            <option value="" disabled>School Year</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                          </select>
                        </div>
                      </div>

                      {/* Gender Dropdown */}
                      <div className="col-12 col-md-6">
                        <div className="form-outline mb-4">
                          <select
                            id="gender"
                            name="gender"
                            className="form-control"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                          >
                            <option value="" disabled>Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
 <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Password and Confirm Password */}
                      <div className="col-12 col-md-6">
                        <div className="form-outline mb-4">
                          <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-control"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="col-12 col-md-6">
                        <div className="form-outline mb-4">
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className="form-control"
                            placeholder="Re-enter Your Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="col-12">
                        <button type="submit" className="btn btn-primary btn-block mb-2" disabled={loading}>
                          {loading ? "Registering..." : "Register"}
                        </button>
                      </div>

                      {/* Divider Text */}
                      <div className="col-12 text-center mt-2">
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
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Jumbotron */}
    </section>
  );
};

export default StudentRegister;