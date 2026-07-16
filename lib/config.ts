import { join } from 'node:path';

// ============================================================================
// Konfigurasi server. Nilai sensitif via environment; ada default aman utk dev.
// JANGAN pakai default admin di produksi — set ADMIN_EMAIL & ADMIN_PASSWORD.
// ============================================================================

const isProd = process.env.NODE_ENV === 'production';

export const CONFIG = {
  isProd,
  /** Folder data (SQLite + upload). Prod: volume /opt/undangan/data. */
  dataDir: process.env.UNDANGAN_DATA_DIR || join(process.cwd(), 'data'),
  /** Akun admin bootstrap — di-seed bila tabel admin masih kosong. */
  adminEmail: (process.env.ADMIN_EMAIL || (isProd ? '' : 'admin@rafayana.local')).toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || (isProd ? '' : 'admin123'),
  /** Umur sesi login (hari). */
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS || 30),
  /** URL publik situs (untuk magic-link & redirect di balik proxy). Kosong → fallback origin/BRAND. */
  appUrl: process.env.APP_URL || '',
};
