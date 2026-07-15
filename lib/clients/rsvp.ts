import { getDb } from '@/lib/db';
import type { StatusKehadiran } from '@/lib/invitation/types';

// ============================================================================
// Query RSVP untuk sisi pemilik (client/admin). Server-only.
// ============================================================================

export interface RsvpEntry {
  id: number;
  nama: string;
  kehadiran: StatusKehadiran;
  jumlah: number | null;
  pesan: string | null;
  created_at: number;
}

export interface RsvpRecapData {
  total: number;
  hadir: number;
  tidak: number;
  ragu: number;
  /** Perkiraan jumlah orang hadir (pakai kolom jumlah bila ada, else 1/RSVP hadir). */
  estimasiHadir: number;
  entries: RsvpEntry[];
}

export function getRsvpRecap(slug: string): RsvpRecapData {
  const entries = getDb()
    .prepare(
      'SELECT id, nama, kehadiran, jumlah, pesan, created_at FROM rsvps WHERE slug = ? AND hidden = 0 ORDER BY created_at DESC',
    )
    .all(slug) as RsvpEntry[];

  const count = (k: StatusKehadiran) => entries.filter((e) => e.kehadiran === k).length;
  const estimasiHadir = entries
    .filter((e) => e.kehadiran === 'hadir')
    .reduce((sum, e) => sum + (e.jumlah && e.jumlah > 0 ? e.jumlah : 1), 0);

  return {
    total: entries.length,
    hadir: count('hadir'),
    tidak: count('tidak'),
    ragu: count('ragu'),
    estimasiHadir,
    entries,
  };
}
