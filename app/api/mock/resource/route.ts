import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Try to get mock data from cookie
  const mockDataCookie = request.cookies.get('mock_oauth_data');
  
  let mockData = {
    Userid: process.env.MOCK_STUDENT_ID || '110000114',
    name: '測試學生',
    inschool: 'true',
    uuid: 'mock-uuid-' + Date.now(),
  };
  
  if (mockDataCookie) {
    try {
      mockData = JSON.parse(mockDataCookie.value);
    } catch {
      // Use default if parsing fails
    }
  }

  return NextResponse.json(mockData);
}
