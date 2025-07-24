 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { NextResponse } from 'next/server';
import { simpleParser } from 'mailparser';
import clientPromise from '@/lib/mongodb';
import MsgReader from '@kenjiuno/msgreader';

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file') ;
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const assignee = formData.get('assignee');
  let parsed = null;
  let result = {};
  let usedMsgReader = false;
  try {
    parsed = await simpleParser(buffer);
    result = {
      from: _optionalChain([parsed, 'access', _ => _.from, 'optionalAccess', _2 => _2.text]) || '',
      to: _optionalChain([parsed, 'access', _3 => _3.to, 'optionalAccess', _4 => _4.text]) || '',
      subject: parsed.subject || '',
      text: parsed.text || '',
      html: parsed.html || '',
      attachments: (parsed.attachments || []).map((a) => ({
        filename: a.filename,
        contentType: a.contentType,
        size: a.size
      }))
    };
  } catch (e) {
    // Fallback für .msg-Dateien
    try {
      // MsgReader erwartet Uint8Array
      const msg = new (MsgReader )(new Uint8Array(buffer));
      const msgData = msg.getFileData();
      usedMsgReader = true;
      result = {
        from: msgData.senderEmail || '',
        to: _optionalChain([msgData, 'access', _5 => _5.recipients, 'optionalAccess', _6 => _6.map, 'call', _7 => _7((r) => r.email), 'access', _8 => _8.join, 'call', _9 => _9(', ')]) || '',
        subject: msgData.subject || '',
        text: msgData.body || '',
        html: '',
        attachments: (msgData.attachments || []).map((a) => ({
          filename: a.fileName,
          contentType: a.mimeType,
          size: _optionalChain([a, 'access', _10 => _10.data, 'optionalAccess', _11 => _11.length]) || 0
        }))
      };
    } catch (err) {
      return NextResponse.json({ error: 'Datei konnte nicht als E-Mail gelesen werden.' }, { status: 400 });
    }
  }

  // Automatische Ticket-Erstellung
  try {
    const client = await clientPromise;
    const db = client.db();
    // Versuche, den Kunden anhand der E-Mail zu finden
    const fromEmail = _optionalChain([(usedMsgReader ? result.from : _optionalChain([parsed, 'access', _12 => _12.from, 'optionalAccess', _13 => _13.value, 'optionalAccess', _14 => _14[0], 'optionalAccess', _15 => _15.address])), 'optionalAccess', _16 => _16.toLowerCase, 'call', _17 => _17()]) || '';
    let customer = null;
    if (fromEmail) {
      customer = await db.collection('customers').findOne({ email: { $regex: `^${fromEmail}$`, $options: 'i' } });
    }
    if (customer) {
      // Ticket anlegen
      // Fälligkeitsdatum: nächster Tag, 17:00
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);
      dueDate.setHours(17, 0, 0, 0);
      const ticket = {
        customerId: customer._id,
        subject: result.subject || '(Kein Betreff)',
        desc: result.text || result.html || '',
        status: 'offen',
        prio: 'mittel',
        createdAt: new Date(),
        due: dueDate.toISOString(),
        file: _optionalChain([result, 'access', _18 => _18.attachments, 'access', _19 => _19[0], 'optionalAccess', _20 => _20.filename]),
        assignee: assignee || undefined,
      };
      const ticketResult = await db.collection('tickets').insertOne(ticket);
      return NextResponse.json({ ...result, ticketId: ticketResult.insertedId, ticketCreated: true });
    } else {
      return NextResponse.json({ ...result, ticketCreated: false, error: 'Kein Kunde mit dieser Absender-E-Mail gefunden.' });
    }
  } catch (e) {
    return NextResponse.json({ ...result, ticketCreated: false, error: 'Fehler beim automatischen Ticket-Erstellen.' });
  }
} 