import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { currentSession } from '@/lib/auth/cookies';
import { saveClientConfig, deleteClient, slugExists } from '@/lib/clients/write';
import { setStatus, setPaketExpiry } from '@/lib/clients/meta';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ ok: false, error: 'Tidak diizinkan.' }, { status: 401 });
}

// Simpan config.json (validasi zod di saveClientConfig).
export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!currentSession('admin')) return unauthorized();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Body bukan JSON.' }, { status: 400 });
  }
  const r = saveClientConfig(params.slug, body);
  if (!r.ok) {
    return NextResponse.json({ ok: false, issues: r.issues }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

// Ubah meta operasional: status publish, paket, masa berlaku.
const MetaSchema = z.object({
  status: z.enum(['draft', 'published', 'disabled']).optional(),
  paket: z.string().max(40).nullable().optional(),
  expiresAt: z.number().int().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!currentSession('admin')) return unauthorized();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Body bukan JSON.' }, { status: 400 });
  }
  const parsed = MetaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Data tidak valid.' }, { status: 400 });
  }
  const { status, paket, expiresAt } = parsed.data;
  if (status) setStatus(params.slug, status);
  if (paket !== undefined || expiresAt !== undefined) {
    setPaketExpiry(params.slug, paket ?? null, expiresAt ?? null);
  }
  return NextResponse.json({ ok: true });
}

// Hapus undangan (file + data DB terkait). Destruktif.
export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  if (!currentSession('admin')) return unauthorized();
  if (!slugExists(params.slug)) {
    return NextResponse.json({ ok: false, error: 'Undangan tidak ditemukan.' }, { status: 404 });
  }
  deleteClient(params.slug);
  return NextResponse.json({ ok: true });
}
