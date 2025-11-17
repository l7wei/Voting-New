import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  // Mock user resource - use student ID from query or default
  
  // In development, you can customize this student ID
  const mockStudentId = process.env.MOCK_STUDENT_ID || '108060001';
  
  const response = {
    Userid: mockStudentId,
    name: '測試學生',
    inschool: 'true',
    uuid: 'mock-uuid-' + Date.now(),
  };

  return NextResponse.json(response);
}
