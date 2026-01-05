"use client";

export default function LoginButton() {
  // After Auth0 login, SDK redirects to returnTo URL
  // We'll set it to our callback route that redirects to FastAPI
  const returnTo = "/api/auth-callback";
  
  return (
    <a
      href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
      className="button login"
    >
      Log In
    </a>
  );
}