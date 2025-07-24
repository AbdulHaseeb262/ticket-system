import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const { to, subject, text, html } = await req.json();
  if (!to || !subject || !text) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: process.env.EMAIL_SERVER_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, text, html });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'E-Mail-Versand fehlgeschlagen', details: err }, { status: 500 });
  }
} 