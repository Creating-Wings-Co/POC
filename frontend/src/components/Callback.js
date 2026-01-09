import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { FASTAPI_URL } from "../config/auth0";

function Callback() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      if (isLoading) {
        return;
      }

      if (!isAuthenticated || !user) {
        navigate("/login");
        return;
      }

      try {

        // Read registration data from sessionStorage if available
        const registrationDataStr = sessionStorage.getItem("registrationData");
        const isRegistration = sessionStorage.getItem("isRegistration") === "true";
        let registrationData = null;

        if (registrationDataStr) {
          try {
            registrationData = JSON.parse(registrationDataStr);
          } catch (e) {
            console.error("Error parsing registration data:", e);
          }
        }

        // Prepare user info with registration metadata
        const userInfo = {
          sub: user.sub,
          name: user.name || registrationData?.fullName || "User",
          email: user.email || registrationData?.email || "",
          picture: user.picture || null,
        };

        // Map registration fields to backend expected fields
        if (registrationData) {
          // Map ageRange to age (extract number from range like "26-35" -> 30)
          let age = null;
          if (registrationData.ageRange) {
            const rangeMatch = registrationData.ageRange.match(/(\d+)-(\d+)/);
            if (rangeMatch) {
              age = Math.floor((parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2);
            } else if (registrationData.ageRange.includes("+")) {
              const numMatch = registrationData.ageRange.match(/(\d+)/);
              if (numMatch) {
                age = parseInt(numMatch[1]);
              }
            } else if (registrationData.ageRange === "Under 18") {
              age = 17;
            }
          }

          // Map marital status
          const maritalStatusMap = {
            "Single": "single",
            "Married": "married",
            "Divorced": "divorced",
            "Separated": "separated",
            "Widowed": "widowed",
          };

          // Map employment status
          const employmentStatusMap = {
            "Full-time": "employed",
            "Part-time": "employed",
            "Self-employed": "self_employed",
            "Homemaker": "homemaker",
            "Looking": "unemployed",
            "Student": "student",
          };

          Object.assign(userInfo, {
            phone: null, // Not collected in registration form
            age: age,
            financial_goals: null, // Not collected in registration form
            income_range: registrationData.incomeRange || null,
            employment_status: employmentStatusMap[registrationData.employment] || registrationData.employment || null,
            marital_status: maritalStatusMap[registrationData.maritalStatus] || registrationData.maritalStatus?.toLowerCase() || null,
            dependents: null, // Not collected in registration form
            investment_experience: null, // Not collected in registration form
            risk_tolerance: null, // Not collected in registration form
            education: registrationData.education || null,
            location: registrationData.location || null,
            username: registrationData.username || null,
          });
        }

        // Get access token if available
        let token = null;
        try {
          token = await getAccessTokenSilently({
            authorizationParams: {
              audience: process.env.REACT_APP_AUTH0_AUDIENCE,
            },
          });
        } catch (e) {
          console.warn("Could not get access token:", e);
        }

        // Call FastAPI /api/auth/callback to register/update user
        if (!FASTAPI_URL || FASTAPI_URL.includes('localhost')) {
          console.error("❌ FASTAPI_URL is not set or is localhost!");
          console.error("⚠️ Set REACT_APP_FASTAPI_URL in Amplify environment variables");
          alert("Configuration error: Backend URL not set. Please contact support.");
          return;
        }
        console.log("Calling FastAPI:", `${FASTAPI_URL}/api/auth/callback`);
        console.log("User info:", userInfo);
        
        const callbackResponse = await fetch(`${FASTAPI_URL}/api/auth/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(userInfo),
          mode: 'cors', // Explicitly enable CORS
        });

        console.log("FastAPI response status:", callbackResponse.status);

        if (callbackResponse.ok) {
          const userData = await callbackResponse.json();
          console.log("User registered successfully:", userData);

          // Clear registration data from sessionStorage
          sessionStorage.removeItem("registrationData");
          sessionStorage.removeItem("isRegistration");

          if (userData.user_id) {
            // Redirect to FastAPI with user_id
            const redirectUrl = `${FASTAPI_URL}?userId=${userData.user_id}`;
            console.log("Redirecting to:", redirectUrl);
            window.location.href = redirectUrl;
          } else {
            console.log("No user_id, redirecting to:", FASTAPI_URL);
            window.location.href = FASTAPI_URL;
          }
        } else {
          const errorText = await callbackResponse.text();
          console.error("Failed to register user. Status:", callbackResponse.status, "Error:", errorText);
          // Silently redirect to backend - let backend handle error display
          window.location.href = FASTAPI_URL;
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
        // Silently redirect to backend - let backend handle error display
        window.location.href = FASTAPI_URL;
      }
    }

    handleCallback();
  }, [user, isAuthenticated, isLoading, getAccessTokenSilently, navigate]);

  return (
    <div className="login-container">
      <div className="login-form">
        <img src="/logo.png" alt="Logo" className="login-logo" />
        <h2>Creating Wings Co</h2>
        <p style={{ marginTop: "20px", textAlign: "center", color: "#666" }}>
          Setting up your account...
        </p>
      </div>
    </div>
  );
}

export default Callback;

