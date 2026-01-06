import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import "./dummy1_login.css";

function Login() {
    const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isRegistration = searchParams.get("registration") === "true";

    const handleGoogleLogin = () => {
        loginWithRedirect({
            authorizationParams: {
                connection: "google-oauth2",
                screen_hint: isRegistration ? "signup" : "login",
            },
            appState: {
                returnTo: window.location.origin + "/callback",
            },
        }).catch((error) => {
            console.error("Auth0 login error:", error);
        });
    };

    // If already authenticated, redirect to callback
    if (isAuthenticated && !isLoading) {
        navigate("/callback");
        return null;
    }

    return (
        <div className="login-container">
            <div className="login-form">
                <img src="/logo.png" alt="Logo" className="login-logo" />
                <h2>{isRegistration ? "Complete Registration" : "Welcome Back"}</h2>

                {isRegistration && (
                    <p style={{ marginBottom: "20px", color: "#666", fontSize: "14px" }}>
                        Sign in with Google to complete your registration.
                    </p>
                )}

                {/* Google Login Button */}
                <button
                    className="google-login-button"
                    onClick={handleGoogleLogin}
                    style={{ marginTop: isRegistration ? "0" : "20px" }}
                >
                    <img
                        src="/google-logo.png"
                        alt=""
                        className="google-icon"
                    />
                    Continue with Google
                </button>

                <div className="link-text">
                    {isRegistration ? (
                        <>
                            Already have an account? <Link to="/login">Login here</Link>
                        </>
                    ) : (
                        <>
                            New user? <Link to="/register">Click here to register</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login;
