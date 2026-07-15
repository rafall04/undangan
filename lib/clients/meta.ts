import { getDb } from '@/lib/db';

// ============================================================================
// client_meta: status publish, paket, & masa berlaku per undangan.
// Config undangan tetap di file; ini hanya metadata operasional.
// ============================================================================

export type ClientStatus = 'draft' | 'published' | 'disabled';

export interface ClientMeta {
  slug: string;
  status: ClientStatus;
  paket: string | null;
  published_at: number | null;
  expires_at: number | null;
  created_at: number;
  updated_at: number;
}

export function getMeta(slug: string): ClientMeta | null {
  return (getDb().prepare('SELECT * FROM client_meta WHERE slug = ?').get(slug) as ClientMeta | undefined) ?? null;
}

/** Status efektif: default 'published' bila belum ada meta (undangan lama). */
export function effectiveStatus(slug: string): ClientStatus {
  const m = getMeta(slug);
  if (!m) return 'published';
  if (m.status === 'published' && m.expires_at && m.expires_at < Date.now()) return 'disabled';
  return m.status;
}

function ensureRow(slug: string): void {
  const now = Date.now();
  getDb()
    .prepare(
      `INSERT INTO client_meta (slug, status, created_at, updated_at)
       VALUES (?, 'published', ?, ?)
       ON CONFLICT(slug) DO NOTHING`,
    )
    .run(slug, now, now);
}

export function setStatus(slug: string, status: ClientStatus): void {
  ensureRow(slug);
  const now = Date.now();
  const publishedAt = status === 'published' ? now : null;
  getDb()
    .prepare('UPDATE client_meta SET status = ?, published_at = COALESCE(published_at, ?), updated_at = ? WHERE slug = ?')
    .run(status, publishedAt, now, slug);
}

export function setPaketExpiry(slug: string, paket: string | null, expiresAt: number | null): void {
  ensureRow(slug);
  getDb()
    .prepare('UPDATE client_meta SET paket = ?, expires_at = ?, updated_at = ? WHERE slug = ?')
    .run(paket, expiresAt, Date.now(), slug);
}
