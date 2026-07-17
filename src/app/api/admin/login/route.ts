import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const inputEmail = (email || '').trim().toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@olart.com').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';

    if (inputEmail === adminEmail && password === adminPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid administrator credentials.' }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to authenticate admin' }, { status: 500 });
  }
}
