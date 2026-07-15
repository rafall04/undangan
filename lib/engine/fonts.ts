import type { PasanganFont } from './types';

// ============================================================================
// FASE 1b — Pasangan font (8 pasangan, semua self-hosted via @fontsource)
// ----------------------------------------------------------------------------
// File ini hanya METADATA (nama family CSS). Impor CSS @fontsource yang
// sebenarnya ada di lib/engine/fonts-load.ts (dijalankan di root layout).
// Nama `heading/script/body` di bawah HARUS sama persis dengan family yang
// didaftarkan @fontsource.
// ============================================================================

export const FONT_PAIRS: PasanganFont[] = [
  {
    id: 'klasik-anggun',
    nama: 'Klasik Anggun',
    heading: '"Playfair Display"',
    script: '"Great Vibes"',
    body: '"Poppins"',
  },
  {
    id: 'romansa',
    nama: 'Romansa Lembut',
    heading: '"Cormorant Garamond"',
    script: '"Alex Brush"',
    body: '"Montserrat"',
  },
  {
    id: 'royal-cinzel',
    nama: 'Royal Cinzel',
    heading: '"Cinzel"',
    script: '"Pinyon Script"',
    body: '"Cardo"',
  },
  {
    id: 'modern-josefin',
    nama: 'Modern Bersih',
    heading: '"Josefin Sans"',
    script: '"Dancing Script"',
    body: '"Jost"',
  },
  {
    id: 'editorial-marcellus',
    nama: 'Editorial Marcellus',
    heading: '"Marcellus"',
    script: '"Parisienne"',
    body: '"Nunito"',
  },
  {
    id: 'sastra-lora',
    nama: 'Sastra Hangat',
    heading: '"Lora"',
    script: '"Sacramento"',
    body: '"Poppins"',
  },
  {
    id: 'serene-tenor',
    nama: 'Serene Tenor',
    heading: '"Tenor Sans"',
    script: '"Great Vibes"',
    body: '"Jost"',
  },
  {
    id: 'abadi-garamond',
    nama: 'Abadi Garamond',
    heading: '"EB Garamond"',
    script: '"Pinyon Script"',
    body: '"Montserrat"',
  },
];

export const FONT_BY_ID: Record<string, PasanganFont> = Object.fromEntries(
  FONT_PAIRS.map((f) => [f.id, f]),
);

export function getFont(id: string): PasanganFont {
  const f = FONT_BY_ID[id];
  if (!f) throw new Error(`Pasangan font tidak ditemukan: ${id}`);
  return f;
}

// ============================================================================
// Pustaka font INDIVIDUAL (untuk kustomisasi per-peran). Tiap family bisa
// dipakai untuk satu/lebih peran. `family` = nama CSS (sudah dimuat di
// fonts-load.ts). Dipakai override & picker Studio.
// ============================================================================
export type PeranFont = 'heading' | 'script' | 'body';

export interface FontFamily {
  id: string;
  nama: string;
  family: string; // nilai CSS (mis. '"Playfair Display"')
  peran: PeranFont[];
}

export const FONT_FAMILIES: FontFamily[] = [
  // Serif / display
  { id: 'playfair-display', nama: 'Playfair Display', family: '"Playfair Display"', peran: ['heading'] },
  { id: 'cormorant-garamond', nama: 'Cormorant Garamond', family: '"Cormorant Garamond"', peran: ['heading'] },
  { id: 'cinzel', nama: 'Cinzel', family: '"Cinzel"', peran: ['heading'] },
  { id: 'marcellus', nama: 'Marcellus', family: '"Marcellus"', peran: ['heading'] },
  { id: 'lora', nama: 'Lora', family: '"Lora"', peran: ['heading', 'body'] },
  { id: 'tenor-sans', nama: 'Tenor Sans', family: '"Tenor Sans"', peran: ['heading'] },
  { id: 'eb-garamond', nama: 'EB Garamond', family: '"EB Garamond"', peran: ['heading', 'body'] },
  { id: 'fraunces', nama: 'Fraunces', family: '"Fraunces"', peran: ['heading'] },
  { id: 'dm-serif', nama: 'DM Serif Display', family: '"DM Serif Display"', peran: ['heading'] },
  { id: 'bodoni-moda', nama: 'Bodoni Moda', family: '"Bodoni Moda"', peran: ['heading'] },
  { id: 'italiana', nama: 'Italiana', family: '"Italiana"', peran: ['heading'] },
  { id: 'cardo', nama: 'Cardo', family: '"Cardo"', peran: ['heading', 'body'] },
  // Sans
  { id: 'josefin-sans', nama: 'Josefin Sans', family: '"Josefin Sans"', peran: ['heading', 'body'] },
  { id: 'poppins', nama: 'Poppins', family: '"Poppins"', peran: ['body'] },
  { id: 'montserrat', nama: 'Montserrat', family: '"Montserrat"', peran: ['body', 'heading'] },
  { id: 'jost', nama: 'Jost', family: '"Jost"', peran: ['body', 'heading'] },
  { id: 'nunito', nama: 'Nunito', family: '"Nunito"', peran: ['body'] },
  { id: 'inter', nama: 'Inter', family: '"Inter"', peran: ['body'] },
  { id: 'raleway', nama: 'Raleway', family: '"Raleway"', peran: ['body', 'heading'] },
  { id: 'work-sans', nama: 'Work Sans', family: '"Work Sans"', peran: ['body', 'heading'] },
  // Script
  { id: 'great-vibes', nama: 'Great Vibes', family: '"Great Vibes"', peran: ['script'] },
  { id: 'alex-brush', nama: 'Alex Brush', family: '"Alex Brush"', peran: ['script'] },
  { id: 'pinyon-script', nama: 'Pinyon Script', family: '"Pinyon Script"', peran: ['script'] },
  { id: 'dancing-script', nama: 'Dancing Script', family: '"Dancing Script"', peran: ['script'] },
  { id: 'parisienne', nama: 'Parisienne', family: '"Parisienne"', peran: ['script'] },
  { id: 'sacramento', nama: 'Sacramento', family: '"Sacramento"', peran: ['script'] },
  { id: 'yellowtail', nama: 'Yellowtail', family: '"Yellowtail"', peran: ['script'] },
  { id: 'tangerine', nama: 'Tangerine', family: '"Tangerine"', peran: ['script'] },
  { id: 'petit-formal', nama: 'Petit Formal Script', family: '"Petit Formal Script"', peran: ['script'] },
];

export function fontsByRole(role: PeranFont): FontFamily[] {
  return FONT_FAMILIES.filter((f) => f.peran.includes(role));
}
