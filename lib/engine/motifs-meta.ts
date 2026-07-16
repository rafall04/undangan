import type { MotifMeta } from './types';

// ============================================================================
// FASE 1c — Metadata motif ornamen.
// File pure-data agar bisa divalidasi node. Komponen SVG-nya di motifs.tsx.
//
// `budaya` = sumber kebenaran asal-usul motif. Tema mewarisi budaya dari
// motifnya (lihat gen-registry), sehingga label budaya selalu jujur.
//
// Semua pola digambar sendiri dari primitif geometris, dan sengaja memakai
// pola DEKORATIF yang lazim (tekstil/kriya) — bukan lambang sakral/ritual.
// ============================================================================

export const MOTIFS_META: MotifMeta[] = [
  // --- Jawa ---
  { id: 'batik-kawung', nama: 'Batik Kawung', nuansa: 'nusantara', budaya: 'jawa' },
  { id: 'batik-parang', nama: 'Batik Parang', nuansa: 'nusantara', budaya: 'jawa' },
  { id: 'mega-mendung', nama: 'Mega Mendung', nuansa: 'nusantara', budaya: 'jawa' },
  { id: 'wayang-gunungan', nama: 'Wayang Gunungan', nuansa: 'nusantara', budaya: 'jawa' },
  // --- Nusantara (di luar Jawa) ---
  { id: 'tropical-leaves', nama: 'Tropical Leaves', nuansa: 'floral', budaya: 'nusantara' },
  // --- Jepang ---
  { id: 'seigaiha', nama: 'Seigaiha (Gelombang)', nuansa: 'geometris', budaya: 'jepang' },
  { id: 'asanoha', nama: 'Asanoha (Daun Rami)', nuansa: 'geometris', budaya: 'jepang' },
  { id: 'sakura', nama: 'Sakura', nuansa: 'floral', budaya: 'jepang' },
  { id: 'kumiko', nama: 'Kumiko (Kisi Kayu)', nuansa: 'geometris', budaya: 'jepang' },
  // --- China ---
  { id: 'awan-ruyi', nama: 'Awan Ruyi', nuansa: 'geometris', budaya: 'china' },
  { id: 'kisi-jendela', nama: 'Kisi Jendela', nuansa: 'geometris', budaya: 'china' },
  { id: 'peoni', nama: 'Peoni', nuansa: 'floral', budaya: 'china' },
  // --- Barat ---
  { id: 'art-deco', nama: 'Art Deco', nuansa: 'geometris', budaya: 'barat' },
  // --- Universal (pola dekoratif tanpa klaim budaya) ---
  { id: 'floral-line', nama: 'Floral Line', nuansa: 'floral', budaya: 'universal' },
  { id: 'geometric-dots', nama: 'Geometric Dots', nuansa: 'geometris', budaya: 'universal' },
  { id: 'moroccan-tile', nama: 'Moroccan Tile', nuansa: 'geometris', budaya: 'universal' },
  { id: 'wave-line', nama: 'Wave Line', nuansa: 'netral', budaya: 'universal' },
];

export const MOTIF_META_BY_ID: Record<string, MotifMeta> = Object.fromEntries(
  MOTIFS_META.map((m) => [m.id, m]),
);

export function getMotifMeta(id: string): MotifMeta {
  const m = MOTIF_META_BY_ID[id];
  if (!m) throw new Error(`Motif tidak ditemukan: ${id}`);
  return m;
}

export const MOTIF_IDS = MOTIFS_META.map((m) => m.id);
