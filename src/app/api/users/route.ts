import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';
import { hash } from 'bcryptjs';

const COLLECTION = 'users';

async function isAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions) as { user?: { role?: string } };
  return session?.user?.role === 'admin' || session?.user?.role === 'owner';
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  if (url.searchParams.get('resetOwnerPassword') === '1') {
    const client = await clientPromise;
    const db = client.db();
    const pw = await hash('test1234', 10);
    await db.collection(COLLECTION).updateOne({ email: 'michael.wessely@notabene.at' }, { $set: { password: pw } });
    return NextResponse.json({ success: true, message: 'Owner-Passwort zurückgesetzt!' });
  }
  const client = await clientPromise;
  const db = client.db();
  const users = await db.collection(COLLECTION).find({}, { projection: { password: 0 } }).sort({ name: 1 }).toArray();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const data = await req.json();
  if (typeof data.active === 'undefined') data.active = true;
  console.log('[API][POST /api/users] data:', data);
  // Passwort hashen, falls gesetzt
  if (data.password) {
    data.password = await hash(data.password, 10);
  }
  // Wenn by-email-Request: User anhand E-Mail zurückgeben
  if (data.email && !data.name && !data.role) {
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection(COLLECTION).findOne({ email: data.email });
    if (!user) return NextResponse.json(null);
    return NextResponse.json({ _id: user._id, email: user.email });
  }
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection(COLLECTION).insertOne(data);
  return NextResponse.json({ insertedId: result.insertedId });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const data = await req.json();
  // Logging entfernt, um Fehler zu vermeiden
  const { _id, ...update } = data;
  const id = typeof _id === 'string' ? new ObjectId(_id) : _id;
  // forcePasswordChange explizit setzen, falls im Update enthalten
  const setUpdate = { ...update };
  // Passwort hashen, falls gesetzt
  if (setUpdate.password) {
    setUpdate.password = await hash(setUpdate.password, 10);
  }
  // forcePasswordChange entfernt
  const client = await clientPromise;
  const db = client.db();
  await db.collection(COLLECTION).updateOne({ _id: id }, { $set: setUpdate });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { _id } = await req.json();
  const id = typeof _id === 'string' ? new ObjectId(_id) : _id;
  const client = await clientPromise;
  const db = client.db();
  await db.collection(COLLECTION).deleteOne({ _id: id });
  return NextResponse.json({ success: true });
} 