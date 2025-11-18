import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = body.code;

    // Mock token response - include code in the token so we can retrieve session later
    const response = {
      access_token: `mock_token_${code}`,
      expires_in: 3600,
      token_type: 'Bearer',
      scope: 'userid name inschool uuid',
      refresh_token: 'mock_refresh_token',
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
