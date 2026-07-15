import { randomBytes, createHash } from 'node:crypto';
import { getDb } from '@/lib/db';

// ============================================================================
// Magic-link login client. Admin membuat token (kirim ke client via WA);
// sekali pakai, kedaluwarsa. Token mentah di URL; DB simpan sha256-nya.
// ============================================================================

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');
const TTL_MS = 7 * 86_400_000; // 7 hari

/** Buat token magic-link untuk slug, kembalikan token MENTAH (untuk URL). */
export function createMagicToken(slug: string): string {
  const token = randomBytes(24).toString('hex');
  const now = Date.now();
  getDb()
    .prepare('INSERT INTO magic_links (token, slug, created_at, expires_at) VALUES (?,?,?,?)')
    .run(sha(token), slug, now, now + TTL_MS);
  return token;
}

/** Tukar token → slug (sekali pakai). null bila tidak valid/kedaluwarsa/terpakai. */
export function consumeMagicToken(rawToken: string): string | null {
  const db = getDb();
  const h = sha(rawToken);
  const row = db
    .prepare('SELECT slug, expires_at, used_at FROM magic_links WHERE token = ?')
    .get(h) as { slug: string; expires_at: number; used_at: number | null } | undefined;
  if (!row || row.used_at || row.expires_at < Date.now()) return null;
  db.prepare('UPDATE magic_links SET used_at = ? WHERE token = ?').run(Date.now(), h);
  return row.slug;
}
