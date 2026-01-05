// auth0-nextjs/src/app/api/auth-callback/route.ts
import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    
    if (!session?.user) {
      // If no session, redirect to login
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Get redirect URL from query params or use default
    const redirectUrl = request.nextUrl.searchParams.get("redirect") || 
                       process.env.NEXT_PUBLIC_FASTAPI_URL || 
                       "http://localhost:8000";

    // Get access token with audience for FastAPI
    const audience = process.env.AUTH0_AUDIENCE;
    let token = null;
    
    try {
      if (audience) {
        const { token: accessToken } = await auth0.getAccessToken({
          audience: audience
        });
        token = accessToken;
      } else {
        const { token: accessToken } = await auth0.getAccessToken();
        token = accessToken;
      }
    } catch (e) {
      console.error("Could not get access token:", e);
    }

    // Redirect to FastAPI with token if available
    if (token) {
      return NextResponse.redirect(`${redirectUrl}?token=${encodeURIComponent(token)}`);
    } else {
      // Fallback: redirect with user info
      const userInfo = {
        email: session.user.email,
        name: session.user.name,
        sub: session.user.sub
      };
      return NextResponse.redirect(`${redirectUrl}?user=${encodeURIComponent(JSON.stringify(userInfo))}`);
    }
  } catch (error) {
    console.error("Error in auth callback:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}