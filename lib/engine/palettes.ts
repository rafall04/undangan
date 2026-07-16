import type { Palet } from './types';

// ============================================================================
// FASE 1a — Palet warna (18 palet terkurasi)
// ----------------------------------------------------------------------------
// Setiap palet dirancang agar `ink` (teks utama) & `muted` (teks sekunder)
// memenuhi kontras WCAG AA terhadap `bg` dan `surface`. Divalidasi otomatis
// oleh scripts/sanity-check.ts.
// ============================================================================

export const PALETTES: Palet[] = [
  // --- Nusantara -----------------------------------------------------------
  {
    id: 'sogan-keraton',
    nama: 'Sogan Keraton',
    kategori: 'Nusantara',
    bg: '#f4ead6',
    surface: '#fbf5e8',
    primary: '#6b4423',
    accent: '#a9791d',
    ink: '#3a2614',
    muted: '#6a4a2b',
    coverGradient:
      'linear-gradient(to top, rgba(37,24,12,0.82) 0%, rgba(37,24,12,0.35) 45%, rgba(37,24,12,0.15) 100%)',
  },
  {
    id: 'parang-emas',
    nama: 'Parang Emas',
    kategori: 'Nusantara',
    bg: '#181410',
    surface: '#241d15',
    primary: '#d4af37',
    accent: '#f0d97d',
    ink: '#f6edd8',
    muted: '#c3ac81',
    gelap: true,
    coverGradient:
      'linear-gradient(to top, rgba(10,8,4,0.9) 0%, rgba(10,8,4,0.5) 50%, rgba(10,8,4,0.25) 100%)',
  },
  {
    id: 'mega-mendung',
    nama: 'Mega Mendung',
    kategori: 'Nusantara',
    bg: '#e7f0f5',
    surface: '#f4f9fc',
    primary: '#134b68',
    accent: '#c06a2e',
    ink: '#112c3b',
    muted: '#3f6072',
    coverGradient:
      'linear-gradient(to top, rgba(9,32,44,0.85) 0%, rgba(9,32,44,0.4) 50%, rgba(9,32,44,0.15) 100%)',
  },
  {
    id: 'lurik-lawas',
    nama: 'Lurik Lawas',
    kategori: 'Nusantara',
    bg: '#e9e5dd',
    surface: '#f3f0ea',
    primary: '#2c3757',
    accent: '#7d6b53',
    ink: '#24272d',
    muted: '#50545e',
    coverGradient:
      'linear-gradient(to top, rgba(20,22,30,0.85) 0%, rgba(20,22,30,0.4) 50%, rgba(20,22,30,0.15) 100%)',
  },
  {
    id: 'emerald-songket',
    nama: 'Emerald Songket',
    kategori: 'Nusantara',
    bg: '#e3ede7',
    surface: '#f0f6f1',
    primary: '#0f5136',
    accent: '#a9791d',
    ink: '#112c20',
    muted: '#3f6050',
    coverGradient:
      'linear-gradient(to top, rgba(8,32,22,0.85) 0%, rgba(8,32,22,0.4) 50%, rgba(8,32,22,0.15) 100%)',
  },
  {
    id: 'maroon-minang',
    nama: 'Maroon Minang',
    kategori: 'Nusantara',
    bg: '#f2e6e3',
    surface: '#faf1ef',
    primary: '#6e1423',
    accent: '#b18535',
    ink: '#361016',
    muted: '#65454a',
    coverGradient:
      'linear-gradient(to top, rgba(40,10,15,0.85) 0%, rgba(40,10,15,0.4) 50%, rgba(40,10,15,0.15) 100%)',
  },

  // --- Elegan --------------------------------------------------------------
  {
    id: 'navy-gold',
    nama: 'Navy & Gold',
    kategori: 'Elegan',
    bg: '#eaeef4',
    surface: '#f6f8fc',
    primary: '#1b2a4a',
    accent: '#a5883f',
    ink: '#141e33',
    muted: '#45516b',
    coverGradient:
      'linear-gradient(to top, rgba(10,16,30,0.85) 0%, rgba(10,16,30,0.4) 50%, rgba(10,16,30,0.15) 100%)',
  },
  {
    id: 'burgundy-wine',
    nama: 'Burgundy Wine',
    kategori: 'Elegan',
    bg: '#f1e6e4',
    surface: '#fbf3f1',
    primary: '#5c1a2b',
    accent: '#9c7a45',
    ink: '#301017',
    muted: '#5f4448',
    coverGradient:
      'linear-gradient(to top, rgba(36,10,16,0.85) 0%, rgba(36,10,16,0.4) 50%, rgba(36,10,16,0.15) 100%)',
  },
  {
    id: 'emerald-luxe',
    nama: 'Emerald Luxe',
    kategori: 'Elegan',
    bg: '#e4ede8',
    surface: '#f1f7f2',
    primary: '#10402c',
    accent: '#a98f4f',
    ink: '#0f261c',
    muted: '#3d5a4a',
    coverGradient:
      'linear-gradient(to top, rgba(7,26,18,0.85) 0%, rgba(7,26,18,0.4) 50%, rgba(7,26,18,0.15) 100%)',
  },
  {
    id: 'black-tie',
    nama: 'Black Tie',
    kategori: 'Elegan',
    bg: '#161616',
    surface: '#222222',
    primary: '#e6dabf',
    accent: '#c4b087',
    ink: '#f1ece2',
    muted: '#aaa294',
    gelap: true,
    coverGradient:
      'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.2) 100%)',
  },
  {
    id: 'royal-purple',
    nama: 'Royal Purple',
    kategori: 'Elegan',
    bg: '#ece6f0',
    surface: '#f7f3fa',
    primary: '#3d2159',
    accent: '#a5883f',
    ink: '#261437',
    muted: '#544364',
    coverGradient:
      'linear-gradient(to top, rgba(24,12,38,0.85) 0%, rgba(24,12,38,0.4) 50%, rgba(24,12,38,0.15) 100%)',
  },
  {
    id: 'champagne-blush',
    nama: 'Champagne Blush',
    kategori: 'Elegan',
    bg: '#f6ede6',
    surface: '#fdf6f1',
    primary: '#8a5344',
    accent: '#bd9a5f',
    ink: '#44291f',
    muted: '#755046',
    coverGradient:
      'linear-gradient(to top, rgba(50,28,20,0.82) 0%, rgba(50,28,20,0.38) 50%, rgba(50,28,20,0.14) 100%)',
  },

  // --- Soft / Kekinian -----------------------------------------------------
  {
    id: 'sage-garden',
    nama: 'Sage Garden',
    kategori: 'Soft',
    bg: '#e8eee3',
    surface: '#f3f6ee',
    primary: '#47603f',
    accent: '#94793f',
    ink: '#293523',
    muted: '#525f47',
    coverGradient:
      'linear-gradient(to top, rgba(20,28,16,0.82) 0%, rgba(20,28,16,0.38) 50%, rgba(20,28,16,0.14) 100%)',
  },
  {
    id: 'dusty-blue',
    nama: 'Dusty Blue',
    kategori: 'Soft',
    bg: '#e7edf1',
    surface: '#f3f7fa',
    primary: '#3f5c7c',
    accent: '#9c7f5f',
    ink: '#23313f',
    muted: '#4c5f73',
    coverGradient:
      'linear-gradient(to top, rgba(16,26,36,0.82) 0%, rgba(16,26,36,0.38) 50%, rgba(16,26,36,0.14) 100%)',
  },
  {
    id: 'terracotta-sunset',
    nama: 'Terracotta Sunset',
    kategori: 'Soft',
    bg: '#f6eae1',
    surface: '#fdf4ec',
    primary: '#b0512e',
    accent: '#c2823f',
    ink: '#48261a',
    muted: '#744a3a',
    coverGradient:
      'linear-gradient(to top, rgba(56,26,16,0.82) 0%, rgba(56,26,16,0.38) 50%, rgba(56,26,16,0.14) 100%)',
  },
  {
    id: 'mauve-taupe',
    nama: 'Mauve Taupe',
    kategori: 'Soft',
    bg: '#efe8ea',
    surface: '#f8f2f4',
    primary: '#75505d',
    accent: '#a2846f',
    ink: '#38292e',
    muted: '#65525a',
    coverGradient:
      'linear-gradient(to top, rgba(42,28,32,0.82) 0%, rgba(42,28,32,0.38) 50%, rgba(42,28,32,0.14) 100%)',
  },
  {
    id: 'ivory-minimal',
    nama: 'Ivory Minimal',
    kategori: 'Soft',
    bg: '#f4f1ea',
    surface: '#fcfaf5',
    primary: '#4a463f',
    accent: '#a89a7f',
    ink: '#2c2a25',
    muted: '#615d54',
    coverGradient:
      'linear-gradient(to top, rgba(24,22,18,0.8) 0%, rgba(24,22,18,0.36) 50%, rgba(24,22,18,0.12) 100%)',
  },
  {
    id: 'olive-rustic',
    nama: 'Olive Rustic',
    kategori: 'Soft',
    bg: '#ecece1',
    surface: '#f5f5ea',
    primary: '#59592e',
    accent: '#927741',
    ink: '#2c2c1a',
    muted: '#565742',
    coverGradient:
      'linear-gradient(to top, rgba(22,22,12,0.82) 0%, rgba(22,22,12,0.38) 50%, rgba(22,22,12,0.14) 100%)',
  },

  // --- Jepang ---------------------------------------------------------------
  {
    id: 'indigo-washi',
    nama: 'Indigo Washi',
    kategori: 'Elegan',
    bg: '#eceff2',
    surface: '#f6f8fa',
    primary: '#1f3a5f',
    accent: '#b23a48',
    ink: '#161f2a',
    muted: '#46536b',
    coverGradient:
      'linear-gradient(to top, rgba(12,20,32,0.85) 0%, rgba(12,20,32,0.4) 50%, rgba(12,20,32,0.15) 100%)',
  },
  {
    id: 'sakura-sumi',
    nama: 'Sakura Sumi',
    kategori: 'Soft',
    bg: '#f6eef0',
    surface: '#fcf7f8',
    primary: '#6f2f45',
    accent: '#c4788f',
    ink: '#291f24',
    muted: '#57454e',
    coverGradient:
      'linear-gradient(to top, rgba(30,18,24,0.82) 0%, rgba(30,18,24,0.38) 50%, rgba(30,18,24,0.14) 100%)',
  },

  // --- China ----------------------------------------------------------------
  {
    id: 'merah-kencana',
    nama: 'Merah Kencana',
    kategori: 'Elegan',
    bg: '#f7ece6',
    surface: '#fdf6f1',
    primary: '#9a1b1b',
    accent: '#b1832f',
    ink: '#2a1713',
    muted: '#63443c',
    coverGradient:
      'linear-gradient(to top, rgba(38,14,12,0.85) 0%, rgba(38,14,12,0.4) 50%, rgba(38,14,12,0.15) 100%)',
  },
  {
    id: 'giok-kencana',
    nama: 'Giok Kencana',
    kategori: 'Elegan',
    bg: '#e7efea',
    surface: '#f2f8f4',
    primary: '#1c5a49',
    accent: '#ab8a3d',
    ink: '#11211b',
    muted: '#3b574c',
    coverGradient:
      'linear-gradient(to top, rgba(10,28,22,0.85) 0%, rgba(10,28,22,0.4) 50%, rgba(10,28,22,0.15) 100%)',
  },
];

export const PALETTE_BY_ID: Record<string, Palet> = Object.fromEntries(
  PALETTES.map((p) => [p.id, p]),
);

export function getPalet(id: string): Palet {
  const p = PALETTE_BY_ID[id];
  if (!p) throw new Error(`Palet tidak ditemukan: ${id}`);
  return p;
}
