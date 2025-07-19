import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { firebaseToken, email, name } = await request.json();
    if (!firebaseToken || !email) {
      return NextResponse.json({ error: 'Firebase token and email are required' }, { status: 400 });
    }
    // 直接轉發到後端 API
    const backendRes = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5001'}/api/auth/firebase-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseToken, email, name })
    });
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('Proxy to backend firebase-login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
} 