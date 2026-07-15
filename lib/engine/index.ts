import type { CSSProperties } from 'react';
import type { Tema, TemaResolved } from './types';
import { REGISTRY, REGISTRY_BY_SLUG } from './registry';
import { getPalet, PALETTES } from './palettes';
import { getFont, FONT_PAIRS } from './fonts';
import { getMotifMeta, MOTIFS_META } from './motifs-meta';
import { getLayoutMeta, LAYOUTS_META } from './layouts-meta';

export * from './types';
export { REGISTRY, REGISTRY_BY_SLUG } from './registry';
export { PALETTES, getPalet } from './palettes';
export { FONT_PAIRS, getFont, FONT_FAMILIES, fontsByRole } from './fonts';
export type { FontFamily, PeranFont } from './fonts';
export { MOTIFS_META, getMotifMeta } from './motifs-meta';
export { LAYOUTS_META, getLayoutMeta } from './layouts-meta';
export { SEMUA_KATEGORI } from './types';

/** Ubah entri registry menjadi tema lengkap (referensi id ditukar objek). */
export function resolveTema(entry: Tema): TemaResolved {
  return {
    ...entry,
    palet: getPalet(entry.paletId),
    font: getFont(entry.fontId),
    motif: getMotifMeta(entry.motifId),
    layout: getLayoutMeta(entry.layoutId),
  };
}

/** Ambil tema lengkap dari slug; null bila tidak ada. */
export function getTemaBySlug(slug: string): TemaResolved | null {
  const entry = REGISTRY_BY_SLUG[slug];
  return entry ? resolveTema(entry) : null;
}

export function getAllTema(): TemaResolved[] {
  return REGISTRY.map(resolveTema);
}

export function getTemaByKategori(kategori: string): TemaResolved[] {
  return REGISTRY.filter((t) => t.kategori === kategori).map(resolveTema);
}

/**
 * Variabel CSS untuk sebuah tema. Ditempel sebagai inline-style pada wrapper;
 * Tailwind memetakan `bg-bg`, `text-ink`, `font-heading`, dst. ke variabel ini.
 */
export function temaCssVars(t: TemaResolved): CSSProperties {
  return {
    '--bg': t.palet.bg,
    '--surface': t.palet.surface,
    '--primary': t.palet.primary,
    '--accent': t.palet.accent,
    '--ink': t.palet.ink,
    '--muted': t.palet.muted,
    '--cover-gradient': t.palet.coverGradient,
    '--font-heading': t.font.heading,
    '--font-script': t.font.script,
    '--font-body': t.font.body,
  } as CSSProperties;
}

/** Statistik ringkas untuk katalog & laporan. */
export function statistikRegistry() {
  return {
    totalTema: REGISTRY.length,
    totalPalet: PALETTES.length,
    totalFont: FONT_PAIRS.length,
    totalMotif: MOTIFS_META.length,
    totalLayout: LAYOUTS_META.length,
  };
}
