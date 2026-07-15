import { randomBytes, createHash } from 'node:crypto';
import { getDb } from '@/lib/db';
import { CONFIG } from '@/lib/config';
import { hashPassword, verifyPassword } from './password';

// ============================================================================
// Sesi login server-side (revocable). Token mentah 256-bit ada di cookie;
// DB hanya menyimpan sha256(token). Dipakai admin & client.
// ============================================================================

export type SessionKind = 'admin' | 'client';

export const COOKIE: Record<SessionKind, string> = {
  admin: 'adm_session',
  client: 'cli_session',
};

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');

export interface Session {
  subject: string;
  expiresAt: number;
}

/** Buat sesi, kembalikan token MENTAH untuk dikirim sebagai cookie. */
export function createSession(kind: SessionKind, subject: string): string {
  const token = randomBytes(32).toString('hex');
  const now = Date.now();
  const exp = now + CONFIG.sessionTtlDays * 86_400_000;
  getDb()
    .prepare('INSERT INTO sessions (token, kind, subject, created_at, expires_at) VALUES (?,?,?,?,?)')
    .run(sha(token), kind, subject, now, exp);
  return token;
}

/** Validasi token → sesi (atau null bila tidak ada/kedaluwarsa). */
export function readSession(kind: SessionKind, token: string | undefined | null): Session | null {
  if (!token) return null;
  const row = getDb()
    .prepare('SELECT subject, expires_at FROM sessions WHERE token = ? AND kind = ?')
    .get(sha(token), kind) as { subject: string; expires_at: number } | undefined;
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    destroySession(token);
    return null;
  }
  return { subject: row.subject, expiresAt: row.expires_at };
}

export function destroySession(token: string | undefined | null): void {
  if (!token) return;
  getDb().prepare('DELETE FROM sessions WHERE token = ?').run(sha(token));
}

/** Bersihkan sesi kedaluwarsa (best-effort, dipanggil sesekali). */
export function purgeExpiredSessions(): void {
  getDb().prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
}

export const sessionMaxAgeSec = (): number => CONFIG.sessionTtlDays * 86_400;

// --- Admin bootstrap ---------------------------------------------------------

/** Seed 1 admin dari env bila tabel admin masih kosong. */
export function ensureAdminSeed(): void {
  if (!CONFIG.adminEmail || !CONFIG.adminPassword) return;
  const db = getDb();
  const { c } = db.prepare('SELECT COUNT(*) AS c FROM admin_users').get() as { c: number };
  if (c > 0) return;
  db.prepare('INSERT INTO admin_users (email, pass_hash, created_at) VALUES (?,?,?)').run(
    CONFIG.adminEmail,
    hashPassword(CONFIG.adminPassword),
    Date.now(),
  );
}

/** Verifikasi kredensial admin → email (subject) atau null. */
export function verifyAdmin(email: string, password: string): string | null {
  ensureAdminSeed();
  const e = email.trim().toLowerCase();
  const row = getDb().prepare('SELECT pass_hash FROM admin_users WHERE email = ?').get(e) as
    | { pass_hash: string }
    | undefined;
  if (!row) return null;
  return verifyPassword(password, row.pass_hash) ? e : null;
}
