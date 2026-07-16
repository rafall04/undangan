import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { configKlienSchema, type ConfigKlien } from './schema';
import type { DataUndangan } from '@/lib/invitation/types';
import { getTemaBySlug, type TemaResolved } from '@/lib/engine';

// ============================================================================
// FASE 4 — Loader klien (server-only; memakai fs). Membaca config.json,
// memvalidasi dengan zod, meresolve nama file foto → URL, dan memetakan ke
// DataUndangan. Foto yang tak ada otomatis dilewati (→ placeholder).
// ============================================================================

export const CLIENTS_DIR = join(process.cwd(), 'content', 'clients');

/** Daftar slug klien (folder yang punya config.json). */
export function listClientSlugs(): string[] {
  if (!existsSync(CLIENTS_DIR)) return [];
  return readdirSync(CLIENTS_DIR).filter((name) => {
    try {
      return (
        statSync(join(CLIENTS_DIR, name)).isDirectory() &&
        existsSync(join(CLIENTS_DIR, name, 'config.json'))
      );
    } catch {
      return false;
    }
  });
}

/** Path aman ke file foto (mencegah path traversal). null bila tidak valid/ada. */
export function safePhotoPath(slug: string, file: string): string | null {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  // Buang komponen path; hanya izinkan nama file polos.
  const base = normalize(file).replace(/^([.][.][/\\])+/g, '').replace(/[/\\]/g, '');
  if (!base || base.startsWith('.')) return null;
  const p = join(CLIENTS_DIR, slug, 'photos', base);
  return existsSync(p) ? p : null;
}

function photoExists(slug: string, file?: string): boolean {
  return Boolean(file && safePhotoPath(slug, file));
}

function photoUrl(slug: string, file: string): string {
  return `/u/${slug}/photos/${encodeURIComponent(file)}`;
}

/** Titik fokus (object-position) untuk sebuah nama file, dari config.fotoFokus. */
function fokusOf(cfg: ConfigKlien, file?: string): string | undefined {
  return file ? cfg.fotoFokus?.[file] : undefined;
}

/** Placeholder blur-up (data-URI) untuk sebuah nama file, dari config.fotoBlur. */
function blurOf(cfg: ConfigKlien, file?: string): string | undefined {
  return file ? cfg.fotoBlur?.[file] : undefined;
}

function resolveFoto(slug: string, file?: string): string | undefined {
  if (!file) return undefined;
  // Utamakan varian teroptimasi <base>.opt.webp (dari npm run optimize).
  const base = file.replace(/\.[^.]+$/, '');
  const optName = `${base}.opt.webp`;
  if (safePhotoPath(slug, optName)) return photoUrl(slug, optName);
  return photoExists(slug, file) ? photoUrl(slug, file) : undefined;
}

/** Baca + validasi config.json. Melempar bila tidak valid. */
export function loadClientConfig(slug: string): ConfigKlien | null {
  const file = join(CLIENTS_DIR, slug, 'config.json');
  if (!existsSync(file)) return null;
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  const parsed = configKlienSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `config.json klien "${slug}" tidak valid:\n` +
        parsed.error.issues.map((i) => `  • ${i.path.join('.')}: ${i.message}`).join('\n'),
    );
  }
  return parsed.data;
}

/** Ubah ConfigKlien → DataUndangan (foto diresolve ke URL). */
export function configToData(slug: string, cfg: ConfigKlien): DataUndangan {
  return {
    temaSlug: cfg.temaSlug,
    islami: cfg.islami,
    urutanNama: cfg.urutanNama,
    mempelai: {
      pria: { ...cfg.mempelai.pria, foto: resolveFoto(slug, cfg.mempelai.pria.foto), fotoFokus: fokusOf(cfg, cfg.mempelai.pria.foto), fotoBlur: blurOf(cfg, cfg.mempelai.pria.foto) },
      wanita: { ...cfg.mempelai.wanita, foto: resolveFoto(slug, cfg.mempelai.wanita.foto), fotoFokus: fokusOf(cfg, cfg.mempelai.wanita.foto), fotoBlur: blurOf(cfg, cfg.mempelai.wanita.foto) },
    },
    tanggalUtama: cfg.tanggalUtama,
    acara: cfg.acara,
    salamPembuka: cfg.salamPembuka,
    ayat: cfg.ayat,
    quote: cfg.quote,
    ceritaCinta: cfg.ceritaCinta?.map((m) => ({ ...m, foto: resolveFoto(slug, m.foto), fotoFokus: fokusOf(cfg, m.foto), fotoBlur: blurOf(cfg, m.foto) })),
    galeri: (cfg.galeri ?? []).map((f) => resolveFoto(slug, f) ?? '').filter((u) => u !== ''),
    fotoCover: resolveFoto(slug, cfg.fotoCover),
    fotoCoverFokus: fokusOf(cfg, cfg.fotoCover),
    fotoCoverBlur: blurOf(cfg, cfg.fotoCover),
    liveStreaming: cfg.liveStreaming,
    musik: cfg.musik
      ? { judul: cfg.musik.judul, src: cfg.musik.src ?? resolveFoto(slug, cfg.musik.file) ?? '' }
      : undefined,
    ucapanContoh: cfg.ucapanContoh,
    penutup: cfg.penutup,
    hashtag: cfg.hashtag,
    amplop: cfg.amplop,
    fontOverride: cfg.fontOverride,
    paletteOverride: cfg.paletteOverride,
    motifOverride: cfg.motifOverride,
    customFonts: cfg.customFonts?.map((f) => ({
      family: f.family,
      file: f.file,
      src: f.file ? resolveFoto(slug, f.file) : undefined,
    })),
  };
}

/** Baca guests.csv opsional (kolom: nama, telepon, grup). */
export function readGuestsCsv(slug: string): Array<{ nama: string; telepon?: string; grup?: string }> {
  const file = join(CLIENTS_DIR, slug, 'guests.csv');
  if (!existsSync(file)) return [];
  const text = readFileSync(file, 'utf8');
  const rows: Array<{ nama: string; telepon?: string; grup?: string }> = [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  for (let i = 0; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    // Lewati baris header.
    if (i === 0 && /nama/i.test(cols[0] ?? '')) continue;
    const nama = cols[0];
    if (!nama) continue;
    rows.push({ nama, telepon: cols[1] || undefined, grup: cols[2] || undefined });
  }
  return rows;
}

/** Gabungan daftar tamu dari config.tamu + guests.csv (dedup by nama). */
export function loadGuests(slug: string, cfg: ConfigKlien): Array<{ nama: string; telepon?: string; grup?: string }> {
  const merged = [...(cfg.tamu ?? []), ...readGuestsCsv(slug)];
  const seen = new Set<string>();
  return merged.filter((t) => {
    const k = t.nama.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export interface ClientBundle {
  cfg: ConfigKlien;
  data: DataUndangan;
  tema: TemaResolved;
}

/** Muat semua yang diperlukan untuk merender undangan klien. */
export function loadClient(slug: string): ClientBundle | null {
  const cfg = loadClientConfig(slug);
  if (!cfg) return null;
  const tema = getTemaBySlug(cfg.temaSlug);
  if (!tema) {
    throw new Error(`Klien "${slug}": temaSlug "${cfg.temaSlug}" tidak ada di registry.`);
  }
  const data = configToData(slug, cfg);
  // Bersihkan musik kosong.
  if (data.musik && !data.musik.src) data.musik = undefined;
  return { cfg, data, tema };
}
