import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { currentSession } from '@/lib/auth/cookies';
import { createClientScaffold } from '@/lib/clients/write';
import { setStatus } from '@/lib/clients/meta';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Schema = z.object({ slug: z.string().min(1).max(60) });

export async function POST(req: NextRequest) {
  if (!currentSession('admin')) {
    return NextResponse.json({ ok: false, error: 'Tidak diizinkan.' }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Body bukan JSON.' }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Slug wajib diisi.' }, { status: 400 });
  }

  const r = createClientScaffold(parsed.data.slug);
  if (!r.ok) {
    return NextResponse.json({ ok: false, error: r.error }, { status: 400 });
  }
  setStatus(r.slug!, 'draft'); // undangan baru mulai sebagai draft
  return NextResponse.json({ ok: true, slug: r.slug });
}
