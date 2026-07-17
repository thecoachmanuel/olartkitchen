import { NextResponse } from 'next/server';
import { getMongoDb } from '@/mongo';
import { serverState } from '@/src/lib/server-state';

const DEFAULT_USERS_SEED = [
  {
    name: 'Adewale Olaitan',
    email: 'manueloliver2908@gmail.com',
    phone: '08031234567',
    password: 'password123',
    createdAt: new Date().toISOString(),
  }
];

export async function GET() {
  try {
    const connection = await getMongoDb();
    if (connection.isConnected && connection.db) {
      const collection = connection.db.collection('users');
      let users = await collection.find({}).toArray();
      if (users.length === 0) {
        await collection.insertMany(DEFAULT_USERS_SEED);
        users = await collection.find({}).toArray();
      }
      return NextResponse.json(users);
    } else {
      return NextResponse.json(serverState.memoryUsers);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await request.json();
    if (!user.email) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }
    const connection = await getMongoDb();
    if (connection.isConnected && connection.db) {
      const collection = connection.db.collection('users');
      const existing = await collection.findOne({ email: user.email.toLowerCase() });
      if (existing) {
        await collection.updateOne({ email: user.email.toLowerCase() }, { $set: user });
      } else {
        await collection.insertOne(user);
      }
      return NextResponse.json({ success: true, user });
    } else {
      const idx = serverState.memoryUsers.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
      if (idx >= 0) {
        serverState.memoryUsers[idx] = user;
      } else {
        serverState.memoryUsers.push(user);
      }
      return NextResponse.json({ success: true, user });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to save user' }, { status: 500 });
  }
}
