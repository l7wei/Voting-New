import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getUserInfo } from '@/lib/oauth';
import { generateToken } from '@/lib/auth';
import { User } from '@/lib/models/User';
import connectDB from '@/lib/db';
import { isAdmin } from '@/lib/adminConfig';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error === 'access_denied' || !code) {
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
    }

    // Exchange code for access token
    const tokenInfo = await exchangeCodeForToken(code);
    
    // Get user info
    const userInfo = await getUserInfo(tokenInfo.access_token);
    const studentId = userInfo.Userid;

    // Connect to database
    await connectDB();

    // Check if user is admin
    const adminStatus = isAdmin(studentId);

    // Find or create user
    let user = await User.findOne({ student_id: studentId });
    if (!user) {
      user = await User.create({
        student_id: studentId,
        remark: adminStatus ? 'admin' : undefined,
        created_at: new Date(),
        updated_at: new Date(),
      });
    } else if (adminStatus && user.remark !== 'admin') {
      // Update user to admin if they are in the admin list
      user.remark = 'admin';
      user.updated_at = new Date();
      await user.save();
    }

    // Generate service token
    const serviceToken = generateToken({
      _id: user._id.toString(),
      student_id: user.student_id,
      remark: user.remark,
    });

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
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }
}
