import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for mock OAuth sessions
const sessions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, data } = body;

    if (code && data) {
      // Store session data
      sessions.set(code, data);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Missing code or data' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (code && sessions.has(code)) {
    const data = sessions.get(code);
    // Clean up after retrieval
    sessions.delete(code);
    return NextResponse.json({ success: true, data });
  }

  return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
}
