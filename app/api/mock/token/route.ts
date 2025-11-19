import { NextRequest, NextResponse } from 'next/server';
import { mockAuthStore } from '@/lib/mockAuthStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = body.code;
    
    let mockData = null;
    
    // Try to get mock data from the in-memory store
    if (code) {
      mockData = mockAuthStore.get(code);
      if (mockData) {
        console.log('[Mock Token] Found custom mock data for code:', code, 'data:', mockData);
      } else {
        console.log('[Mock Token] No data found for code:', code, 'using fallback');
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
