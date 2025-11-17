import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import { Activity } from '@/lib/db/models';
import { requireAuth } from '@/lib/auth/middleware';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/activities/[id] - Get specific activity
export async function GET(req: NextRequest, { params }: RouteParams) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { id } = await params;

  try {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid activity ID' },
        { status: 400 }
      );
    }

    const activity = await Activity.findById(id);

    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

// PUT /api/activities/[id] - Update activity (admin only)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.remark !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Admin access required' },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid activity ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const updateData = {
      ...body,
      updated_at: new Date(),
    };

    // Convert date strings if provided
    if (body.open_from) updateData.open_from = new Date(body.open_from);
    if (body.open_to) updateData.open_to = new Date(body.open_to);

    const activity = await Activity.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update activity' },
      { status: 500 }
    );
  }
}

// DELETE /api/activities/[id] - Delete activity (admin only)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.remark !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Admin access required' },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid activity ID' },
        { status: 400 }
      );
    }

    const activity = await Activity.findByIdAndDelete(id);

    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Activity deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete activity' },
      { status: 500 }
    );
  }
}
