import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { loadClientConfig } from '@/lib/clients/load';
import { createSession } from '@/lib/auth/session';
import { setSessionCookie } from '@/lib/auth/cookies';

// ============================================================================
// Login client: verifikasi accessKey DI SERVER (bukan lagi dibandingkan di
// browser) → set cookie sesi httpOnly ber-scope slug. Menutup lubang lama di
// KirimTool yang mengirim accessKey ke klien.
// ============================================================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Schema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  accessKey: z.string().min(1).max(200),
});

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

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
  const { slug, accessKey } = parsed.data;

  let cfg;
  try {
    cfg = loadClientConfig(slug);
  } catch {
    cfg = null;
  }
  if (!cfg) {
    return NextResponse.json({ ok: false, error: 'Undangan tidak ditemukan.' }, { status: 404 });
  }

  if (!safeEqual(accessKey, cfg.accessKey)) {
    return NextResponse.json({ ok: false, error: 'Kode akses salah.' }, { status: 401 });
  }

  const token = createSession('client', slug);
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, 'client', token);
  return res;
}
