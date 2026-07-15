import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { CLIENTS_DIR } from '@/lib/clients/load';
import { configKlienSchema } from '@/lib/clients/schema';
import { getTemaBySlug } from '@/lib/engine';
import { DEFAULT_DRAFT, draftToConfigJson } from '@/lib/studio/draft';

// ============================================================================
// Tulis config klien ke file (server-only). Sumber kebenaran render TETAP file;
// admin/editor menulisnya lewat sini (divalidasi zod + cek tema ada).
// Butuh folder content/ writable (di prod: bind-mount rw).
// ============================================================================

const SLUG_RE = /^[a-z0-9-]+$/;

export function clientDir(slug: string): string {
  return join(CLIENTS_DIR, slug);
}

export function slugExists(slug: string): boolean {
  return existsSync(join(clientDir(slug), 'config.json'));
}

export interface SaveResult {
  ok: boolean;
  issues?: string[];
}

/** Validasi + tulis config.json. Tidak melempar untuk error validasi. */
export function saveClientConfig(slug: string, raw: unknown): SaveResult {
  if (!SLUG_RE.test(slug)) return { ok: false, issues: ['slug tidak valid'] };
  if (!slugExists(slug)) return { ok: false, issues: ['undangan tidak ditemukan'] };

  const parsed = configKlienSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, issues: parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`) };
  }
  if (!getTemaBySlug(parsed.data.temaSlug)) {
    return { ok: false, issues: [`temaSlug "${parsed.data.temaSlug}" tidak ada di registry`] };
  }

  writeFileSync(join(clientDir(slug), 'config.json'), JSON.stringify(parsed.data, null, 2) + '\n', 'utf8');
  return { ok: true };
}

export interface CreateResult {
  ok: boolean;
  slug?: string;
  error?: string;
}

/** Buat scaffold undangan baru (folder + config template + photos/). */
export function createClientScaffold(slug: string): CreateResult {
  const s = slug.trim().toLowerCase();
  if (!SLUG_RE.test(s)) return { ok: false, error: 'Slug hanya huruf kecil, angka, dan tanda hubung.' };
  if (existsSync(clientDir(s))) return { ok: false, error: 'Slug sudah dipakai.' };

  mkdirSync(join(clientDir(s), 'photos'), { recursive: true });
  const template = {
    ...DEFAULT_DRAFT,
    accessKey: `${s}-${randomBytes(3).toString('hex')}`,
  };
  writeFileSync(join(clientDir(s), 'config.json'), draftToConfigJson(template), 'utf8');
  return { ok: true, slug: s };
}

/**
 * Buat undangan dari config order Studio. Scaffold dulu (template) lalu terapkan
 * config order bila valid; kalau tidak valid, template tetap dipakai (admin
 * lengkapi via form). Selalu menghasilkan undangan yang bisa dibuka.
 */
export function createClientFromConfig(slug: string, rawConfig: unknown): CreateResult {
  const created = createClientScaffold(slug);
  if (!created.ok) return created;
  if (rawConfig && typeof rawConfig === 'object') {
    saveClientConfig(created.slug!, rawConfig); // kalau invalid, template tetap dipakai
  }
  return created;
}
