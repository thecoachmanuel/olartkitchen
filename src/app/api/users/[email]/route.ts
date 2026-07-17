import { NextResponse } from 'next/server';
import { getMongoDb } from '@/mongo';
import { serverState } from '@/src/lib/server-state';

export async function DELETE(request: Request, context: { params: Promise<{ email: string }> }) {
  try {
    const { email } = await context.params;

    const connection = await getMongoDb();
    if (connection.isConnected && connection.db) {
      const collection = connection.db.collection('users');
      await collection.deleteOne({ email: email.toLowerCase() });
      return NextResponse.json({ success: true });
    } else {
      serverState.memoryUsers = serverState.memoryUsers.filter(u => u.email.toLowerCase() !== email.toLowerCase());
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete user' }, { status: 500 });
  }
}
