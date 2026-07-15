// ============================================================================
// Utilitas kontras WCAG — dipakai theme engine & sanity-check.
// ============================================================================

export interface RGB {
  r: number;
  g: number;
  b: number;
}

/** Ubah hex (#rgb / #rrggbb) menjadi objek RGB 0–255. */
export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '').trim();
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  if (full.length !== 6 || /[^0-9a-fA-F]/.test(full)) {
    throw new Error(`Hex tidak valid: "${hex}"`);
  }
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** Luminansi relatif sesuai definisi WCAG 2.1. */
export function relativeLuminance({ r, g, b }: RGB): number {
  const chan = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

/** Rasio kontras antara dua warna hex (1–21). */
export function contrastRatio(hexA: string, hexB: string): number {
  const la = relativeLuminance(hexToRgb(hexA));
  const lb = relativeLuminance(hexToRgb(hexB));
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

// Ambang WCAG AA.
export const AA_NORMAL = 4.5; // teks normal
export const AA_LARGE = 3.0; // teks besar (≥18.66px bold / ≥24px)

/** Bulatkan rasio ke 2 desimal untuk pelaporan. */
export function ratio2(n: number): number {
  return Math.round(n * 100) / 100;
}
