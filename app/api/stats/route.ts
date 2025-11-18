import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { Activity } from '@/lib/models/Activity';
import { Option } from '@/lib/models/Option';
import { Vote } from '@/lib/models/Vote';
import connectDB from '@/lib/db';

// GET /api/stats?activity_id=xxx - Get statistics for an activity (Admin only)
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

    if (!activity_id) {
      return createErrorResponse('activity_id is required');
    }

    // Get activity
    const activity = await Activity.findById(activity_id).populate('options');
    if (!activity) {
      return createErrorResponse('Activity not found', 404);
    }

    // Get all votes for this activity
    const votes = await Vote.find({ activity_id });

    // Calculate statistics
    const totalVotes = votes.length;
    const totalEligibleVoters = activity.users.length;
    const turnoutRate = totalEligibleVoters > 0 
      ? (totalEligibleVoters / totalEligibleVoters * 100).toFixed(2) 
      : 0;

    // Calculate vote distribution by option
    const optionStats: Record<string, {
      option_id: string;
      name: string;
      support: number;
      oppose: number;
      neutral: number;
      total: number;
    }> = {};

    // Initialize stats for all options
    const options = await Option.find({ activity_id });
    options.forEach(option => {
      const optionId = option._id.toString();
      const candidateName = option.candidate?.name || 'Unknown';
      
      optionStats[optionId] = {
        option_id: optionId,
        name: candidateName,
        support: 0,
        oppose: 0,
        neutral: 0,
        total: 0,
      };
    });

    // Count votes
    if (activity.rule === 'choose_all') {
      votes.forEach(vote => {
        vote.choose_all?.forEach(choice => {
          const optionId = choice.option_id.toString();
          if (optionStats[optionId]) {
            optionStats[optionId].total++;
            
            if (choice.remark === '我要投給他') {
              optionStats[optionId].support++;
            } else if (choice.remark === '我不投給他') {
              optionStats[optionId].oppose++;
            } else if (choice.remark === '我沒有意見') {
              optionStats[optionId].neutral++;
            }
          }
        });
      });
    } else if (activity.rule === 'choose_one') {
      votes.forEach(vote => {
        if (vote.choose_one) {
          const optionId = vote.choose_one.toString();
          if (optionStats[optionId]) {
            optionStats[optionId].support++;
            optionStats[optionId].total++;
          }
        }
      });
    }

    return createSuccessResponse({
      activity: {
        id: activity._id,
        name: activity.name,
        type: activity.type,
        rule: activity.rule,
        open_from: activity.open_from,
        open_to: activity.open_to,
      },
      statistics: {
        totalVotes,
        totalEligibleVoters,
        turnoutRate,
        optionStats: Object.values(optionStats),
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get statistics';
    console.error('Get statistics error:', error);
    return createErrorResponse(errorMessage, 500);
  }
}
