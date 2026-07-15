import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin, createSession } from '@/lib/auth/session';
import { setSessionCookie } from '@/lib/auth/cookies';

// ============================================================================
// Login admin: email + password (scrypt) → cookie sesi httpOnly. Akun admin
// di-seed dari env ADMIN_EMAIL/ADMIN_PASSWORD saat pertama (lihat session.ts).
// ============================================================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Schema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Body bukan JSON.' }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Data tidak valid.' }, { status: 400 });
  }

  const subject = verifyAdmin(parsed.data.email, parsed.data.password);
  if (!subject) {
    return NextResponse.json({ ok: false, error: 'Email atau password salah.' }, { status: 401 });
  }

  const token = createSession('admin', subject);
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, 'admin', token);
  return res;
}
