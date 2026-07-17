import { NextResponse } from 'next/server';
import { getMongoDb } from '@/mongo';
import { serverState } from '@/src/lib/server-state';
import { DEFAULT_ADMIN_SETTINGS } from '@/src/data';

export async function GET() {
  try {
    const connection = await getMongoDb();
    if (connection.isConnected && connection.db) {
      const collection = connection.db.collection('settings');
      let settings = await collection.findOne({});
      if (!settings) {
        await collection.insertOne(DEFAULT_ADMIN_SETTINGS);
        settings = await collection.findOne({});
      }
      return NextResponse.json(settings);
    } else {
      return NextResponse.json(serverState.memorySettings);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const settings = await request.json();
    delete settings._id;
    const connection = await getMongoDb();
    if (connection.isConnected && connection.db) {
      const collection = connection.db.collection('settings');
      await collection.deleteMany({});
      await collection.insertOne(settings);
      return NextResponse.json({ success: true, settings });
    } else {
      serverState.memorySettings = settings;
      return NextResponse.json({ success: true, settings });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to save settings' }, { status: 500 });
  }
}
