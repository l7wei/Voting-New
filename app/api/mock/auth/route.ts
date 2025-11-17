import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectUri = searchParams.get('redirect_uri');
  
  // For mock, generate a fake code
  const code = 'mock_code_' + Date.now();
  
  const callbackUrl = `${redirectUri}?code=${code}`;
  return NextResponse.redirect(callbackUrl);
}
