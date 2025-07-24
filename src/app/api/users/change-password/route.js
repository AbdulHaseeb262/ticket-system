import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { hash } from 'bcryptjs';

const COLLECTION = 'users';

export async function POST(req) {
  const { userId, password } = await req.json();
  if (!userId || !password) return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  const client = await clientPromise;
  const db = client.db();
  const hashed = await hash(password, 10);
  await db.collection(COLLECTION).updateOne(
    { _id: typeof userId === 'string' ? new ObjectId(userId) : userId },
    { $set: { password: hashed } }
  );
  return NextResponse.json({ success: true });
} 