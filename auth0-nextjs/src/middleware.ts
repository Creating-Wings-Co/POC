import type { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  try {
    return await auth0.middleware(request);
  } catch (error) {
    console.error("Auth0 middleware error:", error);
    // Return a response to prevent the error from crashing the app
    return new Response("Authentication error", { status: 500 });
  }
}

//Implements:
    ///auth/login
    //auth/callback
    //auth/logout
    //auth/profile
//plugins that make Auth0 routes exists
//ex: frontend can redirect to /auth/login
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};