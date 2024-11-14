import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "./api";
import { useNavigate } from 'react-router-dom';
import React from "react";
import './App.css'; // Assuming styles are in App.css or similar

const GoogleLogin = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const responseGoogle = async (authResult) => {
        try {
            setLoading(true);
            if (authResult["code"]) {
                const result = await googleAuth(authResult.code);
                const { email, name, image } = result.data.user;
                const token = result.data.token;
                const obj = { email, name, token, image };
                localStorage.setItem('user-info', JSON.stringify(obj));
                navigate('/dashboard');
            } else {
                console.log(authResult);
                throw new Error(authResult);
            }
        } catch (e) {
            console.log('Error while Google Login...', e);
            setErrorMessage('Failed to login with Google. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: responseGoogle,
        onError: responseGoogle,
        flow: "auth-code",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Basic validation
        if (!email) {
            setErrorMessage('Email is required');
            return;
        }
        if (!password) {
            setErrorMessage('Password is required');
            return;
        }

        // Call your authentication API here (add your API call logic)
        console.log('Email:', email, 'Password:', password);

        // Reset fields after submission
        setEmail('');
        setPassword('');
    };

    return (
        <section className="background-radial-gradient overflow-hidden">
            <style>
                {`
                html, body {
                    height: 100%;
                    margin: 0;
                    overflow: hidden; /* Prevent scrollbars */
                }
                .background-radial-gradient {
                    background-color: hsl(218, 41%, 15%);
                    background-image: radial-gradient(650px circle at 0% 0%, hsl(218, 41%, 35%) 15%, hsl(218, 41%, 30%) 35%, hsl(218, 41%, 20%) 75%, hsl(218, 41%, 19%) 80%, transparent 100%),
                                    radial-gradient(1250px circle at 100% 100%, hsl(218, 41%, 45%) 15%, hsl(218, 41%, 30%) 35%, hsl(218, 41%, 20%) 75%, hsl(218, 41%, 19%) 80%, transparent 100%);
                    height: 100vh; /* Ensure full viewport height */
                    width: 100vw; /* Ensure full viewport width */
                    background-size: cover; /* Make background cover the whole section */
                    background-position: center; /* Center the background */
                }
                #radius-shape-1 {
                    height: 220px;
                    width: 220px;
                    top: -60px;
                    left: -130px;
                    background: radial-gradient(#44006b, #ad1fff);
                    overflow: hidden;
                }
                #radius-shape-2 {
                    border-radius: 38% 62% 63% 37% / 70% 33% 67% 30%;
                    bottom: -60px;
                    right: -110px;
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(#44006b, #ad1fff);
                    overflow: hidden;
                }
                .bg-glass {
                    background-color: hsla(0, 0%, 100%, 0.9) !important;
                    backdrop-filter: saturate(200%) blur(25px);
                }
                .error-message {
                    color: red;
                    margin-top: 10px;
                }
                `}
            </style>
            <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5 d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
                <div className="row gx-lg-5 align-items-center mb-5">
                    <div className="col-lg-6 mb-5 mb-lg-0" style={{ zIndex: 10 }}>
                        <h1 className="my-5 display-5 fw-bold ls-tight" style={{ color: "hsl(218, 81%, 95%)" }}>
                            Online Submission and <br />
                            <span style={{ color: "hsl(218, 81%, 75%)" }}>Review system</span>
                        </h1>
                        <p className="mb-4 opacity-70" style={{ color: "hsl(218, 81%, 85%)" }}>
                            Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                            Temporibus, expedita iusto veniam atque, magni tempora mollitia
                            dolorum consequatur nulla, neque debitis eos reprehenderit quasi
                            ab ipsum nisi dolorem modi. Quos?
                        </p>
                    </div>

                    <div className="col-lg-6 mb-5 mb-lg-0 position-relative">
                        <div id="radius-shape-1" className="position-absolute rounded-circle shadow-5-strong"></div>
                        <div id="radius-shape-2" className="position-absolute shadow-5-strong"></div>

                        <div className="card bg-glass">
                            <div className="card-body px-4 py-5 px-md-5">
                                <form onSubmit={handleSubmit}>

                                    {/* Email input */}
                                    <div data-mdb-input-init className="form-outline mb-4">
                                        <input
                                            type="email"
                                            id="form3Example3"
                                            className="form-control"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                        <label className="form-label" htmlFor="form3Example3">Email address</label>
                                    </div>

                                    {/* Password input */}
                                    <div data-mdb-input-init className="form-outline mb-4">
                                        <input
                                            type="password"
                                            id="form3Example4"
                                            className="form-control"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <label className="form-label" htmlFor="form3Example4">Password</label>
                                    </div>

                                    {/* Display error message */}
                                    {errorMessage && <div className="error-message">{errorMessage}</div>}

									{/* Centered Submit button */}
									<div className="d-flex justify-content-center mb-4">
										<button type="submit" className="btn btn-primary w-100" disabled={loading}>
											{loading ? 'Logging up...' : 'Log In'}
										</button>
									</div>


                                    {/* Social media sign-in buttons */}
                                    <div className="text-center">
                                        <p>or sign up with:</p>
											{/* Google Sign-in Button */}
										<button
											type="button"
											className="btn btn-primary mb-4 w-100" // Added w-100 class here
											onClick={googleLogin}
											disabled={loading}
										>
											Sign in with Google<i className="bi bi-google me-2"></i> {/* Google Icon */}
										</button>
                     
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GoogleLogin;