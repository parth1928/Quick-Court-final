import { NextResponse } from 'next/server';
import { verifyEmailConfig, sendOTPEmail } from '@/utils/sendEmail';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const ok = await verifyEmailConfig();
    if (!ok) return NextResponse.json({ ok: false, message: 'Transport verify failed' }, { status: 500 });
    return NextResponse.json({ ok: true, message: 'SMTP transport verified' });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
    const otp = '123456';
    const sent = await sendOTPEmail({ email, otp, userName: 'Test', expiryMinutes: 5 });
    if (!sent) return NextResponse.json({ ok: false, message: 'send failed' }, { status: 500 });
    return NextResponse.json({ ok: true, message: 'Test OTP email sent (static 123456)' });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
