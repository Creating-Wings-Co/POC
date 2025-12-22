import { Auth0Client } from '@auth0/nextjs-auth0/server';

//creates and exports Auth0 Clients
//Auth0 SDK instance
// The Auth0Client automatically reads from environment variables
// Make sure these are set in .env.local:
// AUTH0_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_AUDIENCE
export const auth0 = new Auth0Client();