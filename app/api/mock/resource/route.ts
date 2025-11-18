import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Extract code from access token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (token && token.startsWith('mock_token_mock_code_')) {
      // Extract code from token
      const code = token.replace('mock_token_', '');
      
      // Try to get session data
      try {
        const sessionResponse = await fetch(
          new URL('/api/mock/session?code=' + encodeURIComponent(code), request.url),
          { method: 'GET' }
        );
        
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          if (sessionData.success && sessionData.data) {
            return NextResponse.json({
              Userid: sessionData.data.userid,
              name: sessionData.data.name,
              inschool: sessionData.data.inschool,
              uuid: sessionData.data.uuid,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    }
    
    // Fallback to default if no session data
    const response = {
      Userid: process.env.MOCK_STUDENT_ID || '110000114',
      name: '測試學生',
      inschool: 'true',
      uuid: 'mock-uuid-' + Date.now(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in mock resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
