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

export type PhotoRole = 'cover' | 'groom' | 'bride' | 'gallery' | 'story';
export const PHOTO_ROLES: PhotoRole[] = ['cover', 'groom', 'bride', 'gallery', 'story'];
const SINGLE_BASE: Partial<Record<PhotoRole, string>> = { cover: 'cover', groom: 'groom', bride: 'bride' };

/** Peran (slot) sebuah nama file, ditebak dari basename → untuk badge di UI. */
export function roleOfFile(file: string): PhotoRole | 'lainnya' {
  const base = basename(file, extname(file)).toLowerCase();
  if (base === 'cover' || base === 'groom' || base === 'bride') return base as PhotoRole;
  if (/^gallery-\d+$/.test(base)) return 'gallery';
  if (/^story-\d+$/.test(base)) return 'story';
  return 'lainnya';
}

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

function pickExt(name: string): string {
  const e = extname(name).toLowerCase();
  return IMG_EXT.has(e) ? e : '.jpg';
}

/** Indeks bebas berikutnya untuk gallery-NN / story-NN. */
function nextIndexed(dir: string, prefix: 'gallery' | 'story'): number {
  let max = 0;
  if (existsSync(dir)) {
    for (const f of readdirSync(dir)) {
      if (f.includes('.opt.webp')) continue;
      const m = f.match(new RegExp(`^${prefix}-(\\d+)\\.`, 'i'));
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
  }
  return max + 1;
}

/** Hapus semua file (asli + .opt.webp) untuk sebuah base, mis. "cover". */
function removeByBase(dir: string, base: string): void {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) {
    const b = basename(f, extname(f));
    if (b === base || b === `${base}.opt`) {
      try {
        unlinkSync(join(dir, f));
      } catch {
        /* abaikan */
      }
    }
  }
}

/**
 * Placeholder "blur-up" (LQIP): versi mungil ter-blur sebagai data-URI base64
 * (~24px, biasanya <1 KB). Ditanam di config → tampil instan sebagai latar
 * sementara foto asli dimuat, lalu tertutup foto asli. Best-effort.
 */
async function makeLqip(buf: Buffer): Promise<string | undefined> {
  try {
    const sharp = (await import('sharp')).default;
    const tiny = await sharp(buf)
      .rotate()
      .resize(24, 24, { fit: 'inside' })
      .blur(1.2)
      .webp({ quality: 35 })
      .toBuffer();
    return `data:image/webp;base64,${tiny.toString('base64')}`;
  } catch {
    return undefined;
  }
}

/**
 * Simpan foto ke slot berdasar PERAN → nama kanonik (cover/groom/bride/
 * gallery-NN/story-NN) + varian .opt.webp + placeholder blur (LQIP).
 * Slot tunggal mengganti foto lama. Mengembalikan nama file kanonik + lqip.
 */
export async function savePhotoForRole(
  slug: string,
  role: PhotoRole,
  origName: string,
  buf: Buffer,
): Promise<{ ok: true; file: string; lqip?: string } | { ok: false; error: string }> {
  const ext = pickExt(origName);
  const dir = photosDir(slug);
  mkdirSync(dir, { recursive: true });

  let file: string;
  const singleBase = SINGLE_BASE[role];
  if (singleBase) {
    removeByBase(dir, singleBase); // ganti foto lama di slot ini
    file = `${singleBase}${ext}`;
  } else if (role === 'gallery' || role === 'story') {
    file = `${role}-${String(nextIndexed(dir, role)).padStart(2, '0')}${ext}`;
  } else {
    return { ok: false, error: 'Peran tidak dikenal.' };
  }

  writeFileSync(join(dir, file), buf);
  const base = basename(file, ext);
  let lqip: string | undefined;
  if (RASTER.has(ext)) {
    try {
      const sharp = (await import('sharp')).default;
      await sharp(buf)
        .rotate()
        .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(join(dir, `${base}.opt.webp`));
    } catch {
      /* biarkan pakai file asli */
    }
    lqip = await makeLqip(buf);
  }
  return { ok: true, file, lqip };
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
