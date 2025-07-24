import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION = 'comments';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticketId = searchParams.get('ticketId');
  const client = await clientPromise;
  const db = client.db();
  const filter = ticketId ? { ticketId } : {};
  const comments = await db.collection(COLLECTION).find(filter).sort({ createdAt: 1 }).toArray();
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  data.createdAt = new Date();
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection(COLLECTION).insertOne(data);

  // Tagging-Logik: Suche nach @Benutzername im Kommentartext
  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  const allUsers = await db.collection('users').find({}).toArray();
  const mentionedUsers = allUsers.filter(u => {
    const uname = (u.name || '').trim();
    if (!uname) return false;
    const pattern = new RegExp('@' + escapeRegExp(uname), 'i');
    return pattern.test(data.text);
  });
  for (const user of mentionedUsers) {
    await db.collection('notifications').insertOne({
      userId: user._id.toString(),
      ticketId: data.ticketId,
      comment: data.text,
      from: data.author,
      createdAt: new Date(),
      read: false,
      type: 'mention',
      message: `${data.author} hat dich in einem Kommentar erwähnt: ${data.text}`
    });
  }

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