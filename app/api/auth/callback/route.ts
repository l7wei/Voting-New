import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getUserInfo } from '@/lib/oauth';
import { generateToken } from '@/lib/auth';
import { User } from '@/lib/models/User';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error === 'access_denied' || !code) {
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
    }

    console.log('Callback: Exchanging code for token...');
    // Exchange code for access token
    const tokenInfo = await exchangeCodeForToken(code);
    console.log('Callback: Got token info');
    
    // Get user info
    const userInfo = await getUserInfo(tokenInfo.access_token);
    const studentId = userInfo.Userid;
    const userName = userInfo.name || studentId;
    console.log('Callback: Got user info for student ID:', studentId, 'name:', userName);

    // Connect to database
    await connectDB();
    console.log('Callback: Connected to DB');

    // Find or create user
    let user = await User.findOne({ student_id: studentId });
    if (!user) {
      user = await User.create({
        student_id: studentId,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log('Callback: Created new user');
    } else {
      console.log('Callback: Found existing user');
    }

    // Generate service token with name included
    const serviceToken = generateToken({
      _id: user._id.toString(),
      student_id: user.student_id,
      remark: user.remark,
      name: userName,
    });

    console.log('Callback: Generated service token, redirecting to /vote');
    // Create response with redirect
    const response = NextResponse.redirect(new URL('/vote', request.url));
    
    // Set token in cookie
    response.cookies.set('service_token', serviceToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 1 day
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    console.error('OAuth callback error:', errorMessage);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }
}
