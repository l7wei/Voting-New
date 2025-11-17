import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import {
  getVoterListStats,
  saveVoterList,
  restoreVoterListBackup,
  validateVoterCSV,
  loadVoterList,
} from '@/lib/utils/voterList';

// GET /api/admin/voters - Get voter list statistics
export async function GET(req: NextRequest) {
  const user = await requireAdmin(req);
  if (user instanceof NextResponse) return user;

  try {
    const stats = getVoterListStats();
    const voterList = loadVoterList();

    return NextResponse.json({
      success: true,
      stats,
      preview: Array.from(voterList).slice(0, 10), // First 10 for preview
    });
  } catch (error) {
    console.error('Error getting voter list:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get voter list' },
      { status: 500 }
    );
  }
}

// POST /api/admin/voters - Upload voter list CSV
export async function POST(req: NextRequest) {
  const user = await requireAdmin(req);
  if (user instanceof NextResponse) return user;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();

    // Validate CSV format
    if (!validateVoterCSV(content)) {
      return NextResponse.json(
        { success: false, error: 'Invalid CSV format. File should contain only alphanumeric student IDs.' },
        { status: 400 }
      );
    }

    // Save voter list
    saveVoterList(content);

    // Get updated stats
    const stats = getVoterListStats();

    return NextResponse.json({
      success: true,
      message: 'Voter list uploaded successfully',
      stats,
    });
  } catch (error) {
    console.error('Error uploading voter list:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload voter list' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/voters - Restore from backup
export async function PUT(req: NextRequest) {
  const user = await requireAdmin(req);
  if (user instanceof NextResponse) return user;

  try {
    const success = restoreVoterListBackup();

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'No backup file found' },
        { status: 404 }
      );
    }

    const stats = getVoterListStats();

    return NextResponse.json({
      success: true,
      message: 'Voter list restored from backup',
      stats,
    });
  } catch (error) {
    console.error('Error restoring voter list:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to restore voter list' },
      { status: 500 }
    );
  }
}
