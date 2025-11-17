import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import { Vote, Activity, Option } from '@/lib/db/models';
import { requireAuth } from '@/lib/auth/middleware';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// GET /api/votes - Get votes (admin only)
export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.remark !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Admin access required' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const activityId = searchParams.get('activity_id');

  try {
    await dbConnect();

    const query = activityId && mongoose.Types.ObjectId.isValid(activityId)
      ? { activity_id: activityId }
      : {};

    const votes = await Vote.find(query);

    return NextResponse.json({
      success: true,
      votes,
    });
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}

// POST /api/votes - Submit a vote
export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    await dbConnect();

    const body = await req.json();
    const { activity_id, votes: userVotes } = body;

    if (!activity_id || !userVotes || !Array.isArray(userVotes)) {
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

    // Verify activity exists and is open
    const activity = await Activity.findById(activity_id);
    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    if (now < activity.open_from || now > activity.open_to) {
      return NextResponse.json(
        { success: false, error: 'Voting is not currently open for this activity' },
        { status: 400 }
      );
    }

    // Check if user has already voted
    const existingVote = await Vote.findOne({
      student_id: user.student_id,
      activity_id,
    });

    if (existingVote) {
      return NextResponse.json(
        { success: false, error: 'You have already voted in this activity' },
        { status: 400 }
      );
    }

    // Create votes
    const voteToken = uuidv4();
    const voteDocs = userVotes.map((vote: { option_id: string; agree: string }) => ({
      student_id: user.student_id,
      activity_id,
      option_id: vote.option_id,
      vote_token: voteToken,
      agree: vote.agree,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await Vote.insertMany(voteDocs);

    return NextResponse.json({
      success: true,
      message: 'Vote submitted successfully',
      vote_token: voteToken,
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting vote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit vote' },
      { status: 500 }
    );
  }
}
