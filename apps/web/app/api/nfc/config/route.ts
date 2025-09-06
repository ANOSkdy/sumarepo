import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getNfcConfig } from '@sumarepo/api';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const machineId = searchParams.get('machineid');

    if (!machineId) {
      return NextResponse.json({ message: 'machineid is required' }, { status: 400 });
    }

    const userId = session.user.id;
    const nfcConfig = await getNfcConfig(userId);

    return NextResponse.json(nfcConfig, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}




