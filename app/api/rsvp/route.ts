import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { listClientSlugs } from '@/lib/clients/load';
import type { Ucapan, StatusKehadiran } from '@/lib/invitation/types';

// ============================================================================
// API RSVP + ucapan tamu. POST = kirim (validasi + rate-limit + simpan),
// GET = daftar ucapan publik per undangan. Persisten di SQLite → balasan tamu
// benar-benar sampai ke pasangan (beda dari in-memory lama).
// ============================================================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SubmitSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  nama: z.string().trim().min(1).max(60),
  kehadiran: z.enum(['hadir', 'tidak', 'ragu']),
  pesan: z.string().trim().min(1).max(400),
  jumlah: z.number().int().min(1).max(20).optional(),
  to: z.string().trim().max(80).optional(),
});

// Rate-limit sederhana per-proses (IP+slug). Cukup untuk redam spam kasar.
const rl = new Map<string, number[]>();
function rateLimited(key: string, limit = 6, windowMs = 60_000): boolean {
  const now = Date.now();
  const arr = (rl.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  rl.set(key, arr);
  return arr.length > limit;
}

function ipHash(req: NextRequest): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'local';
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

function waktuRelatif(ms: number): string {
  const diff = Math.max(0, Date.now() - ms);
  const menit = Math.floor(diff / 60_000);
  if (menit < 1) return 'Baru saja';
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 30) return `${hari} hari lalu`;
  return new Date(ms).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function publicWishes(slug: string): Ucapan[] {
  const rows = getDb()
    .prepare(
      'SELECT nama, kehadiran, pesan, created_at FROM rsvps WHERE slug = ? AND hidden = 0 ORDER BY created_at DESC LIMIT 100',
    )
    .all(slug) as { nama: string; kehadiran: string; pesan: string; created_at: number }[];
  return rows.map((r) => ({
    nama: r.nama,
    pesan: r.pesan,
    kehadiran: r.kehadiran as StatusKehadiran,
    waktu: waktuRelatif(r.created_at),
  }));
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') ?? '';
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ ok: false, error: 'slug tidak valid' }, { status: 400 });
  }
  return NextResponse.json({ ok: true, wishes: publicWishes(slug) });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Body bukan JSON.' }, { status: 400 });
  }

  const parsed = SubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Data tidak valid.' }, { status: 400 });
  }
  const { slug, nama, kehadiran, pesan, jumlah, to } = parsed.data;

  if (!listClientSlugs().includes(slug)) {
    return NextResponse.json({ ok: false, error: 'Undangan tidak ditemukan.' }, { status: 404 });
  }

  const ip = ipHash(req);
  if (rateLimited(`${ip}:${slug}`)) {
    return NextResponse.json(
      { ok: false, error: 'Terlalu banyak kiriman. Coba lagi sebentar.' },
      { status: 429 },
    );
  }

  const db = getDb();
  // Cegah kiriman ganda (nama+pesan identik dalam 30 detik).
  const dup = db
    .prepare('SELECT 1 FROM rsvps WHERE slug = ? AND nama = ? AND pesan = ? AND created_at > ? LIMIT 1')
    .get(slug, nama, pesan, Date.now() - 30_000);
  if (!dup) {
    db.prepare(
      'INSERT INTO rsvps (slug, nama, kehadiran, jumlah, pesan, guest_to, ip_hash, created_at) VALUES (?,?,?,?,?,?,?,?)',
    ).run(slug, nama, kehadiran, jumlah ?? null, pesan, to ?? null, ip, Date.now());
  }

  return NextResponse.json({ ok: true, wishes: publicWishes(slug) });
}
