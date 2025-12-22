// auth0-nextjs/src/app/api/auth-callback/route.ts
import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    
    if (!session?.user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

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

    const fastApiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";
    if (token) {
      return NextResponse.redirect(`${fastApiUrl}?token=${encodeURIComponent(token)}`);
    } else {
      // Fallback: redirect without token (FastAPI can handle via user info)
      return NextResponse.redirect(fastApiUrl);
    }
  } catch (error) {
    console.error("Error in auth callback:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}