import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { recordNfcStamp } from 'packages/api/src/nfcService';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const { machineId, latitude, longitude, workDescription } = body;

    if (!machineId || latitude === undefined || longitude === undefined || !workDescription) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const result = await recordNfcStamp({
      userId,
      machineId,
      latitude,
      longitude,
      workDescription,
    });

    return NextResponse.json(result.fields, { status: 201 });

  } catch (error) {
    console.error('API Error in /api/nfc/stamp:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

    // Check for specific error messages to return appropriate status codes
    if (errorMessage.includes('not found')) {
      return NextResponse.json({ message: errorMessage }, { status: 404 });
    }

    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}

