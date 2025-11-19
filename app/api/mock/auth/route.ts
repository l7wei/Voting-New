import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectUri = searchParams.get('redirect_uri');
  
  if (!redirectUri) {
    return NextResponse.json({ error: 'Missing redirect_uri' }, { status: 400 });
  }
  
  // Generate authorization code
  const code = uuidv4();
  
  // Store mock user data for this code
  const mockData = {
    Userid: process.env.MOCK_STUDENT_ID || '110000114',
    name: '測試學生',
    inschool: 'true',
    uuid: 'mock-uuid-' + Date.now(),
    timestamp: Date.now(),
  };
  
  // Store the data in the mock store
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    await fetch(`${baseUrl}/api/mock/store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, data: mockData }),
    });
  } catch (error) {
    console.error('Error storing mock OAuth data:', error);
  }
  
  // Redirect to callback with code (simulating OAuth provider)
  const callbackUrl = new URL(redirectUri);
  callbackUrl.searchParams.set('code', code);
  
  return NextResponse.redirect(callbackUrl);
}
