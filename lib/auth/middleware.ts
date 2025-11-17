import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export async function authenticate(req: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = req.cookies.get('service_token')?.value;
    
    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    return payload;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function requireAuth(req: NextRequest): Promise<NextResponse | JWTPayload> {
  const user = await authenticate(req);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return user;
}

export async function requireAdmin(req: NextRequest): Promise<NextResponse | JWTPayload> {
  const user = await authenticate(req);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (user.remark !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    );
  }

  return user;
}
