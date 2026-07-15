import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// ============================================================================
// #2 — Kartu OG (preview WhatsApp/link) bertema. Dirender via next/og (satori).
// Font .woff dari @fontsource (satori tak dukung woff2). Gagal muat font →
// jatuh ke font default (tetap jalan).
// ============================================================================

export const OG_SIZE = { width: 1200, height: 630 };

function loadFont(pkg: string, file: string): Buffer | null {
  try {
    return readFileSync(join(process.cwd(), 'node_modules', '@fontsource', pkg, 'files', file));
  } catch {
    return null;
  }
}

const PLAYFAIR = loadFont('playfair-display', 'playfair-display-latin-400-normal.woff');
const GREATVIBES = loadFont('great-vibes', 'great-vibes-latin-400-normal.woff');

function fonts() {
  const list: { name: string; data: Buffer; weight: 400; style: 'normal' }[] = [];
  if (PLAYFAIR) list.push({ name: 'Playfair', data: PLAYFAIR, weight: 400, style: 'normal' });
  if (GREATVIBES) list.push({ name: 'GreatVibes', data: GREATVIBES, weight: 400, style: 'normal' });
  return list;
}

/** Gelapkan hex (faktor 0–1). */
function darken(hex: string, f = 0.55): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export interface OgOpts {
  a: string;
  b: string;
  dateStr: string;
  overline: string;
  monogram: string;
  deep: string; // warna gelap tema
  accent: string;
}

export function ogImage(opts: OgOpts): ImageResponse {
  const { a, b, dateStr, overline, monogram, deep, accent } = opts;
  const serif = PLAYFAIR ? 'Playfair' : 'serif';
  const script = GREATVIBES ? 'GreatVibes' : 'serif';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          backgroundColor: deep,
          backgroundImage: `linear-gradient(135deg, ${deep}, ${darken(deep, 0.5)})`,
          position: 'relative',
          fontFamily: serif,
        }}
      >
        {/* Bingkai */}
        <div style={{ position: 'absolute', top: 28, left: 28, right: 28, bottom: 28, border: `2px solid ${accent}`, opacity: 0.55, display: 'flex' }} />

        <div style={{ display: 'flex', width: 96, height: 96, borderRadius: 96, border: `2px solid ${accent}`, alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 18 }}>
          {monogram}
        </div>
        <div style={{ display: 'flex', fontSize: 26, letterSpacing: 10, textTransform: 'uppercase', opacity: 0.85, fontFamily: 'serif' }}>
          {overline}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 6, fontSize: 104, lineHeight: 1 }}>
          <span>{a}</span>
          <span style={{ fontFamily: script, color: accent, margin: '0 22px', fontSize: 88 }}>&amp;</span>
          <span>{b}</span>
        </div>
        <div style={{ display: 'flex', marginTop: 26, fontSize: 34, opacity: 0.92, fontFamily: 'serif' }}>{dateStr}</div>

        <div style={{ position: 'absolute', bottom: 44, display: 'flex', alignItems: 'center', fontSize: 22, letterSpacing: 4, opacity: 0.75, fontFamily: 'serif' }}>
          <span style={{ fontFamily: script, fontSize: 34, marginRight: 10 }}>Rafayana</span>
          <span style={{ textTransform: 'uppercase' }}>by RAF Undangan</span>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts() },
  );
}
