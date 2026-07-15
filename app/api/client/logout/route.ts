import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth/session';
import { clearSessionCookie, currentToken } from '@/lib/auth/cookies';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  destroySession(currentToken('client'));
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res, 'client');
  return res;
}
