import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { recordNfcStamp } from '@sumarepo/api';
import { z } from 'zod';

const recordSchema = z.object({
  machineId: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  workDescription: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const validation = recordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: validation.error.issues }, { status: 400 });
    }

    const { machineId, latitude, longitude, workDescription } = validation.data;

    const result = await recordNfcStamp({
      userId,
      machineId,
      latitude,
      longitude,
      workDescription,
    });

    return NextResponse.json(result.fields, { status: 200 });

  } catch (error) {
    console.error('API Error in /api/nfc/record:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

    if (errorMessage.includes('not found')) {
      return NextResponse.json({ message: errorMessage }, { status: 404 });
    }

    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}




