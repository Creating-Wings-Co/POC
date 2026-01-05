"use client";

export default function LoginButton() {
  // After Auth0 login, SDK redirects to returnTo URL
  // Set to home page, which will detect user and redirect to FastAPI
  const returnTo = "/";
  
  return (
    <a
      href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
      className="button login"
    >
      Log In
    </a>
  );
}