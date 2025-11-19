import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { isAdmin } from "@/lib/adminConfig";
import { JWTPayload } from "@/types";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export async function requireAuth(
  request: NextRequest,
): Promise<JWTPayload | NextResponse> {
  // Try to get token from Authorization header first
  const authHeader = request.headers.get("authorization");
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    // Fallback to cookie if no Authorization header
    token = request.cookies.get("service_token")?.value;
  }

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Authentication failed: No token provided" },
      { status: 401 },
    );
  }

  const decoded = await verifyToken(token);

  if (!decoded) {
    return NextResponse.json(
      { success: false, error: "Authentication failed: Invalid token" },
      { status: 401 },
    );
  }

  return decoded;
}

export async function requireAdmin(
  user: JWTPayload,
): Promise<NextResponse | null> {
  try {
    const userIsAdmin = await isAdmin(user.student_id);

    if (!userIsAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Authorization failed: Admin access required",
        },
        { status: 403 },
      );
    }

    return null;
  } catch {
    return NextResponse.json(
      { success: false, error: "Authorization failed" },
      { status: 403 },
    );
  }
}

export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function createSuccessResponse<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status });
}
