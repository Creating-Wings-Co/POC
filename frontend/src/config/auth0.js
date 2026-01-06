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
export const FASTAPI_URL = process.env.REACT_APP_FASTAPI_URL || 'http://localhost:8000';

