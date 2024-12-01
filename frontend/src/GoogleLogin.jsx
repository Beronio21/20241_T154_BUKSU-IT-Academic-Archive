import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth, emailLogin } from "./api";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "../src/Styles/GoogleLogin.css";

const GoogleLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    if (!recaptchaToken) {
      setErrorMessage("Please complete the reCAPTCHA.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/verify-recaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recaptchaToken }),
      });

      const recaptchaData = await response.json();

      if (!recaptchaData.success) {
        setErrorMessage("reCAPTCHA verification failed. Please try again.");
        setLoading(false);
        return;
      }

      const result = await emailLogin(email, password);

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
      console.error("Login error:", error);
      setErrorMessage(error?.message || "Invalid email or password");
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
        console.error("Google login error:", error);
        setErrorMessage("Google login failed");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      setErrorMessage("Google login failed");
      setLoading(false);
    },
    scope: "email profile",
  });

  return (
    <section className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="login-container shadow-lg p-4 rounded">
        <h3 className="text-center mb-4 fw-bold">Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <input
              type="email"
              className="form-control custom-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-3">
            <input
              type="password"
              className="form-control custom-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {errorMessage && (
            <div className="alert alert-danger" role="alert">
              {errorMessage}
            </div>
          )}
          <div className="d-flex justify-content-center mb-3">
            <ReCAPTCHA
              sitekey="6LfREoYqAAAAABFQTQf5IG6SVrRmgcyz5p-C1gls"
              onChange={(token) => setRecaptchaToken(token)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <div className="d-flex justify-content-center my-4">
          <p className="text-center mb-0">Or Login with</p>
        </div>
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
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
        <div className="d-flex justify-content-center align-items-center mt-4">
          <p className="text-center mb-0">
            Don't have an account?{" "}
            <span className="register-link" onClick={() => setShowModal(true)}>
              Register
            </span>
          </p>
        </div>
      </div>

      {showModal && (
        <div className="modal-container">
          <div className="modal-content">
            <h4 className="modal-title">Choose Your Account Type</h4>
            <div className="user-type-options">
              <div className="user-type-card" onClick={() => navigate("/teacher-register")}>
                <div className="user-type-icon">
                  <img src="./src/Images/Teacher.png" alt="Teacher" />
                </div>
                <p>Teacher</p>
              </div>
              <div className="user-type-card" onClick={() => navigate("/student-register")}>
                <div className="user-type-icon">
                  <img src="./src/Images/user.png" alt="Student" />
                </div>
                <p>Student</p>
              </div>
            </div>
            <button
              className="btn w-100 mt-3"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default GoogleLogin;