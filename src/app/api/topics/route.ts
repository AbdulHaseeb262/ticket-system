import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION = 'topics';

export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  const topics = await db.collection(COLLECTION).find({}).sort({ name: 1 }).toArray();
  return NextResponse.json(topics);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const client = await clientPromise;
  const db = client.db();
  // Prüfung: Gibt es schon ein Topic mit gleichem Namen (case-insensitive, getrimmt)?
  const name = (data.name || '').trim();
  const exists = await db.collection('topics').findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
  if (exists) {
    return NextResponse.json({ error: 'Thema existiert bereits!' }, { status: 400 });
  }
  const result = await db.collection('topics').insertOne({ ...data, name });
  return NextResponse.json({ insertedId: result.insertedId });
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { _id, ...update } = data;
  const client = await clientPromise;
  const db = client.db();
  await db.collection(COLLECTION).updateOne({ _id: new ObjectId(_id) }, { $set: update });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { _id } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(_id) });
  return NextResponse.json({ success: true });
} 