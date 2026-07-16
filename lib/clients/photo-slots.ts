import { readFileSync } from 'node:fs';
import { loadClientConfig, safePhotoPath } from './load';
import { saveClientConfig } from './write';
import { makeLqip, type PhotoRole } from './photos';

// ============================================================================
// Sambungkan foto (yang disimpan per-peran) ke config.json secara OTOMATIS,
// plus kelola titik fokus (object-position). Sumber kebenaran tetap file config
// → dilewatkan saveClientConfig agar tervalidasi zod & konsisten dengan editor.
// ============================================================================

const smartFokus = (role: PhotoRole): string =>
  role === 'cover' || role === 'groom' || role === 'bride' ? '50% 30%' : '50% 50%';

/** Sambungkan file kanonik ke field config yang tepat + fokus awal + blur (LQIP). */
export function wirePhotoToConfig(slug: string, role: PhotoRole, file: string, lqip?: string): void {
  let cfg;
  try {
    cfg = loadClientConfig(slug);
  } catch {
    return; // config tak valid → lewati wiring (foto tetap tersimpan di folder)
  }
  if (!cfg) return;

  const next = structuredClone(cfg);
  next.fotoFokus = { ...(next.fotoFokus ?? {}) };
  if (next.fotoFokus[file] == null) next.fotoFokus[file] = smartFokus(role);
  if (lqip) next.fotoBlur = { ...(next.fotoBlur ?? {}), [file]: lqip };

  switch (role) {
    case 'cover':
      next.fotoCover = file;
      break;
    case 'groom':
      next.mempelai.pria.foto = file;
      break;
    case 'bride':
      next.mempelai.wanita.foto = file;
      break;
    case 'gallery':
      next.galeri = [...(next.galeri ?? [])];
      if (!next.galeri.includes(file)) next.galeri.push(file);
      break;
    case 'story': {
      const list = [...(next.ceritaCinta ?? [])];
      const emptyIdx = list.findIndex((m) => !m.foto);
      if (emptyIdx >= 0) list[emptyIdx] = { ...list[emptyIdx], foto: file };
      else list.push({ judul: 'Momen Kita', deskripsi: 'Cerita indah perjalanan kami.', foto: file });
      next.ceritaCinta = list;
      break;
    }
  }
  saveClientConfig(slug, next);
}

/** Set titik fokus (object-position "x% y%") untuk sebuah file. */
export function setPhotoFokus(slug: string, file: string, fokus: string): boolean {
  let cfg;
  try {
    cfg = loadClientConfig(slug);
  } catch {
    return false;
  }
  if (!cfg) return false;
  const next = structuredClone(cfg);
  next.fotoFokus = { ...(next.fotoFokus ?? {}), [file]: fokus };
  return saveClientConfig(slug, next).ok;
}

/** Set lagu client di config (src dikosongkan → loader resolve dari `file`). */
export function setClientMusicConfig(slug: string, file: string, judul: string): boolean {
  let cfg;
  try {
    cfg = loadClientConfig(slug);
  } catch {
    return false;
  }
  if (!cfg) return false;
  const next = structuredClone(cfg);
  next.musik = { judul, file };
  return saveClientConfig(slug, next).ok;
}

/** Hapus musik dari config client. */
export function clearClientMusicConfig(slug: string): boolean {
  let cfg;
  try {
    cfg = loadClientConfig(slug);
  } catch {
    return false;
  }
  if (!cfg) return false;
  const next = structuredClone(cfg);
  next.musik = undefined;
  return saveClientConfig(slug, next).ok;
}

export interface BackfillResult {
  ok: boolean;
  generated: number;
  skipped: number;
  error?: string;
}

/**
 * Buat placeholder blur (LQIP) untuk foto LAMA yang diunggah sebelum fitur ini
 * ada. Hanya foto yang benar-benar dirujuk config & filenya ada yang diproses;
 * yang sudah punya blur dilewati (idempoten — aman dijalankan berulang).
 */
export async function backfillBlur(slug: string): Promise<BackfillResult> {
  let cfg;
  try {
    cfg = loadClientConfig(slug);
  } catch {
    return { ok: false, generated: 0, skipped: 0, error: 'Config tidak valid — perbaiki dulu.' };
  }
  if (!cfg) return { ok: false, generated: 0, skipped: 0, error: 'Undangan tidak ditemukan.' };

  // Kumpulkan nama file yang dirujuk config (dedup tanpa Set → aman di semua target TS).
  const files: string[] = [];
  const add = (f?: string) => {
    if (f && !files.includes(f)) files.push(f);
  };
  add(cfg.fotoCover);
  add(cfg.mempelai.pria.foto);
  add(cfg.mempelai.wanita.foto);
  (cfg.ceritaCinta ?? []).forEach((m) => add(m.foto));
  (cfg.galeri ?? []).forEach(add);

  const blur: Record<string, string> = { ...(cfg.fotoBlur ?? {}) };
  let generated = 0;
  let skipped = 0;

  for (const f of files) {
    if (blur[f]) {
      skipped++; // sudah punya
      continue;
    }
    const p = safePhotoPath(slug, f);
    if (!p) {
      skipped++; // dirujuk config tapi filenya tak ada
      continue;
    }
    try {
      const b = await makeLqip(readFileSync(p));
      if (b) {
        blur[f] = b;
        generated++;
      } else skipped++;
    } catch {
      skipped++;
    }
  }

  if (generated > 0) {
    const next = structuredClone(cfg);
    next.fotoBlur = blur;
    const r = saveClientConfig(slug, next);
    if (!r.ok) return { ok: false, generated: 0, skipped, error: r.issues?.join(' · ') ?? 'Gagal menyimpan.' };
  }
  return { ok: true, generated, skipped };
}

/** Peta fokus per-file (untuk render marker di UI admin). */
export function getFokusMap(slug: string): Record<string, string> {
  try {
    return loadClientConfig(slug)?.fotoFokus ?? {};
  } catch {
    return {};
  }
}
