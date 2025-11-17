import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import { Option, Activity } from '@/lib/db/models';
import { requireAuth } from '@/lib/auth/middleware';
import mongoose from 'mongoose';

// GET /api/options - Get all options for an activity
export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const activityId = searchParams.get('activity_id');

  try {
    await dbConnect();

    if (!activityId || !mongoose.Types.ObjectId.isValid(activityId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing activity_id' },
        { status: 400 }
      );
    }

    const options = await Option.find({ activity_id: activityId });

    return NextResponse.json({
      success: true,
      options,
    });
  } catch (error) {
    console.error('Error fetching options:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch options' },
      { status: 500 }
    );
  }
}

// POST /api/options - Create new option (admin only)
export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.remark !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Admin access required' },
      { status: 403 }
    );
  }

  try {
    await dbConnect();

    const body = await req.json();
    const { activity_id, type, candidate, vice1, vice2 } = body;

    if (!activity_id || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(activity_id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid activity_id' },
        { status: 400 }
      );
    }

    // Verify activity exists
    const activity = await Activity.findById(activity_id);
    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      );
    }

    const option = await Option.create({
      activity_id,
      type,
      candidate,
      vice1,
      vice2,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Add option to activity
    await Activity.findByIdAndUpdate(activity_id, {
      $push: { options: option._id },
    });

    return NextResponse.json({
      success: true,
      option,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating option:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create option' },
      { status: 500 }
    );
  }
}
