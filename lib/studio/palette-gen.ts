import { contrastRatio, hexToRgb } from '@/lib/engine/contrast';
import type { PaletteOverride } from '@/lib/invitation/types';

// ============================================================================
// Generator palet otomatis: 1 warna seed → palet harmonis yang LOLOS WCAG AA.
// Bekerja di ruang HSL, lalu memaksa kontras dengan menyetel lightness.
// ============================================================================

interface HSL {
  h: number; // 0–360
  s: number; // 0–1
  l: number; // 0–1
}

function rgbToHsl(hex: string): HSL {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
        break;
      case gn:
        h = ((bn - rn) / d + 2) * 60;
        break;
      default:
        h = ((rn - gn) / d + 4) * 60;
    }
  }
  return { h, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.min(1, Math.max(0, s));
  l = Math.min(1, Math.max(0, l));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Setel lightness sampai kontras terhadap `bg` ≥ min (arah: gelapkan/terangkan). */
function forceContrast(h: number, s: number, startL: number, bg: string, min: number, dir: 'darker' | 'lighter'): string {
  let l = startL;
  for (let i = 0; i < 24; i++) {
    const hex = hslToHex(h, s, l);
    if (contrastRatio(hex, bg) >= min) return hex;
    l += dir === 'darker' ? -0.035 : 0.035;
    if (l <= 0.02 || l >= 0.98) break;
  }
  return hslToHex(h, s, Math.min(0.98, Math.max(0.02, l)));
}

/**
 * Hasilkan palet dari warna seed.
 * mode 'light' → latar terang/teks gelap; 'dark' → latar gelap/teks terang.
 */
export function generatePalette(seedHex: string, mode: 'light' | 'dark' = 'light'): PaletteOverride {
  let base: HSL;
  try {
    base = rgbToHsl(seedHex);
  } catch {
    base = { h: 30, s: 0.5, l: 0.4 };
  }
  const h = base.h;
  const s = Math.min(0.7, Math.max(0.25, base.s));
  const accentH = (h + 32) % 360;

  if (mode === 'dark') {
    const bg = hslToHex(h, Math.min(0.4, s), 0.1);
    const surface = hslToHex(h, Math.min(0.4, s), 0.16);
    const primary = hslToHex(h, Math.min(0.6, s + 0.1), 0.72); // terang agar tampil di latar gelap
    const accent = hslToHex(accentH, 0.55, 0.6);
    const ink = forceContrast(h, 0.18, 0.92, bg, 4.5, 'lighter');
    const muted = forceContrast(h, 0.15, 0.72, surface, 3.2, 'lighter');
    return { bg, surface, primary, accent, ink, muted };
  }

  const bg = hslToHex(h, 0.26, 0.94);
  const surface = hslToHex(h, 0.3, 0.975);
  const primary = forceContrast(h, s, Math.min(0.42, base.l), surface, 3.2, 'darker');
  const accent = hslToHex(accentH, 0.52, 0.44);
  const ink = forceContrast(h, 0.4, 0.18, bg, 4.5, 'darker');
  const muted = forceContrast(h, 0.24, 0.42, bg, 3.4, 'darker');
  return { bg, surface, primary, accent, ink, muted };
}
