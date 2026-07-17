import { NextResponse } from 'next/server';
import { getMongoDb } from '@/mongo';
import { serverState } from '@/src/lib/server-state';
import { SEED_ORDERS } from '@/src/data';

export async function GET() {
  try {
    const connection = await getMongoDb();
    if (connection.isConnected && connection.db) {
      const collection = connection.db.collection('orders');
      let orders = await collection.find({}).sort({ createdAt: -1 }).toArray();
      if (orders.length === 0) {
        await collection.insertMany(SEED_ORDERS);
        orders = await collection.find({}).sort({ createdAt: -1 }).toArray();
      }
      return NextResponse.json(orders);
    } else {
      return NextResponse.json(serverState.memoryOrders);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newOrder = await request.json();
    const connection = await getMongoDb();
    if (connection.isConnected && connection.db) {
      const collection = connection.db.collection('orders');
      await collection.insertOne(newOrder);
      return NextResponse.json({ success: true, order: newOrder });
    } else {
      serverState.memoryOrders.unshift(newOrder);
      return NextResponse.json({ success: true, order: newOrder });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to save order' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const connection = await getMongoDb();
    if (connection.isConnected && connection.db) {
      const collection = connection.db.collection('orders');
      await collection.deleteMany({});
      return NextResponse.json({ success: true });
    } else {
      serverState.memoryOrders = [];
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to clear orders' }, { status: 500 });
  }
}
