import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isDevelopment = process.env.NODE_ENV === 'development';
  const useMockOAuth = process.env.USE_MOCK_OAUTH === 'true';

  // Use mock OAuth in development or when explicitly enabled
  if (isDevelopment || useMockOAuth) {
    return NextResponse.redirect(new URL('/api/auth/mock-login', req.url));
  }

  // Production OAuth flow
  const clientId = process.env.OAUTH_CLIENT_ID;
  const callbackUrl = process.env.OAUTH_CALLBACK_URL;
  const scope = process.env.OAUTH_SCOPE || 'userid name inschool uuid';
  const authorizeUrl = process.env.OAUTH_AUTHORIZE;

  if (!clientId || !callbackUrl || !authorizeUrl) {
    return NextResponse.json(
      { error: 'OAuth configuration is missing' },
      { status: 500 }
    );
  }

  const oauthUrl = `${authorizeUrl}?client_id=${clientId}&response_type=code&redirect_uri=${callbackUrl}&scope=${scope}`;

  return NextResponse.redirect(oauthUrl);
}
