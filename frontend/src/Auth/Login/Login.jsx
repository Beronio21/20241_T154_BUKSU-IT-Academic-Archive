import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth, emailLogin } from "../../api";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "./Login.css";

import bukSULogo from '../../Images/logobuksu.jpg'; // BukSU logo
import VectorImage from '../../Images/Vector.png'; // Import the background image
import GoogleLogo from '../../Images/GoogleLogo.png'; // Import Google logo

const GoogleLogin = () => {
    // State variables
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState("");
    const navigate = useNavigate();

    // Add login-page class to body and html when component mounts
    useEffect(() => {
        document.body.classList.add("login-page");
        document.documentElement.classList.add("login-page");

        // Cleanup function to remove the class when component unmounts
        return () => {
            document.body.classList.remove("login-page");
            document.documentElement.classList.remove("login-page");
        };
    }, []);

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

        try {
            // Try to login first to check if it's an admin
            const result = await emailLogin(email, password);
            
            if (result.status === "success" && result.data.user.role === "admin") {
                // Skip reCAPTCHA for admin users
                localStorage.setItem("user-info", JSON.stringify({
                    id: result.data.user._id,
                    name: result.data.user.name,
                    email: result.data.user.email,
                    image: result.data.user.image,
                    role: result.data.user.role,
                    token: result.data.token
                }));
                navigate(`/${result.data.user.role}-dashboard`);
                return;
            }

            // For non-admin users, verify reCAPTCHA
            if (!recaptchaToken) {
                setErrorMessage("Please complete the reCAPTCHA.");
                setLoading(false);
                return;
            }

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

            // If we get here, it means it's a non-admin user and reCAPTCHA passed
            // We already have the login result from earlier
            if (result.status === "success") {
                localStorage.setItem("user-info", JSON.stringify({
                    id: result.data.user._id,
                    name: result.data.user.name,
                    email: result.data.user.email,
                    image: result.data.user.image,
                    role: result.data.user.role,
                    token: result.data.token
                }));
                navigate(`/${result.data.user.role}-dashboard`);
            } else {
                setErrorMessage(result.message || "Login failed");
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
                    const {user, token} = result.data;
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
                } else {
                    setErrorMessage(result.message || "Google login failed");
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
        <div
            className="d-flex justify-content-center align-items-center vh-100 vw-100 m-0 p-0"
            style={{
                backgroundImage: `url(${VectorImage}), linear-gradient(to bottom right, #dceeff, #ffffff)`,
                backgroundSize: "cover",
                backgroundAttachment: "fixed",
            }}
        >
            <div className="container-box d-flex">
                {/* Left: Logo and Info */}
                <div className="left-section p-4 text-center bg-light d-flex flex-column align-items-center">
                    <img src={bukSULogo} alt="BukSU Logo" className="mb-3" style={{maxWidth: "180px"}}/>
                    <h4 className="fw-bold">IT Capstone Archive</h4>
                    <p>Explore and manage capstone projects submitted by students.</p>
                    
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
                        className="btn btn-light border w-100 d-flex align-items-center justify-content-center gap-0 shadow-sm"
                        onClick={googleLogin}
                        disabled={loading}
                        style={{background: "none", borderColor: "#ccc"}}
                    >
                        <img
                            src={GoogleLogo}
                            alt="Google logo"
                            style={{ width: "37px", height: "19px" }}
                        />
                        <span className="fw-bold text-muted small-text">{loading ? "Signing in..." : "Sign in with Google"}</span>
                    </button>
                    <div className="text-center mt-3">
                        Don't have an account? <span className="text-primary" onClick={() => navigate("/teacher-register")}
                                                      style={{cursor: "pointer"}}>Register</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoogleLogin;