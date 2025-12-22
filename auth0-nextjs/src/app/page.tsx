"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import LoginButton from "@/components/LoginButton";
import { useEffect } from "react";

export default function Home() {
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (user && !isLoading) {
      const fastApiUrl = (process.env.NEXT_PUBLIC_FASTAPI_URL as string) || "http://localhost:8000";
      
      console.log("User logged in, attempting to get token...");
      
      // Try multiple methods to get token
      Promise.race([
        // Method 1: Try API route
        fetch('/api/token').then(res => res.json()),
        // Method 2: Try to get from useUser hook (if available)
        new Promise((resolve) => {
          // Check if we can get token from cookies or other sources
          setTimeout(() => resolve({ error: "timeout" }), 2000);
        })
      ])
        .then((data: any) => {
          console.log("Token fetch result:", data);
          if (data.token) {
            console.log("Redirecting to FastAPI with token");
            window.location.href = `${fastApiUrl}?token=${encodeURIComponent(data.token)}`;
          } else {
            // If no token, redirect anyway and let FastAPI handle it
            // We'll pass user info in a different way
            console.warn("No token available, redirecting with user info");
            const userInfo = {
              email: user.email,
              name: user.name,
              sub: user.sub
            };
            window.location.href = `${fastApiUrl}?user=${encodeURIComponent(JSON.stringify(userInfo))}`;
          }
        })
        .catch(error => {
          console.error("Error fetching token:", error);
          // Redirect with user info as fallback
          const userInfo = {
            email: user.email,
            name: user.name,
            sub: user.sub
          };
          window.location.href = `${fastApiUrl}?user=${encodeURIComponent(JSON.stringify(userInfo))}`;
        });
    }
  }, [user, isLoading]);

  if (isLoading || user) {
    return (
      <div className="app-container">
        <div className="main-card-wrapper">
          <h1 className="main-title">Creating Wings Co</h1>
          <div className="action-card">
            <p className="action-text">
              {user ? "Redirecting to your assistant..." : "Loading..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-card-wrapper">
        <h1 className="main-title">Creating Wings Co</h1>
        <div className="action-card">
          <p className="action-text">
            Welcome! Please log in to access your personalized assistant.
          </p>
          <LoginButton />
        </div>
      </div>
    </div>
  );
}