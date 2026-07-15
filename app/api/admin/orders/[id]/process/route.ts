import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { currentSession } from '@/lib/auth/cookies';
import { getDb } from '@/lib/db';
import { createClientFromConfig } from '@/lib/clients/write';
import { setStatus } from '@/lib/clients/meta';

// ============================================================================
// Proses order Studio → buat undangan dari config-nya, tandai order 'diproses'
// + tautkan slug. Admin lalu diarahkan ke editor.
// ============================================================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Schema = z.object({ slug: z.string().regex(/^[a-z0-9-]+$/) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!currentSession('admin')) {
    return NextResponse.json({ ok: false, error: 'Tidak diizinkan.' }, { status: 401 });
  }
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: 'id order tidak valid.' }, { status: 400 });
  }

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Slug hanya huruf kecil, angka, dan tanda hubung.' }, { status: 400 });
  }
  const { slug } = parsed.data;

  const db = getDb();
  const order = db.prepare('SELECT config_json FROM orders WHERE id = ?').get(id) as
    | { config_json: string | null }
    | undefined;
  if (!order) {
    return NextResponse.json({ ok: false, error: 'Order tidak ditemukan.' }, { status: 404 });
  }

  let cfg: unknown = null;
  try {
    cfg = order.config_json ? JSON.parse(order.config_json) : null;
  } catch {
    cfg = null;
  }

  const created = createClientFromConfig(slug, cfg);
  if (!created.ok) {
    return NextResponse.json({ ok: false, error: created.error }, { status: 400 });
  }

  setStatus(slug, 'draft'); // undangan baru mulai sebagai draft
  db.prepare('UPDATE orders SET slug = ?, status = ?, updated_at = ? WHERE id = ?').run(
    slug,
    'diproses',
    Date.now(),
    id,
  );

  return NextResponse.json({ ok: true, slug });
}
