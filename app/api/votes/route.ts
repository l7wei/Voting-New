import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { Activity } from '@/lib/models/Activity';
import { Option } from '@/lib/models/Option';
import { Vote } from '@/lib/models/Vote';
import { loadVoterList, isStudentEligible } from '@/lib/voterList';
import connectDB from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    await connectDB();

    const body = await request.json();
    const { activity_id, rule, choose_all, choose_one } = body;

    // Validate rule
    const allowRules = ['choose_all', 'choose_one'];
    if (!allowRules.includes(rule)) {
      return createErrorResponse(`Invalid rule: ${rule}`);
    }

    if (!body[rule]) {
      return createErrorResponse(`Missing ${rule} parameter`);
    }

    // Validate choose_all remark if applicable
    if (rule === 'choose_all') {
      const validRemarks = ['我要投給他', '我不投給他', '我沒有意見'];
      const allValid = choose_all.every((choice: { remark: string }) => 
        validRemarks.includes(choice.remark)
      );
      if (!allValid) {
        return createErrorResponse('Invalid remark in choose_all');
      }
    }

    // Check if student is eligible to vote
    const voterList = await loadVoterList();
    if (!isStudentEligible(user.student_id, voterList)) {
      return createErrorResponse('Student is not eligible to vote', 403);
    }

    // Get all options
    const optionIds = rule === 'choose_all' 
      ? choose_all.map((c: { option_id: string }) => c.option_id)
      : [choose_one];

    // Validate activity and options
    const activity = await Activity.findById(activity_id);
    if (!activity) {
      return createErrorResponse('Activity not found', 404);
    }

    const options = await Option.find({ 
      _id: { $in: optionIds }, 
      activity_id 
    });

    if (options.length !== optionIds.length) {
      return createErrorResponse('Invalid options');
    }

    // Check if user already voted
    const hasVoted = activity.users.includes(user.student_id);
    if (hasVoted) {
      return createErrorResponse('User has already voted', 400);
    }

    // Check activity time window
    const now = new Date();
    if (now < activity.open_from) {
      return createErrorResponse('Voting has not started yet', 400);
    }
    if (now > activity.open_to) {
      return createErrorResponse('Voting has ended', 400);
    }

    // Validate rule matches activity
    if (activity.rule !== rule) {
      return createErrorResponse('Rule does not match activity rule');
    }

    // Create vote with UUID token for anonymity
    const token = uuidv4();
    const voteData: Record<string, unknown> = {
      activity_id,
      rule,
      token,
      created_at: new Date(),
      updated_at: new Date(),
    };

    if (rule === 'choose_all') {
      voteData.choose_all = choose_all;
    } else {
      voteData.choose_one = choose_one;
    }

    const vote = await Vote.create(voteData);

    // Add student_id to activity's voted users list
    await Activity.updateOne(
      { _id: activity_id },
      { $addToSet: { users: user.student_id } }
    );

    return createSuccessResponse(vote, 201);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create vote';
    console.error('Create vote error:', error);
    return createErrorResponse(errorMessage, 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user and require admin
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const adminCheck = await requireAdmin(user);
    if (adminCheck) {
      return adminCheck;
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const activity_id = searchParams.get('activity_id');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');

    const filter: Record<string, unknown> = {};
    if (activity_id) {
      filter.activity_id = activity_id;
    }

    const total = await Vote.countDocuments(filter);
    const data = await Vote.find(filter)
      .limit(limit)
      .skip(skip)
      .sort({ created_at: -1 });

    return createSuccessResponse({ total, data });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get votes';
    console.error('Get votes error:', error);
    return createErrorResponse(errorMessage, 500);
  }
}
