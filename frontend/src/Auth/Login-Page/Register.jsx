import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { registerUser } from "../../api"; // Ensure this API function exists
import bukSULogo from '../../Images/buksulogov2.png';

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    if (!recaptchaToken) {
      setErrorMessage("Please complete the reCAPTCHA.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await registerUser(email, password, recaptchaToken);
      if (response.status === "success") {
        navigate("/login");
      } else {
        setErrorMessage(response.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage(error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="container-box d-flex">
        {/* Left Section */}
        <div className="left-section p-4 text-center bg-light d-flex flex-column align-items-center">
          <img src={bukSULogo} alt="BukSU Logo" className="mb-3" style={{ maxWidth: "180px" }} />
          <h4 className="fw-bold">Bukidnon State University</h4>
          <p>Educate. Innovate. Lead.</p>
        </div>

        {/* Right Section */}
        <div className="right-section p-4 flex-grow-1">
          <h4 className="text-center mb-4">Register</h4>
          <form onSubmit={handleRegister}>
            <div className="form-group mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <div className="d-flex justify-content-center mb-3">
              <ReCAPTCHA
                sitekey="6LfREoYqAAAAABFQTQf5IG6SVrRmgcyz5p-C1gls"
                onChange={(token) => setRecaptchaToken(token)}
              />
            </div>
            <button type="submit" className="btn btn-success w-100" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          <div className="text-center mt-3">
            Already have an account? <span className="text-primary" onClick={() => navigate("/login")} style={{ cursor: "pointer" }}>Login</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
