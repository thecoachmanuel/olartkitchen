import { NextResponse } from 'next/server';
import { getMongoDb } from '@/mongo';
import { serverState } from '@/src/lib/server-state';

export async function PUT(request: Request, context: { params: Promise<{ name: string }> }) {
  try {
    const oldName = decodeURIComponent((await context.params).name);
    const { name } = await request.json();
    const connection = await getMongoDb();
    if (connection.isConnected && connection.db) {
      const collection = connection.db.collection('categories');
      await collection.updateOne({ name: oldName }, { $set: { name } });
      const foodCol = connection.db.collection('food_items');
      await foodCol.updateMany({ category: oldName }, { $set: { category: name } });
      return NextResponse.json({ success: true });
    } else {
      serverState.memoryCategories = serverState.memoryCategories.map(c => c === oldName ? name : c);
      serverState.memoryFoodItems = serverState.memoryFoodItems.map(f => 
        f.category === oldName ? { ...f, category: name } : f
      );
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ name: string }> }) {
  try {
    const name = decodeURIComponent((await context.params).name);
    const { fallback } = await request.json();
    const connection = await getMongoDb();
    if (connection.isConnected && connection.db) {
      const collection = connection.db.collection('categories');
      await collection.deleteOne({ name });
      const foodCol = connection.db.collection('food_items');
      await foodCol.updateMany({ category: name }, { $set: { category: fallback } });
      return NextResponse.json({ success: true });
    } else {
      serverState.memoryCategories = serverState.memoryCategories.filter(c => c !== name);
      serverState.memoryFoodItems = serverState.memoryFoodItems.map(f => 
        f.category === name ? { ...f, category: fallback } : f
      );
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete category' }, { status: 500 });
  }
}
