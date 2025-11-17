import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User';
import { signToken } from '@/lib/auth/jwt';

// Mock OAuth login for development
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Mock login is only available in development mode' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('student_id') || '108000000';

  try {
    await dbConnect();

    // Find or create user
    let user = await User.findOne({ student_id: studentId });
    
    if (!user) {
      user = await User.create({
        student_id: studentId,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    // Create JWT token
    const token = signToken({
      student_id: user.student_id,
      _id: user._id.toString(),
      remark: user.remark,
    });

    // Set cookie and redirect
    const response = NextResponse.redirect(new URL('/voting', req.url));
    response.cookies.set('service_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Mock login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
