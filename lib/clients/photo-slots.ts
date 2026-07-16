import { loadClientConfig } from './load';
import { saveClientConfig } from './write';
import type { PhotoRole } from './photos';

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

/** Peta fokus per-file (untuk render marker di UI admin). */
export function getFokusMap(slug: string): Record<string, string> {
  try {
    return loadClientConfig(slug)?.fotoFokus ?? {};
  } catch {
    return {};
  }
}
