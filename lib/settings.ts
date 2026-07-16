import { z } from 'zod';
import { getDb, nowMs } from '@/lib/db';

// ============================================================================
// Pengaturan aplikasi (server-only) — tersimpan di DB (tabel app_settings)
// sehingga ADMIN bisa mengubah nomor WA & paket/harga tanpa deploy ulang.
// Nilai di bawah hanya DEFAULT awal; begitu admin menyimpan, DB yang menang.
// ============================================================================

const paketSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'id: huruf kecil/angka/strip').max(40),
  nama: z.string().min(1, 'nama wajib').max(60),
  /** Harga dalam rupiah (angka murni). Tampilan diformat otomatis. */
  hargaAngka: z.number().int().min(0).max(1_000_000_000),
  /** Masa aktif undangan (bulan) — dipakai admin saat men-set masa berlaku. */
  durasiBulan: z.number().int().min(1).max(120),
  ringkas: z.string().max(200).default(''),
  populer: z.boolean().optional(),
  fitur: z.array(z.string().min(1).max(200)).max(30).default([]),
});

const settingsSchema = z.object({
  /** Nomor WA bisnis, format internasional tanpa "+" (mis. 6285233047094). */
  whatsapp: z.string().regex(/^\d{8,15}$/, 'Nomor WA: 8–15 digit, format 62xxx'),
  paket: z.array(paketSchema).min(1, 'minimal 1 paket').max(8),
});

export type PaketSetting = z.infer<typeof paketSchema>;
export type AppSettings = z.infer<typeof settingsSchema>;

const KEY = 'app';

export const DEFAULT_SETTINGS: AppSettings = {
  whatsapp: '6285233047094',
  paket: [
    {
      id: 'dasar',
      nama: 'Dasar',
      hargaAngka: 50000,
      durasiBulan: 10,
      ringkas: 'Undangan digital yang manis, lengkap informasinya.',
      fitur: [
        'Pilih dari 250+ tema',
        'Foto mempelai (pria & wanita)',
        'Data lengkap: mempelai, akad & resepsi',
        'Hitung mundur & Google Calendar',
        'RSVP & buku ucapan',
        'Tautan personal per tamu',
        'Aktif 10 bulan',
      ],
    },
    {
      id: 'premium',
      nama: 'Premium',
      hargaAngka: 70000,
      durasiBulan: 10,
      populer: true,
      ringkas: 'Semua fitur — galeri penuh, musik, live streaming.',
      fitur: [
        'Semua fitur paket Dasar',
        'Foto sampul + galeri foto lengkap',
        'Love story bergambar',
        'Musik latar & peta lokasi',
        'Live streaming (YouTube/IG/FB)',
        'Amplop digital (bank & e-wallet)',
        'Alat kirim massal + QR code',
        'Aktif 10 bulan',
      ],
    },
  ],
};

/** "Rp50.000" — deterministik (tanpa bergantung ICU/locale server). */
export function formatRupiah(n: number): string {
  return 'Rp' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Pengaturan efektif: DB bila ada & valid, selain itu DEFAULT. Tak pernah melempar. */
export function getSettings(): AppSettings {
  try {
    const row = getDb().prepare('SELECT value FROM app_settings WHERE key = ?').get(KEY) as
      | { value: string }
      | undefined;
    if (!row) return DEFAULT_SETTINGS;
    const parsed = settingsSchema.safeParse(JSON.parse(row.value));
    return parsed.success ? parsed.data : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export interface SaveSettingsResult {
  ok: boolean;
  issues?: string[];
  settings?: AppSettings;
}

/** Validasi + simpan. Mengembalikan issue yang ramah bila tidak valid. */
export function saveSettings(raw: unknown): SaveSettingsResult {
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, issues: parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`) };
  }
  getDb()
    .prepare(
      `INSERT INTO app_settings (key, value, updated_at) VALUES (?,?,?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .run(KEY, JSON.stringify(parsed.data), nowMs());
  return { ok: true, settings: parsed.data };
}
