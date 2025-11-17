import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  // Mock token response
  const response = {
    access_token: 'mock_access_token_' + Date.now(),
    expires_in: 3600,
    token_type: 'Bearer',
    scope: 'userid name inschool uuid',
    refresh_token: 'mock_refresh_token',
  };

  return NextResponse.json(response);
}
