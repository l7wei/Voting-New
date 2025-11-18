import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { isAdmin } from '@/lib/adminConfig';
import { JWTPayload } from '@/types';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export async function requireAuth(request: NextRequest): Promise<JWTPayload | NextResponse> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed: No token provided' },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed: Invalid token' },
      { status: 401 }
    );
  }

  return decoded;
}

export async function requireAdmin(user: JWTPayload): Promise<NextResponse | null> {
  try {
    const userIsAdmin = await isAdmin(user.student_id);
    
    if (!userIsAdmin) {
      return NextResponse.json(
        { success: false, error: 'Authorization failed: Admin access required' },
        { status: 403 }
      );
    }

    return null;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Authorization failed' },
      { status: 403 }
    );
  }
}

export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

export function createSuccessResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    { success: true, data },
    { status }
  );
}
