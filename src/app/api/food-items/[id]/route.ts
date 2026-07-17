import { NextResponse } from 'next/server';
import { getMongoDb } from '@/mongo';
import { serverState } from '@/src/lib/server-state';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const updatedItem = await request.json();
    delete updatedItem._id; // Ensure MongoDB internal ID is not mutated

    const connection = await getMongoDb();
    if (connection.isConnected && connection.db) {
      const collection = connection.db.collection('food_items');
      await collection.updateOne({ id }, { $set: updatedItem });
      return NextResponse.json({ success: true, item: updatedItem });
    } else {
      serverState.memoryFoodItems = serverState.memoryFoodItems.map(it => 
        it.id === id ? { ...it, ...updatedItem } : it
      );
      return NextResponse.json({ success: true, item: updatedItem });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update food item' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const connection = await getMongoDb();
    if (connection.isConnected && connection.db) {
      const collection = connection.db.collection('food_items');
      await collection.deleteOne({ id });
      return NextResponse.json({ success: true });
    } else {
      serverState.memoryFoodItems = serverState.memoryFoodItems.filter(it => it.id !== id);
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete food item' }, { status: 500 });
  }
}
