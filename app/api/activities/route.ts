import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import { Activity } from '@/lib/db/models';
import { requireAuth } from '@/lib/auth/middleware';

// GET /api/activities - Get all activities or available activities
export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const availableOnly = searchParams.get('available') === 'true';

  try {
    await dbConnect();

    let query = {};
    
    if (availableOnly) {
      const now = new Date();
      query = {
        open_from: { $lte: now },
        open_to: { $gte: now },
      };
    }

    const activities = await Activity.find(query).sort({ created_at: -1 });

    return NextResponse.json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST /api/activities - Create new activity (admin only)
export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  // Check admin permission
  if (user.remark !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Admin access required' },
      { status: 403 }
    );
  }

  try {
    await dbConnect();

    const body = await req.json();
    const { name, type, rule, open_from, open_to } = body;

    if (!name || !type || !rule || !open_from || !open_to) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const activity = await Activity.create({
      name,
      type,
      rule,
      open_from: new Date(open_from),
      open_to: new Date(open_to),
      users: [],
      options: [],
      created_at: new Date(),
      updated_at: new Date(),
    });

    return NextResponse.json({
      success: true,
      activity,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
