import type { CSSProperties } from 'react';
import type { DataUndangan } from './types';

// ============================================================================
// Override kustom di atas tema (font per-peran, warna, motif).
// Diterapkan sebagai CSS variable pada wrapper undangan → menimpa nilai tema.
// Tema terkurasi tetap default bila override kosong.
// ============================================================================

export function overrideCssVars(data: DataUndangan): CSSProperties {
  const v: Record<string, string> = {};
  const f = data.fontOverride;
  if (f?.heading) v['--font-heading'] = f.heading;
  if (f?.script) v['--font-script'] = f.script;
  if (f?.body) v['--font-body'] = f.body;
  const p = data.paletteOverride;
  if (p?.bg) v['--bg'] = p.bg;
  if (p?.surface) v['--surface'] = p.surface;
  if (p?.primary) v['--primary'] = p.primary;
  if (p?.accent) v['--accent'] = p.accent;
  if (p?.ink) v['--ink'] = p.ink;
  if (p?.muted) v['--muted'] = p.muted;
  return v as CSSProperties;
}

/** Motif efektif: override bila ada, jika tidak pakai motif tema. */
export function effectiveMotif(data: DataUndangan, fallback: string): string {
  return data.motifOverride || fallback;
}

/** Aturan @font-face untuk font milik sendiri (self-hosted). */
export function customFontFaceCss(data: DataUndangan): string {
  const list = data.customFonts ?? [];
  return list
    .filter((f) => f.family && (f.src || f.dataUrl))
    .map(
      (f) =>
        `@font-face{font-family:"${f.family}";src:url(${JSON.stringify(f.dataUrl || f.src)});font-display:swap;}`,
    )
    .join('');
}
