// auth0-nextjs/src/app/api/auth-callback/route.ts
import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Wait a bit for session to be established after Auth0 callback
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let session = await auth0.getSession();
    
    if (!session?.user) {
      // If no session yet, wait a bit more (session might still be establishing)
      console.log("No session found in auth-callback, waiting longer...");
      await new Promise(resolve => setTimeout(resolve, 500));
      session = await auth0.getSession();
      
      if (!session?.user) {
        console.log("Still no session after retry, redirecting to home");
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    console.log("Session found for user:", session.user.email);

    // Get FastAPI URL
    const fastApiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";
    
    // Get access token for FastAPI
    const audience = process.env.AUTH0_AUDIENCE;
    let token = null;
    
    try {
      if (audience) {
        const tokenResult = await auth0.getAccessToken({
          audience: audience
        });
        token = tokenResult.token;
      } else {
        const tokenResult = await auth0.getAccessToken();
        token = tokenResult.token;
      }
    } catch (e) {
      console.error("Could not get access token:", e);
    }

    // Call FastAPI /api/auth/callback to register/update user
    const userInfo = {
      sub: session.user.sub,
      name: session.user.name || "User",
      email: session.user.email || "",
      picture: session.user.picture || null
    };

    try {
      console.log("Calling FastAPI callback endpoint:", `${fastApiUrl}/api/auth/callback`);
      console.log("User info being sent:", userInfo);
      
      const callbackResponse = await fetch(`${fastApiUrl}/api/auth/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(userInfo)
      });

      console.log("FastAPI response status:", callbackResponse.status);

      if (callbackResponse.ok) {
        const userData = await callbackResponse.json();
        console.log("User registered/updated in FastAPI:", userData);
        
        if (userData.user_id) {
          // Redirect to FastAPI with user_id - FastAPI HTML will handle showing the chat
          const redirectUrl = `${fastApiUrl}?userId=${userData.user_id}`;
          console.log("Redirecting to FastAPI:", redirectUrl);
          // Use new URL() to ensure absolute redirect (not relative)
          return NextResponse.redirect(new URL(redirectUrl));
        } else {
          console.error("No user_id in response:", userData);
          // Fallback: redirect with user info
          const fallbackUrl = `${fastApiUrl}?user=${encodeURIComponent(JSON.stringify(userInfo))}`;
          return NextResponse.redirect(new URL(fallbackUrl));
        }
      } else {
        const errorText = await callbackResponse.text();
        console.error("Failed to register user in FastAPI. Status:", callbackResponse.status, "Error:", errorText);
        // Fallback: redirect with user info anyway
        const fallbackUrl = `${fastApiUrl}?user=${encodeURIComponent(JSON.stringify(userInfo))}`;
        return NextResponse.redirect(new URL(fallbackUrl));
      }
    } catch (error) {
      console.error("Error calling FastAPI callback:", error);
      // Fallback: redirect with user info
      const fallbackUrl = `${fastApiUrl}?user=${encodeURIComponent(JSON.stringify(userInfo))}`;
      return NextResponse.redirect(new URL(fallbackUrl));
    }
  } catch (error) {
    console.error("Error in auth callback:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}