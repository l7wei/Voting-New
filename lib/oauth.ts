import axios from 'axios';

const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID || 'nthusa';
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || 'secret';
const OAUTH_AUTHORIZE = process.env.OAUTH_AUTHORIZE || 'http://localhost:3000/api/mock/auth';
const OAUTH_TOKEN_URL = process.env.OAUTH_TOKEN_URL || 'http://localhost:3000/api/mock/token';
const OAUTH_RESOURCE_URL = process.env.OAUTH_RESOURCE_URL || 'http://localhost:3000/api/mock/resource';
const OAUTH_CALLBACK_URL = process.env.OAUTH_CALLBACK_URL || 'http://localhost:3000/api/auth/callback';
const OAUTH_SCOPE = process.env.OAUTH_SCOPE || 'userid name inschool uuid';

export interface OAuthTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
}

export interface OAuthUserInfo {
  Userid: string; // Maps to student_id in our system
  name?: string;
  inschool?: string;
  uuid?: string; // Used for anonymous voting
}

export function getAuthorizationURL(): string {
  const params = new URLSearchParams({
    client_id: OAUTH_CLIENT_ID,
    response_type: 'code',
    redirect_uri: OAUTH_CALLBACK_URL,
    scope: OAUTH_SCOPE,
  });

  return `${OAUTH_AUTHORIZE}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<OAuthTokenResponse> {
  try {
    const response = await axios.post(OAUTH_TOKEN_URL, {
      grant_type: 'authorization_code',
      client_id: OAUTH_CLIENT_ID,
      client_secret: OAUTH_CLIENT_SECRET,
      redirect_uri: encodeURIComponent(OAUTH_CALLBACK_URL),
      code,
    });

    return response.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to exchange code for token';
    console.error('OAuth token exchange error:', errorMessage);
    throw new Error(errorMessage);
  }
}

export async function getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
  try {
    const response = await axios.post(
      OAUTH_RESOURCE_URL,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return response.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get user info';
    console.error('OAuth get user info error:', errorMessage);
    throw new Error(errorMessage);
  }
}
