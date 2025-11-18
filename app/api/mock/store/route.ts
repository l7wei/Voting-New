import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for mock OAuth data
interface MockOAuthData {
  Userid: string;
  name: string;
  inschool: string;
  uuid: string;
  timestamp: number;
}

const mockOAuthStore = new Map<string, MockOAuthData>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, data } = body;
    
    if (!code || !data) {
      return NextResponse.json({ error: 'Missing code or data' }, { status: 400 });
    }
    
    // Store the data with the code as key
    mockOAuthStore.set(code, data);
    
    // Clean up old entries (older than 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    for (const [key, value] of mockOAuthStore.entries()) {
      if (value.timestamp && value.timestamp < fiveMinutesAgo) {
        mockOAuthStore.delete(key);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing mock OAuth data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }
  
  const data = mockOAuthStore.get(code);
  
  if (!data) {
    return NextResponse.json({ error: 'Code not found or expired' }, { status: 404 });
  }
  
  // Delete after retrieval (one-time use)
  mockOAuthStore.delete(code);
  
  return NextResponse.json(data);
}
