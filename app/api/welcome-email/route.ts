import { NextResponse } from 'next/server';
import { getWelcomeEmail } from '@/lib/services/email';

const RESEND_API_KEY = process.env.RESEND_API_KEY!;

export async function POST(req: Request) {
  try {
    const { email, fullName } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailTemplate = getWelcomeEmail(fullName || 'there');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'AfriNova <noreply@afrinova.com>',
        to: [email],
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    const result = await response.json();
    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
