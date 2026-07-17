import { NextResponse } from 'next/server';
import { getMongoDb } from '@/mongo';
import { serverState } from '@/src/lib/server-state';
import { INITIAL_FOOD_ITEMS } from '@/src/data';

export async function GET() {
  try {
    const connection = await getMongoDb();
    if (connection.isConnected && connection.db) {
      const collection = connection.db.collection('food_items');
      let items = await collection.find({}).toArray();
      if (items.length === 0) {
        await collection.insertMany(INITIAL_FOOD_ITEMS);
        items = await collection.find({}).toArray();
      }
      return NextResponse.json(items);
    } else {
      return NextResponse.json(serverState.memoryFoodItems);
    }
  } catch (error: any) {
    console.error("GET /api/food-items error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to load food items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newItem = await request.json();
    const connection = await getMongoDb();
    if (connection.isConnected && connection.db) {
      const collection = connection.db.collection('food_items');
      await collection.insertOne(newItem);
      return NextResponse.json({ success: true, item: newItem });
    } else {
      serverState.memoryFoodItems.unshift(newItem);
      return NextResponse.json({ success: true, item: newItem });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to save food item' }, { status: 500 });
  }
}
