import { NextRequest, NextResponse } from 'next/server';
import { consumeMagicToken } from '@/lib/auth/magic';
import { createSession } from '@/lib/auth/session';
import { setSessionCookie } from '@/lib/auth/cookies';
import { publicBaseUrl } from '@/lib/url';

// Client mengunjungi magic-link → tukar token jadi sesi → arahkan ke /kirim.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') ?? '';
  const slug = token ? consumeMagicToken(token) : null;
  const base = publicBaseUrl(req);

  if (!slug) {
    // Token invalid/kedaluwarsa → arahkan ke beranda dengan pesan.
    return NextResponse.redirect(new URL('/?e=magic', base));
  }

  const sessionToken = createSession('client', slug);
  const res = NextResponse.redirect(new URL(`/u/${slug}/kirim`, base));
  setSessionCookie(res, 'client', sessionToken);
  return res;
}
