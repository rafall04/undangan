import { existsSync, mkdirSync, readdirSync, writeFileSync, unlinkSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { clientDir } from './write';

// ============================================================================
// Kelola foto klien (server-only). Simpan ke content/clients/<slug>/photos/,
// buat varian .opt.webp (loader auto-pilih → ringan di HP). Butuh content rw.
// ============================================================================

const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg']);
const RASTER = new Set(['.jpg', '.jpeg', '.png']);
const MAX_SIDE = 1600;

export interface PhotoInfo {
  file: string;
  size: number;
  optimized: boolean;
  url: string;
}

function photosDir(slug: string): string {
  return join(clientDir(slug), 'photos');
}

/** Nama file aman (basename, karakter aman, ekstensi gambar). */
export function sanitizePhotoName(name: string): string | null {
  const b = basename(name).replace(/[^a-zA-Z0-9._-]/g, '-');
  if (!b || b.startsWith('.')) return null;
  if (!IMG_EXT.has(extname(b).toLowerCase())) return null;
  return b;
}

export function listPhotos(slug: string): PhotoInfo[] {
  const dir = photosDir(slug);
  if (!existsSync(dir)) return [];
  const all = readdirSync(dir);
  const opts = new Set(all.filter((f) => f.includes('.opt.webp')));
  return all
    .filter((f) => IMG_EXT.has(extname(f).toLowerCase()) && !f.includes('.opt.webp') && f !== 'README.txt')
    .map((f) => {
      const base = basename(f, extname(f));
      return {
        file: f,
        size: statSync(join(dir, f)).size,
        optimized: opts.has(`${base}.opt.webp`),
        url: `/u/${slug}/photos/${encodeURIComponent(f)}`,
      };
    })
    .sort((a, b) => a.file.localeCompare(b.file));
}

export interface SavePhotoResult {
  ok: boolean;
  file?: string;
  error?: string;
}

export async function savePhoto(slug: string, name: string, buf: Buffer): Promise<SavePhotoResult> {
  const safe = sanitizePhotoName(name);
  if (!safe) return { ok: false, error: 'Format tidak didukung (jpg/png/webp/svg).' };
  const dir = photosDir(slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, safe), buf);

  // Optimasi raster → <base>.opt.webp (best-effort; kalau gagal, pakai asli).
  const ext = extname(safe).toLowerCase();
  if (RASTER.has(ext)) {
    try {
      const sharp = (await import('sharp')).default;
      const outBase = basename(safe, ext);
      await sharp(buf)
        .rotate()
        .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(join(dir, `${outBase}.opt.webp`));
    } catch {
      /* biarkan pakai file asli */
    }
  }
  return { ok: true, file: safe };
}

export function deletePhoto(slug: string, name: string): boolean {
  const safe = sanitizePhotoName(name);
  if (!safe) return false;
  const dir = photosDir(slug);
  const p = join(dir, safe);
  if (existsSync(p)) unlinkSync(p);
  const ext = extname(safe).toLowerCase();
  if (RASTER.has(ext)) {
    const opt = join(dir, `${basename(safe, ext)}.opt.webp`);
    if (existsSync(opt)) unlinkSync(opt);
  }
  return true;
}
