import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectUri = searchParams.get('redirect_uri');
  
  // Redirect to the mock login page where user can input OAuth data
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect_uri', redirectUri || '');
  
  return NextResponse.redirect(loginUrl);
}
