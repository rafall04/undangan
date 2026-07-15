import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { getDb } from '@/lib/db';

// ============================================================================
// Order / lead dari Studio ("Ajukan ke Admin"). Publik (rate-limited).
// Menyimpan draft config + kontak pemesan → muncul di dashboard admin.
// ============================================================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Schema = z.object({
  nama: z.string().trim().min(1).max(80),
  kontak: z.string().trim().min(3).max(120),
  paket: z.string().trim().max(40).optional(),
  config: z.unknown().optional(),
});

const rl = new Map<string, number[]>();
function rateLimited(key: string, limit = 4, windowMs = 60_000): boolean {
  const now = Date.now();
  const arr = (rl.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  rl.set(key, arr);
  return arr.length > limit;
}

function ipHash(req: NextRequest): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'local';
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
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
    return NextResponse.json({ ok: false, error: 'Nama & kontak wajib diisi.' }, { status: 400 });
  }
  if (rateLimited(ipHash(req))) {
    return NextResponse.json({ ok: false, error: 'Terlalu banyak pengajuan. Coba lagi nanti.' }, { status: 429 });
  }

  const { nama, kontak, paket, config } = parsed.data;
  let configJson: string | null = null;
  try {
    if (config !== undefined) configJson = JSON.stringify(config).slice(0, 200_000);
  } catch {
    configJson = null;
  }

  const now = Date.now();
  const info = getDb()
    .prepare(
      'INSERT INTO orders (nama_pemesan, kontak, paket, config_json, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?)',
    )
    .run(nama, kontak, paket ?? null, configJson, 'baru', now, now);

  return NextResponse.json({ ok: true, id: info.lastInsertRowid });
}
