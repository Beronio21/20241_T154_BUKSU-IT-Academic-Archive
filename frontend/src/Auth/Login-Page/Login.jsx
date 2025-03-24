import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth, emailLogin } from "../../api";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "../Login-Page/GoogleLogin.css";
import googleLogo from '../../Images/Googlelogo.png'; // Google logo
import bukSULogo from '../../Images/buksulogov2.png'; // BukSU logo

const GoogleLogin = () => {
  // State variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("user-info"));
    if (userInfo && userInfo.googleDriveToken) {
      console.log("Google Drive is already connected.");
    }
  }, []);

  // Handle form submission
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
        localStorage.setItem("user-info", JSON.stringify({ id: user._id, name: user.name, email: user.email, image: user.image, role: user.role, token }));
        navigate(`/${user.role}-dashboard`);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(error?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // Google login function
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const result = await googleAuth(tokenResponse.access_token);
        if (result.status === "success") {
          const { user, token } = result.data;
          localStorage.setItem("user-info", JSON.stringify({
            id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            token,
            googleDriveToken: tokenResponse.access_token,
          }));
          navigate(`/${user.role}-dashboard`);
        }
      } catch (error) {
        console.error("Google login error:", error);
        setErrorMessage("Google login failed");
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      setErrorMessage("Google login failed");
    },
    scope: "email profile https://www.googleapis.com/auth/drive",
  });

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="container-box d-flex">
        {/* Left: Logo and Info */}
        <div className="left-section p-4 text-center bg-light d-flex flex-column align-items-center">
          <img src={bukSULogo} alt="BukSU Logo" className="mb-3" style={{ maxWidth: "180px" }} />
          <h4 className="fw-bold">Bukidnon State University</h4>
          <p>Educate. Innovate. Lead.</p>
        </div>

        {/* Right: Login Form */}
        <div className="right-section p-4 flex-grow-1">
          <h4 className="text-center mb-4">Signup</h4>
          <form onSubmit={handleSubmit}>
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
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <div className="d-flex justify-content-center mb-3">
              <ReCAPTCHA
                sitekey="6LfREoYqAAAAABFQTQf5IG6SVrRmgcyz5p-C1gls"
                onChange={(token) => setRecaptchaToken(token)}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
          <div className="text-center my-3">Or Login with</div>
          <button
            className="btn btn-light border w-100 d-flex align-items-center justify-content-center shadow-sm"
            onClick={googleLogin}
            disabled={loading}
            style={{ background: "none", borderColor: "#ccc" }}
          >
            <img src={googleLogo} alt="Google logo" className="me-1" style={{ width: "40px" }} />
            <span className="fw-bold text-muted small-text">{loading ? "Signing in..." : "Sign in with Google"}</span>
          </button>
          <div className="text-center mt-3">
            Don't have an account? <span className="text-primary" onClick={() => navigate("/register-link")} style={{ cursor: "pointer" }}>Register</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleLogin;