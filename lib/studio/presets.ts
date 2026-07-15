import type { FontOverride, PaletteOverride } from '@/lib/invitation/types';

// ============================================================================
// Preset gaya kustom — simpan/muat kombinasi font + warna + motif.
// Bawaan + buatan client (localStorage). Preset adalah "skin": diterapkan di
// atas tema/layout yang sedang dipilih (tidak mengubah layout).
// ============================================================================

export interface StylePreset {
  id: string;
  nama: string;
  fontOverride?: FontOverride;
  paletteOverride?: PaletteOverride;
  motifOverride?: string;
  builtin?: boolean;
}

export const PRESET_KEY = 'rafayana:studio:presets';

export const BUILTIN_PRESETS: StylePreset[] = [
  {
    id: 'emas-klasik',
    nama: 'Emas Klasik',
    builtin: true,
    fontOverride: { heading: '"Cinzel"', script: '"Pinyon Script"', body: '"Cardo"' },
    paletteOverride: { bg: '#f4ecd9', surface: '#fdf8ee', primary: '#6b4423', accent: '#a9791d', ink: '#3a2614', muted: '#6a4a2b' },
    motifOverride: 'art-deco',
  },
  {
    id: 'monokrom-modern',
    nama: 'Monokrom Modern',
    builtin: true,
    fontOverride: { heading: '"Josefin Sans"', script: '"Dancing Script"', body: '"Inter"' },
    paletteOverride: { bg: '#f4f4f2', surface: '#fcfcfb', primary: '#262626', accent: '#7a7a7a', ink: '#1b1b1b', muted: '#565656' },
    motifOverride: 'geometric-dots',
  },
  {
    id: 'botani-lembut',
    nama: 'Botani Lembut',
    builtin: true,
    fontOverride: { heading: '"Fraunces"', script: '"Tangerine"', body: '"Nunito"' },
    paletteOverride: { bg: '#e8eee3', surface: '#f3f6ee', primary: '#47603f', accent: '#94793f', ink: '#293523', muted: '#525f47' },
    motifOverride: 'floral-line',
  },
  {
    id: 'mawar-anggun',
    nama: 'Mawar Anggun',
    builtin: true,
    fontOverride: { heading: '"Cormorant Garamond"', script: '"Alex Brush"', body: '"Montserrat"' },
    paletteOverride: { bg: '#f7efe9', surface: '#fdf7f2', primary: '#8a5344', accent: '#bd9a5f', ink: '#44291f', muted: '#755046' },
    motifOverride: 'moroccan-tile',
  },
  {
    id: 'malam-mewah',
    nama: 'Malam Mewah',
    builtin: true,
    fontOverride: { heading: '"Bodoni Moda"', script: '"Yellowtail"', body: '"Raleway"' },
    paletteOverride: { bg: '#161616', surface: '#232323', primary: '#e6dabf', accent: '#c4b087', ink: '#f1ece2', muted: '#aaa294' },
    motifOverride: 'art-deco',
  },
];

function loadUserPresets(): StylePreset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PRESET_KEY);
    return raw ? (JSON.parse(raw) as StylePreset[]) : [];
  } catch {
    return [];
  }
}

export function loadPresets(): StylePreset[] {
  return [...BUILTIN_PRESETS, ...loadUserPresets()];
}

export function saveUserPreset(p: Omit<StylePreset, 'id' | 'builtin'>): StylePreset[] {
  const list = loadUserPresets();
  const id = `u-${p.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${list.length}`;
  const next = [...list, { ...p, id, builtin: false }];
  localStorage.setItem(PRESET_KEY, JSON.stringify(next));
  return [...BUILTIN_PRESETS, ...next];
}

export function deleteUserPreset(id: string): StylePreset[] {
  const next = loadUserPresets().filter((p) => p.id !== id);
  localStorage.setItem(PRESET_KEY, JSON.stringify(next));
  return [...BUILTIN_PRESETS, ...next];
}
