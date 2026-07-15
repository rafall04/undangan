import type { MotifMeta } from './types';

// ============================================================================
// FASE 1c — Metadata motif ornamen (10 motif).
// File pure-data agar bisa divalidasi node. Komponen SVG-nya di motifs.tsx.
// ============================================================================

export const MOTIFS_META: MotifMeta[] = [
  { id: 'batik-kawung', nama: 'Batik Kawung', nuansa: 'nusantara' },
  { id: 'batik-parang', nama: 'Batik Parang', nuansa: 'nusantara' },
  { id: 'mega-mendung', nama: 'Mega Mendung', nuansa: 'nusantara' },
  { id: 'wayang-gunungan', nama: 'Wayang Gunungan', nuansa: 'nusantara' },
  { id: 'floral-line', nama: 'Floral Line', nuansa: 'floral' },
  { id: 'tropical-leaves', nama: 'Tropical Leaves', nuansa: 'floral' },
  { id: 'art-deco', nama: 'Art Deco', nuansa: 'geometris' },
  { id: 'geometric-dots', nama: 'Geometric Dots', nuansa: 'geometris' },
  { id: 'moroccan-tile', nama: 'Moroccan Tile', nuansa: 'geometris' },
  { id: 'wave-line', nama: 'Wave Line', nuansa: 'netral' },
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
