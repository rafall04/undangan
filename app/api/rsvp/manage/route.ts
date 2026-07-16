import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { currentSession } from '@/lib/auth/cookies';

// ============================================================================
// Moderasi RSVP/ucapan. Menyembunyikan (bukan menghapus) — reversible, jadi
// pemilik tak pernah kehilangan data. Undangan publik menyaring hidden = 0.
// Akses: admin, ATAU client yang memiliki slug tersebut (bukan slug lain).
// ============================================================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Schema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  id: z.number().int().positive(),
  hidden: z.boolean(),
});

/** Admin boleh semua; client hanya undangan miliknya sendiri. */
function canManage(slug: string): boolean {
  if (currentSession('admin')) return true;
  return currentSession('client')?.subject === slug;
}

export async function PATCH(req: NextRequest) {
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
  const { slug, id, hidden } = parsed.data;

  if (!canManage(slug)) {
    return NextResponse.json({ ok: false, error: 'Tidak diizinkan.' }, { status: 401 });
  }

  // `AND slug = ?` penting: mencegah client mengubah entri undangan lain.
  const info = getDb()
    .prepare('UPDATE rsvps SET hidden = ? WHERE id = ? AND slug = ?')
    .run(hidden ? 1 : 0, id, slug);

  if (info.changes === 0) {
    return NextResponse.json({ ok: false, error: 'Entri tidak ditemukan.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, id, hidden });
}
