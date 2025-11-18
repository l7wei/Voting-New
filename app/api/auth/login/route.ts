import { NextResponse } from 'next/server';
import { getAuthorizationURL } from '@/lib/oauth';

export async function GET() {
  const authUrl = getAuthorizationURL();
  return NextResponse.redirect(authUrl);
}
