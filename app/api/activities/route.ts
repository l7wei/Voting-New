import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { Activity } from '@/lib/models/Activity';
import connectDB from '@/lib/db';

// GET /api/activities - List all activities
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const includeOptions = searchParams.get('include_options') === 'true';

    let query = Activity.find().sort({ created_at: -1 });
    
    if (includeOptions) {
      query = query.populate('options');
    }

    const activities = await query.exec();

    return createSuccessResponse(activities);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get activities';
    console.error('Get activities error:', error);
    return createErrorResponse(errorMessage, 500);
  }
}

// POST /api/activities - Create new activity (Admin only)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, subtitle, description, rule, open_from, open_to } = body;

    // Validate required fields
    if (!name || !rule || !open_from || !open_to) {
      return createErrorResponse('Missing required fields');
    }

    // Validate rule
    const allowRules = ['choose_all', 'choose_one'];
    if (!allowRules.includes(rule)) {
      return createErrorResponse(`Invalid rule: ${rule}`);
    }

    // Validate dates
    const openFrom = new Date(open_from);
    const openTo = new Date(open_to);

    if (isNaN(openFrom.getTime()) || isNaN(openTo.getTime())) {
      return createErrorResponse('Invalid date format');
    }

    if (openFrom >= openTo) {
      return createErrorResponse('open_from must be before open_to');
    }

    const activity = await Activity.create({
      name,
      subtitle,
      description,
      rule,
      open_from: openFrom,
      open_to: openTo,
      users: [],
      options: [],
      created_at: new Date(),
      updated_at: new Date(),
    });

    return createSuccessResponse(activity, 201);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create activity';
    console.error('Create activity error:', error);
    return createErrorResponse(errorMessage, 500);
  }
}
