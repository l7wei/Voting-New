import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = body.code;
    
    let mockData = null;
    
    // Try to fetch mock data from the store
    if (code) {
      try {
        // Use the store API via internal request
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const storeResponse = await fetch(`${baseUrl}/api/mock/store?code=${encodeURIComponent(code)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (storeResponse.ok) {
          mockData = await storeResponse.json();
        } else {
          console.log('Store response not OK:', storeResponse.status);
        }
      } catch (error) {
        console.error('Error fetching from mock store:', error);
      }
    }
    
    // Fallback to default data
    if (!mockData) {
      console.log('Using fallback mock data');
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
  } catch (error) {
    console.error('Token route error:', error);
    return NextResponse.json({
      access_token: 'mock_access_token_' + Date.now(),
      expires_in: 3600,
      token_type: 'Bearer',
      scope: 'userid name inschool uuid',
      refresh_token: 'mock_refresh_token',
    });
  }
}
