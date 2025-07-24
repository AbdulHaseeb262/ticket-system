import { NextRequest, NextResponse } from 'next/server';
import { simpleParser } from 'mailparser';
import clientPromise from '@/lib/mongodb';
import MsgReader from '@kenjiuno/msgreader';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const assignee = formData.get('assignee');
  let parsed: any = null;
  let result: any = {};
  let usedMsgReader = false;
  try {
    parsed = await simpleParser(buffer);
    result = {
      from: parsed.from?.text || '',
      to: parsed.to?.text || '',
      subject: parsed.subject || '',
      text: parsed.text || '',
      html: parsed.html || '',
      attachments: (parsed.attachments || []).map((a: any) => ({
        filename: a.filename,
        contentType: a.contentType,
        size: a.size
      }))
    };
  } catch (e) {
    // Fallback für .msg-Dateien
    try {
      // MsgReader erwartet Uint8Array
      const msg = new (MsgReader as any)(new Uint8Array(buffer));
      const msgData = msg.getFileData();
      usedMsgReader = true;
      result = {
        from: msgData.senderEmail || '',
        to: msgData.recipients?.map((r: any) => r.email).join(', ') || '',
        subject: msgData.subject || '',
        text: msgData.body || '',
        html: '',
        attachments: (msgData.attachments || []).map((a: any) => ({
          filename: a.fileName,
          contentType: a.mimeType,
          size: a.data?.length || 0
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
    const fromEmail = (usedMsgReader ? result.from : parsed.from?.value?.[0]?.address)?.toLowerCase() || '';
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
        file: result.attachments[0]?.filename,
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