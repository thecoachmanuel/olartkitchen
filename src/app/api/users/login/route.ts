import { NextResponse } from 'next/server';
import { getMongoDb } from '@/mongo';
import { serverState } from '@/src/lib/server-state';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    const cleanEmail = email.trim().toLowerCase();
    const connection = await getMongoDb();
    
    if (connection.isConnected && connection.db) {
      const collection = connection.db.collection('users');
      const user = await collection.findOne({ email: cleanEmail });
      
      if (!user) {
        return NextResponse.json({ error: 'No account found with this email. Create an account during checkout or register below!' }, { status: 404 });
      }
      
      if (user.password !== password) {
        return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
      }
      
      // Return user without mutating MongoDB _id if needed, but Next.js automatically converts ObjectId to string
      const sanitizedUser = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        password: user.password
      };
      
      return NextResponse.json({ success: true, user: sanitizedUser });
    } else {
      const found = serverState.memoryUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (!found) {
        return NextResponse.json({ error: 'No account found with this email. Create an account during checkout or register below!' }, { status: 404 });
      }
      
      if (found.password !== password) {
        return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
      }
      
      return NextResponse.json({ success: true, user: found });
    }
  } catch (error: any) {
    console.error('API login error:', error);
    return NextResponse.json({ error: error?.message || 'Server error during login' }, { status: 500 });
  }
}
