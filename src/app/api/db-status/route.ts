import { NextResponse } from 'next/server';
import { getDbStatus } from '@/mongo';

export async function GET() {
  try {
    const status = await getDbStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch DB status' }, { status: 500 });
  }
}
