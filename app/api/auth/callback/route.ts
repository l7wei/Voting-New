import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getUserInfo } from "@/lib/oauth";
import { generateToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    if (error === "access_denied" || !code) {
      return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
    }

    // Parse state to get redirect URL
    let redirectPath = "/vote"; // Default redirect
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, "base64").toString());
        if (stateData.redirect) {
          redirectPath = stateData.redirect;
        }
      } catch (e) {
        console.error("Failed to parse state:", e);
      }
    }

    console.log("Callback: Exchanging code for token...");
    // Exchange code for access token
    const tokenInfo = await exchangeCodeForToken(code);
    console.log("Callback: Got token info");

    // Get user info from OAuth (Userid field maps to student_id)
    const userInfo = await getUserInfo(tokenInfo.access_token);
    const studentId = userInfo.Userid; // OAuth returns "Userid", we map it to student_id
    const userName = userInfo.name || studentId;
    console.log(
      "Callback: Got user info for student ID:",
      studentId,
      "name:",
      userName,
    );

    // Generate service token with name included (no database lookup needed)
    const serviceToken = await generateToken({
      _id: studentId, // Use student_id as _id
      student_id: studentId,
      name: userName,
    });

    console.log(
      "Callback: Generated service token, redirecting to",
      redirectPath,
    );
    // Create response with redirect to the original destination
    const response = NextResponse.redirect(new URL(redirectPath, request.url));

    // Set token in cookie
    response.cookies.set("service_token", serviceToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400, // 1 day
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Authentication failed";
    console.error("OAuth callback error:", errorMessage);
    if (error instanceof Error && error.stack) {
      console.error("Stack trace:", error.stack);
    }
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
