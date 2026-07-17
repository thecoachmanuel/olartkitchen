import { NextResponse } from 'next/server';
import { getMongoDb } from '@/mongo';
import { serverState } from '@/src/lib/server-state';

const DEFAULT_CATEGORIES_SEED = ['Rice Platters', 'Swallow & Soups', 'Ewa Aganyin & Beans', 'Grills & Suya', 'Chops & Sweet Things'];

export async function GET() {
  try {
    const connection = await getMongoDb();
    if (connection.isConnected && connection.db) {
      const collection = connection.db.collection('categories');
      let cats = await collection.find({}).toArray();
      if (cats.length === 0) {
        await collection.insertMany(DEFAULT_CATEGORIES_SEED.map(name => ({ name })));
        cats = await collection.find({}).toArray();
      }
      return NextResponse.json(cats.map((c: any) => c.name));
    } else {
      return NextResponse.json(serverState.memoryCategories);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const connection = await getMongoDb();
    if (connection.isConnected && connection.db) {
      const collection = connection.db.collection('categories');
      await collection.insertOne({ name });
      return NextResponse.json({ success: true });
    } else {
      if (!serverState.memoryCategories.includes(name)) {
        serverState.memoryCategories.push(name);
      }
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to save category' }, { status: 500 });
  }
}
