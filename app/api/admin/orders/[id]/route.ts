import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { currentSession } from '@/lib/auth/cookies';
import { getDb } from '@/lib/db';

// Ubah status order (tandai selesai/batal/diproses).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Schema = z.object({ status: z.enum(['baru', 'diproses', 'selesai', 'batal']) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!currentSession('admin')) {
    return NextResponse.json({ ok: false, error: 'Tidak diizinkan.' }, { status: 401 });
  }
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: 'id order tidak valid.' }, { status: 400 });
  }
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Status tidak valid.' }, { status: 400 });
  }
  const info = getDb()
    .prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?')
    .run(parsed.data.status, Date.now(), id);
  if (info.changes === 0) {
    return NextResponse.json({ ok: false, error: 'Order tidak ditemukan.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
