import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';
import { isAdmin } from '@/lib/adminConfig';
import { User } from '@/lib/models/User';
import connectDB from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userid, name, inschool, uuid } = body;

    if (!userid || !name) {
      return NextResponse.json(
        { success: false, error: '請提供學號和姓名' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find or create user
    let user = await User.findOne({ student_id: userid });
    if (!user) {
      user = await User.create({
        student_id: userid,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    // Check if user is admin
    const userIsAdmin = isAdmin(userid);

    // Generate service token
    const serviceToken = generateToken({
      _id: user._id.toString(),
      student_id: user.student_id,
      remark: userIsAdmin ? 'admin' : user.remark,
    });

    // Determine redirect URL
    const redirectUrl = userIsAdmin ? '/admin' : '/vote';

    // Create response
    const response = NextResponse.json({
      success: true,
      redirectUrl,
      user: {
        student_id: userid,
        name,
        inschool: inschool === 'true',
        uuid,
        isAdmin: userIsAdmin,
      },
    });

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
    const errorMessage = error instanceof Error ? error.message : 'Mock login failed';
    console.error('Mock login error:', errorMessage);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
