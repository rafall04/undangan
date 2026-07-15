import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { currentSession } from '@/lib/auth/cookies';
import { getDb } from '@/lib/db';

// ============================================================================
// Daftar tamu + status kirim (server-side, lintas-device). Sesi CLIENT wajib;
// slug DIAMBIL DARI SESI (bukan input) → tak bisa akses tamu undangan lain.
// ============================================================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sessionSlug(): string | null {
  return currentSession('client')?.subject ?? null;
}
function unauthorized() {
  return NextResponse.json({ ok: false, error: 'Tidak diizinkan.' }, { status: 401 });
}
function listGuests(slug: string) {
  return getDb()
    .prepare('SELECT id, nama, telepon, grup, sent FROM guests WHERE slug = ? ORDER BY id')
    .all(slug)
    .map((r) => ({ ...(r as Record<string, unknown>), sent: Boolean((r as { sent: number }).sent) }));
}

export async function GET() {
  const slug = sessionSlug();
  if (!slug) return unauthorized();
  return NextResponse.json({ ok: true, guests: listGuests(slug) });
}

const AddSchema = z.object({
  guests: z
    .array(
      z.object({
        nama: z.string().trim().min(1).max(80),
        telepon: z.string().trim().max(30).optional(),
        grup: z.string().trim().max(40).optional(),
      }),
    )
    .min(1)
    .max(1000),
});

export async function POST(req: NextRequest) {
  const slug = sessionSlug();
  if (!slug) return unauthorized();
  const parsed = AddSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Data tidak valid.' }, { status: 400 });

  const db = getDb();
  const existing = new Set(
    (db.prepare('SELECT lower(nama) AS n FROM guests WHERE slug = ?').all(slug) as { n: string }[]).map((r) => r.n),
  );
  const ins = db.prepare('INSERT INTO guests (slug, nama, telepon, grup, sent, created_at) VALUES (?,?,?,?,0,?)');
  const now = Date.now();
  const tx = db.transaction((rows: z.infer<typeof AddSchema>['guests']) => {
    for (const g of rows) {
      if (existing.has(g.nama.toLowerCase())) continue;
      ins.run(slug, g.nama, g.telepon ?? null, g.grup ?? null, now);
      existing.add(g.nama.toLowerCase());
    }
  });
  tx(parsed.data.guests);
  return NextResponse.json({ ok: true, guests: listGuests(slug) });
}

const PatchSchema = z.object({ id: z.number().int(), sent: z.boolean() });

export async function PATCH(req: NextRequest) {
  const slug = sessionSlug();
  if (!slug) return unauthorized();
  const parsed = PatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Data tidak valid.' }, { status: 400 });
  getDb()
    .prepare('UPDATE guests SET sent = ?, sent_at = ? WHERE id = ? AND slug = ?')
    .run(parsed.data.sent ? 1 : 0, parsed.data.sent ? Date.now() : null, parsed.data.id, slug);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const slug = sessionSlug();
  if (!slug) return unauthorized();
  const id = Number(req.nextUrl.searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: 'id tidak valid.' }, { status: 400 });
  }
  getDb().prepare('DELETE FROM guests WHERE id = ? AND slug = ?').run(id, slug);
  return NextResponse.json({ ok: true });
}
