import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION = 'notifications';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const client = await clientPromise;
  const db = client.db();
  const filter = userId ? { userId } : {};
  const notifications = await db.collection(COLLECTION).find(filter).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(notifications);
}

export async function POST(req) {
  const data = await req.json();
  data.createdAt = new Date();
  data.read = false;
  const client = await clientPromise;
  const db = client.db();
  // Duplikat-Prüfung: gleiche userId, ticketId, type, message, read=false
  const filter = {
    userId: data.userId,
    type: data.type,
    read: false
  };
  if (data.ticketId) filter.ticketId = data.ticketId;
  if (data.message) filter.message = data.message;
  const existing = await db.collection(COLLECTION).findOne(filter);
  if (existing) {
    return NextResponse.json({ duplicate: true, _id: existing._id });
  }
  const result = await db.collection(COLLECTION).insertOne(data);
  return NextResponse.json({ insertedId: result.insertedId });
}

export async function PUT(req) {
  const { _id } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  await db.collection(COLLECTION).updateOne({ _id: new ObjectId(_id) }, { $set: { read: true } });
  return NextResponse.json({ success: true });
}

export async function DELETE(req) {
  const { _id } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  await db.collection(COLLECTION).deleteOne({ _id });
  return NextResponse.json({ success: true });
} 