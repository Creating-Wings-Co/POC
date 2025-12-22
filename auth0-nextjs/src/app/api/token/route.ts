import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth0.getSession();
    
    console.log("Token API called, session exists:", !!session);
    console.log("Session user:", session?.user?.email);
    
    if (!session?.user) {
      console.error("No session or user found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check what's in the session
    console.log("Session keys:", Object.keys(session));
    // Log session without sensitive data
    const sessionInfo = {
      user: session.user ? { email: session.user.email, name: session.user.name } : null,
      keys: Object.keys(session)
    };
    console.log("Session info:", JSON.stringify(sessionInfo, null, 2));

    // Try to get access token - this is the proper way in Auth0 SDK v4
    let tokenToUse = null;
    
    try {
      console.log("Attempting to get access token...");
      
      // Don't use audience if it's the Management API endpoint
      const audience = process.env.AUTH0_AUDIENCE;
      const isManagementAPI = audience?.includes('/api/v2/');
      
      if (!isManagementAPI && audience) {
        console.log("Using AUTH0_AUDIENCE:", audience);
        const { accessToken } = await auth0.getAccessToken({
          authorizationParams: {
            audience: audience
          }
        });
        
        if (accessToken) {
          console.log("Access token received via getAccessToken");
          tokenToUse = accessToken;
        }
      } else {
        // Try without audience (for ID token)
        console.log("Trying to get token without audience (ID token)...");
        try {
          const { accessToken } = await auth0.getAccessToken();
          if (accessToken) {
            tokenToUse = accessToken;
          }
        } catch (e) {
          console.log("getAccessToken() without audience failed, trying alternative...");
        }
      }
    } catch (error: any) {
      console.error("Error getting access token:", error.message);
    }

    // If still no token, try to get it from the request/response
    if (!tokenToUse) {
      console.log("Trying alternative method to get token...");
      // The token might be in cookies or we need to use a different approach
      // For now, let's create a token from the user info (not ideal but works for testing)
      // Actually, let's check if we can get it from the auth0 instance directly
    }

    if (tokenToUse) {
      console.log("Returning token to client");
      return NextResponse.json({ token: tokenToUse });
    }

    // Last resort: We need to get the token from the actual Auth0 callback
    // The issue is that tokens might only be available during the callback
    console.warn("No token available in session");
    console.log("Session structure:", {
      hasUser: !!session.user,
      sessionType: typeof session,
      keys: Object.keys(session)
    });
    
    return NextResponse.json({ 
      user: session.user,
      message: "Token not available in session",
      error: "Tokens are not stored in session. May need to configure Auth0 to return tokens.",
      hint: "Check Auth0 Dashboard -> Applications -> Your App -> Advanced Settings -> OAuth -> Include ID Token in Logout"
    });
  } catch (error) {
    console.error("Error in token route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

