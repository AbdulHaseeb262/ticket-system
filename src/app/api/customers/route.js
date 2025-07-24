import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION = 'customers';

export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  const customers = await db.collection(COLLECTION).find({}).sort({ name: 1 }).toArray();
  return NextResponse.json(customers);
}

export async function POST(req) {
  const data = await req.json();
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection(COLLECTION).insertOne(data);
  return NextResponse.json({ insertedId: result.insertedId });
}

export async function PUT(req) {
  const data = await req.json();
  const { _id, ...update } = data;
  const client = await clientPromise;
  const db = client.db();
  await db.collection(COLLECTION).updateOne({ _id: new ObjectId(_id) }, { $set: update });
  return NextResponse.json({ success: true });
}

export async function DELETE(req) {
  const { _id } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(_id) });
  return NextResponse.json({ success: true });
} 