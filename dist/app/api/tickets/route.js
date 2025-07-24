 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION = 'tickets';

export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  const tickets = await db.collection(COLLECTION).find({}).sort({ datum: -1 }).toArray();
  return NextResponse.json(tickets);
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

// --- Cronjob für Updates-Termin-Benachrichtigung ---
import cron from 'node-cron';
const fetch = require('node-fetch');

let notifiedIds = new Set();

cron.schedule('*/5 * * * *', async () => {
  try {
    const client = await clientPromise;
    const db = client.db();
    // Nur Tickets mit Thema 'Updates' und Termin
    const now = new Date();
    const in15 = new Date(now.getTime() + 15 * 60 * 1000);
    const tickets = await db.collection(COLLECTION).find({
      updateAppointment: { $exists: true, $ne: '' },
      updateType: { $exists: true },
    }).toArray();
    for (const t of tickets) {
      if (!t.updateAppointment) continue;
      const appt = new Date(t.updateAppointment);
      // Nur wenn Termin in 15 Minuten liegt (±2.5min Toleranz)
      const diff = (appt.getTime() - in15.getTime()) / 60000;
      if (diff > -2.5 && diff < 2.5 && !notifiedIds.has(t._id.toString())) {
        // E-Mail-Adresse bestimmen (z.B. Ticket-Zuweisung oder Fallback)
        let to = '';
        if (t.assignee) {
          const user = await db.collection('users').findOne({ _id: t.assignee });
          to = _optionalChain([user, 'optionalAccess', _ => _.email]) || '';
        }
        if (!to) continue;
        // E-Mail senden
        await fetch('http://localhost:3000/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to,
            subject: 'Update-Termin in 15 Minuten',
            text: `Das Update-Ticket '${t.subject || t._id}' ist für ${appt.toLocaleString('de-DE')} geplant.`,
          })
        });
        notifiedIds.add(t._id.toString());
      }
    }
  } catch (e) {
    // Fehler ignorieren
  }
}); 