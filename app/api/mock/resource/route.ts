import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(_request: NextRequest) {
  // Get mock OAuth data from cookie (set by the mock login page)
  const cookieStore = await cookies();
  const mockDataCookie = cookieStore.get('mockOAuthData');
  
  let mockData;
  if (mockDataCookie) {
    try {
      mockData = JSON.parse(mockDataCookie.value);
    } catch {
      mockData = null;
    }
  }
  
  // Fallback to default if no cookie data
  const mockStudentId = mockData?.userid || process.env.MOCK_STUDENT_ID || '110000114';
  
  const response = {
    Userid: mockData?.userid || mockStudentId,
    name: mockData?.name || '測試學生',
    inschool: mockData?.inschool || 'true',
    uuid: mockData?.uuid || ('mock-uuid-' + Date.now()),
  };

  return NextResponse.json(response);
}
