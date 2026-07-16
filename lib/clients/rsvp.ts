import { getDb } from '@/lib/db';
import type { StatusKehadiran } from '@/lib/invitation/types';

// ============================================================================
// Query RSVP untuk sisi pemilik (client/admin). Server-only.
// Angka dihitung via agregat DB (bukan memuat semua baris ke memori).
// ============================================================================

export interface RsvpEntry {
  id: number;
  nama: string;
  kehadiran: StatusKehadiran;
  jumlah: number | null;
  pesan: string | null;
  created_at: number;
  /** 1 = disembunyikan dari undangan publik (dimoderasi pemilik). */
  hidden: number;
}

export interface RsvpCounts {
  total: number;
  hadir: number;
  tidak: number;
  ragu: number;
}

export interface RsvpRecapData extends RsvpCounts {
  /** Perkiraan jumlah orang hadir (pakai kolom jumlah bila ada, else 1/RSVP hadir). */
  estimasiHadir: number;
  /** Jumlah entri yang disembunyikan (tidak ikut dihitung di counts). */
  tersembunyi: number;
  /** Berisi entri tersembunyi juga → pemilik bisa menampilkannya kembali. */
  entries: RsvpEntry[];
}

const EMPTY: RsvpCounts = { total: 0, hadir: 0, tidak: 0, ragu: 0 };

/** Hitung RSVP SEMUA slug dalam 1 query (untuk dashboard admin — hindari N+1). */
export function rsvpCountsAll(): Map<string, RsvpCounts> {
  const rows = getDb()
    .prepare('SELECT slug, kehadiran, COUNT(*) AS c FROM rsvps WHERE hidden = 0 GROUP BY slug, kehadiran')
    .all() as { slug: string; kehadiran: StatusKehadiran; c: number }[];
  const map = new Map<string, RsvpCounts>();
  for (const r of rows) {
    const cur = map.get(r.slug) ?? { ...EMPTY };
    cur.total += r.c;
    if (r.kehadiran === 'hadir') cur.hadir += r.c;
    else if (r.kehadiran === 'tidak') cur.tidak += r.c;
    else if (r.kehadiran === 'ragu') cur.ragu += r.c;
    map.set(r.slug, cur);
  }
  return map;
}

/** Recap 1 undangan: angka dari agregat (akurat), daftar entri dibatasi `limit`. */
export function getRsvpRecap(slug: string, limit = 300): RsvpRecapData {
  const db = getDb();
  const counts: RsvpCounts = { ...EMPTY };
  const cRows = db
    .prepare('SELECT kehadiran, COUNT(*) AS c FROM rsvps WHERE slug = ? AND hidden = 0 GROUP BY kehadiran')
    .all(slug) as { kehadiran: StatusKehadiran; c: number }[];
  for (const r of cRows) {
    counts.total += r.c;
    if (r.kehadiran === 'hadir') counts.hadir += r.c;
    else if (r.kehadiran === 'tidak') counts.tidak += r.c;
    else if (r.kehadiran === 'ragu') counts.ragu += r.c;
  }

  const est = db
    .prepare(
      "SELECT COALESCE(SUM(CASE WHEN jumlah IS NOT NULL AND jumlah > 0 THEN jumlah ELSE 1 END), 0) AS orang " +
        "FROM rsvps WHERE slug = ? AND hidden = 0 AND kehadiran = 'hadir'",
    )
    .get(slug) as { orang: number };

  // Entri SENGAJA memuat yang tersembunyi (beda dari counts) agar pemilik bisa
  // meninjau & menampilkannya kembali. Undangan publik tetap menyaring hidden=0.
  const entries = db
    .prepare(
      'SELECT id, nama, kehadiran, jumlah, pesan, created_at, hidden FROM rsvps WHERE slug = ? ORDER BY created_at DESC LIMIT ?',
    )
    .all(slug, limit) as RsvpEntry[];

  const h = db
    .prepare('SELECT COUNT(*) AS c FROM rsvps WHERE slug = ? AND hidden = 1')
    .get(slug) as { c: number };

  return { ...counts, estimasiHadir: est.orang, tersembunyi: h.c, entries };
}
