import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { CONFIG } from '@/lib/config';

// ============================================================================
// SQLite (better-sqlite3) — data dinamis/relasional: RSVP, tamu, sesi, admin,
// order, meta publish. Config undangan TETAP di file (content/clients) —
// DB hanya untuk yang butuh persistensi lintas-device & query.
// Singleton via globalThis agar aman terhadap HMR & multiple import.
// ============================================================================

declare global {
  // eslint-disable-next-line no-var
  var __undanganDb: Database.Database | undefined;
}

function migrate(db: Database.Database): void {
  db.exec(`
    -- Meta per undangan (publish/expiry/paket). Config tetap di file.
    CREATE TABLE IF NOT EXISTS client_meta (
      slug         TEXT PRIMARY KEY,
      status       TEXT NOT NULL DEFAULT 'draft',   -- draft|published|disabled
      paket        TEXT,
      published_at INTEGER,
      expires_at   INTEGER,
      created_at   INTEGER NOT NULL,
      updated_at   INTEGER NOT NULL
    );

    -- RSVP + ucapan dari tamu (submission publik).
    CREATE TABLE IF NOT EXISTS rsvps (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      slug       TEXT NOT NULL,
      nama       TEXT NOT NULL,
      kehadiran  TEXT NOT NULL,                      -- hadir|tidak|ragu
      jumlah     INTEGER,
      pesan      TEXT,
      guest_to   TEXT,
      ip_hash    TEXT,
      hidden     INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rsvps_slug ON rsvps(slug, created_at DESC);

    -- Daftar tamu + pelacakan kirim (dikelola client) — ganti localStorage.
    CREATE TABLE IF NOT EXISTS guests (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      slug       TEXT NOT NULL,
      nama       TEXT NOT NULL,
      telepon    TEXT,
      grup       TEXT,
      sent       INTEGER NOT NULL DEFAULT 0,
      sent_at    INTEGER,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_guests_slug ON guests(slug);

    -- Sesi login (admin + client). Cookie menyimpan token mentah; DB simpan hash.
    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,                   -- sha256(token mentah)
      kind       TEXT NOT NULL,                      -- admin|client
      subject    TEXT NOT NULL,                      -- email admin / slug client
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_exp ON sessions(expires_at);

    -- Akun admin.
    CREATE TABLE IF NOT EXISTS admin_users (
      email      TEXT PRIMARY KEY,
      pass_hash  TEXT NOT NULL,                      -- scrypt: salt:hash
      created_at INTEGER NOT NULL
    );

    -- Order / lead dari Studio ("Ajukan").
    CREATE TABLE IF NOT EXISTS orders (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_pemesan TEXT,
      kontak       TEXT,
      paket        TEXT,
      slug         TEXT,
      config_json  TEXT,
      status       TEXT NOT NULL DEFAULT 'baru',     -- baru|diproses|selesai|batal
      created_at   INTEGER NOT NULL,
      updated_at   INTEGER NOT NULL
    );

    -- Pengaturan aplikasi (key → JSON). Dipakai agar admin bisa mengubah
    -- nomor WA, paket & harga, dsb TANPA deploy ulang.
    CREATE TABLE IF NOT EXISTS app_settings (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,                       -- JSON
      updated_at INTEGER NOT NULL
    );

    -- Magic-link login client (admin membuat → client 1 klik masuk).
    CREATE TABLE IF NOT EXISTS magic_links (
      token      TEXT PRIMARY KEY,                   -- sha256(token mentah)
      slug       TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      used_at    INTEGER
    );
  `);
}

function open(): Database.Database {
  mkdirSync(CONFIG.dataDir, { recursive: true });
  const db = new Database(join(CONFIG.dataDir, 'undangan.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  return db;
}

/** Handle SQLite (lazy singleton). Server-only. */
export function getDb(): Database.Database {
  if (!globalThis.__undanganDb) globalThis.__undanganDb = open();
  return globalThis.__undanganDb;
}

export const nowMs = (): number => Date.now();
