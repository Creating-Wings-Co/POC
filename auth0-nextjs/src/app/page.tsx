"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import LoginButton from "@/components/LoginButton";
import { useEffect } from "react";

export default function Home() {
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (user && !isLoading) {
      const fastApiUrl = (process.env.NEXT_PUBLIC_FASTAPI_URL as string) || "http://localhost:8000";
      
      console.log("User logged in, redirecting to FastAPI...");
      
      // Redirect immediately to auth-callback route which will handle token and redirect to FastAPI
      window.location.href = `/api/auth-callback?redirect=${encodeURIComponent(fastApiUrl)}`;
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