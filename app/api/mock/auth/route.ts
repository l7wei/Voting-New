import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectUri = searchParams.get('redirect_uri');
  
  // Redirect to login page with redirect_uri
  const loginUrl = new URL('/login', request.url);
  if (redirectUri) {
    loginUrl.searchParams.set('redirect_uri', redirectUri);
  }
  
  return NextResponse.redirect(loginUrl);
}
