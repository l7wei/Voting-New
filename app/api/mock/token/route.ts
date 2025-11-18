import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = body.code;
    
    let mockData = null;
    
    // Try to fetch mock data from the store
    if (code) {
      try {
        const baseUrl = request.nextUrl.origin;
        const storeResponse = await fetch(`${baseUrl}/api/mock/store?code=${code}`);
        if (storeResponse.ok) {
          mockData = await storeResponse.json();
        }
      } catch (error) {
        console.error('Error fetching from mock store:', error);
      }
    }
    
    // Fallback to default data
    if (!mockData) {
      mockData = {
        Userid: process.env.MOCK_STUDENT_ID || '110000114',
        name: '測試學生',
        inschool: 'true',
        uuid: 'mock-uuid-' + Date.now(),
      };
    }
    
    // Create response with token
    const response = NextResponse.json({
      access_token: 'mock_access_token_' + Date.now(),
      expires_in: 3600,
      token_type: 'Bearer',
      scope: 'userid name inschool uuid',
      refresh_token: 'mock_refresh_token',
    });
    
    // Store mock OAuth data in cookie for resource endpoint
    response.cookies.set('mock_oauth_data', JSON.stringify(mockData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300, // 5 minutes
      path: '/',
    });
    
    return response;
  } catch {
    return NextResponse.json({
      access_token: 'mock_access_token_' + Date.now(),
      expires_in: 3600,
      token_type: 'Bearer',
      scope: 'userid name inschool uuid',
      refresh_token: 'mock_refresh_token',
    });
  }
}
