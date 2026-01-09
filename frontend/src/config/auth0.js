// Auth0 Configuration
// These should be set in environment variables or .env file
export const auth0Config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN || '',
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || '',
  audience: process.env.REACT_APP_AUTH0_AUDIENCE || '',
  // Use explicit redirect URI from env, or default to origin + /callback
  redirectUri: process.env.REACT_APP_AUTH0_REDIRECT_URI || (window.location.origin + '/callback'),
  // Use Google connection for social login
  connection: 'google-oauth2',
};

// FastAPI Backend URL
export const FASTAPI_URL = (() => {
  const url = process.env.REACT_APP_FASTAPI_URL;
  if (!url || url.includes('localhost') || url.includes('127.0.0.1')) {
    console.error('❌ REACT_APP_FASTAPI_URL is not set or is localhost!');
    console.error('⚠️ Set REACT_APP_FASTAPI_URL in Amplify environment variables to your ALB DNS');
    console.error('⚠️ Example: http://your-alb-dns-name.us-east-1.elb.amazonaws.com');
    // In production, don't default to localhost - this will cause errors
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 Production build detected but FASTAPI_URL is missing!');
      // Return empty string to force error, or use window.location.origin as fallback
      return window.location.origin.replace(/:\d+$/, ':8000'); // Try to use same origin
    }
    return 'http://localhost:8000'; // Only for local development
  }
  return url;
})();

