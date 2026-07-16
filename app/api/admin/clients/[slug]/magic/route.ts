import { NextRequest, NextResponse } from 'next/server';
import { currentSession } from '@/lib/auth/cookies';
import { slugExists } from '@/lib/clients/write';
import { createMagicToken } from '@/lib/auth/magic';
import { publicBaseUrl } from '@/lib/url';

// Admin membuat magic-link login untuk client (dikirim via WA/email).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!currentSession('admin')) {
    return NextResponse.json({ ok: false, error: 'Tidak diizinkan.' }, { status: 401 });
  }
  if (!slugExists(params.slug)) {
    return NextResponse.json({ ok: false, error: 'Undangan tidak ditemukan.' }, { status: 404 });
  }
  const token = createMagicToken(params.slug);
  const url = `${publicBaseUrl(req)}/api/client/magic?token=${token}`;
  return NextResponse.json({ ok: true, url });
}
