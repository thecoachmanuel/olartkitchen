import { NextResponse } from 'next/server';
import { getMongoDb } from '@/mongo';
import { serverState } from '@/src/lib/server-state';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { status } = await request.json();

    const connection = await getMongoDb();
    if (connection.isConnected && connection.db) {
      const collection = connection.db.collection('orders');
      await collection.updateOne({ id }, { $set: { status } });
      return NextResponse.json({ success: true });
    } else {
      serverState.memoryOrders = serverState.memoryOrders.map(o => 
        o.id === id ? { ...o, status } : o
      );
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update order status' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const connection = await getMongoDb();
    if (connection.isConnected && connection.db) {
      const collection = connection.db.collection('orders');
      await collection.deleteOne({ id });
      return NextResponse.json({ success: true });
    } else {
      serverState.memoryOrders = serverState.memoryOrders.filter(o => o.id !== id);
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete order' }, { status: 500 });
  }
}
