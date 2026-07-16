import React from 'react';
import { MOTIFS_META } from './motifs-meta';

// ============================================================================
// FASE 1c — Komponen SVG motif ornamen.
// Semua inline-SVG / data-URI, TANPA file gambar eksternal.
// Tiap motif menyediakan: Pattern (latar berulang), Divider (pembatas), Corner
// (hiasan sudut cover). Pattern dipakai sebagai CSS background-image data-URI
// sehingga bebas dari tabrakan id SVG walau dirender ratusan kali (katalog).
// ============================================================================

// --- Helper: SVG string -> CSS url(data-uri) -------------------------------
function tileUri(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const NS = 'http://www.w3.org/2000/svg';

// ---------------------------------------------------------------------------
// TILE GENERATORS — masing-masing menghasilkan satu ubin SVG yang tiling mulus.
// ---------------------------------------------------------------------------
interface TileDef {
  size: number; // ukuran background-size (px, persegi)
  tile: (c: string) => string;
}

const TILES: Record<string, TileDef> = {
  'batik-kawung': {
    size: 46,
    tile: (c) =>
      `<svg xmlns='${NS}' width='46' height='46' viewBox='0 0 46 46'><g fill='none' stroke='${c}' stroke-width='1.1'><ellipse cx='23' cy='8' rx='7.5' ry='12'/><ellipse cx='23' cy='38' rx='7.5' ry='12'/><ellipse cx='8' cy='23' rx='12' ry='7.5'/><ellipse cx='38' cy='23' rx='12' ry='7.5'/></g><circle cx='23' cy='23' r='1.6' fill='${c}'/><circle cx='0' cy='0' r='1.2' fill='${c}'/><circle cx='46' cy='46' r='1.2' fill='${c}'/></svg>`,
  },
  'batik-parang': {
    size: 22,
    tile: (c) =>
      `<svg xmlns='${NS}' width='22' height='22' viewBox='0 0 22 22'><g fill='none' stroke='${c}' stroke-width='1.3' stroke-linecap='round'><path d='M0,22 L22,0'/><path d='M0,8 L8,0'/><path d='M8,22 L22,8'/></g><path d='M11,7.5 L14.5,11 L11,14.5 L7.5,11 Z' fill='${c}'/></svg>`,
  },
  'mega-mendung': {
    size: 48,
    tile: (c) =>
      `<svg xmlns='${NS}' width='48' height='48' viewBox='0 0 48 48'><g fill='none' stroke='${c}' stroke-width='1.1' stroke-linecap='round'><path d='M0,22 a12,10 0 0 1 24,0'/><path d='M6,22 a6,5 0 0 1 12,0'/><path d='M24,22 a12,10 0 0 1 24,0'/><path d='M30,22 a6,5 0 0 1 12,0'/><path d='M0,46 a12,10 0 0 1 24,0'/><path d='M6,46 a6,5 0 0 1 12,0'/><path d='M24,46 a12,10 0 0 1 24,0'/><path d='M30,46 a6,5 0 0 1 12,0'/></g></svg>`,
  },
  'wayang-gunungan': {
    size: 50,
    tile: (c) =>
      `<svg xmlns='${NS}' width='50' height='50' viewBox='0 0 50 50'><g fill='none' stroke='${c}' stroke-width='1.1'><path d='M25,5 C35,15 34,32 25,45 C16,32 15,15 25,5 Z'/><path d='M25,16 L25,40'/><circle cx='25' cy='24' r='2'/></g></svg>`,
  },
  'floral-line': {
    size: 50,
    tile: (c) =>
      `<svg xmlns='${NS}' width='50' height='50' viewBox='0 0 50 50'><g fill='none' stroke='${c}' stroke-width='1.05' stroke-linecap='round'><path d='M25,46 C25,34 25,24 25,16'/><ellipse cx='25' cy='7' rx='2.2' ry='4'/><ellipse cx='19' cy='12' rx='4' ry='2.2'/><ellipse cx='31' cy='12' rx='4' ry='2.2'/><circle cx='25' cy='12' r='1.8'/><path d='M25,30 C19,28 16,24 15,19'/><path d='M25,36 C31,34 34,30 35,25'/></g></svg>`,
  },
  'tropical-leaves': {
    size: 56,
    tile: (c) =>
      `<svg xmlns='${NS}' width='56' height='56' viewBox='0 0 56 56'><g fill='none' stroke='${c}' stroke-width='1.05' stroke-linecap='round'><path d='M28,6 C40,16 40,40 28,50 C16,40 16,16 28,6 Z'/><path d='M28,11 L28,47'/><path d='M28,20 L20,15 M28,20 L36,15 M28,30 L18,26 M28,30 L38,26 M28,40 L21,37 M28,40 L35,37'/></g></svg>`,
  },
  'art-deco': {
    size: 40,
    tile: (c) =>
      `<svg xmlns='${NS}' width='40' height='40' viewBox='0 0 40 40'><g fill='none' stroke='${c}' stroke-width='1' stroke-linecap='round'><path d='M4,40 A16,16 0 0 1 36,40'/><path d='M9,40 A11,11 0 0 1 31,40'/><path d='M14,40 A6,6 0 0 1 26,40'/><line x1='20' y1='40' x2='20' y2='16'/><line x1='20' y1='40' x2='5' y2='25'/><line x1='20' y1='40' x2='35' y2='25'/><path d='M4,0 A16,16 0 0 1 36,0'/></g></svg>`,
  },
  'geometric-dots': {
    size: 22,
    tile: (c) =>
      `<svg xmlns='${NS}' width='22' height='22' viewBox='0 0 22 22'><g fill='${c}'><circle cx='5.5' cy='5.5' r='1.5'/><circle cx='16.5' cy='16.5' r='1.5'/></g></svg>`,
  },
  'moroccan-tile': {
    size: 40,
    tile: (c) =>
      `<svg xmlns='${NS}' width='40' height='40' viewBox='0 0 40 40'><g fill='none' stroke='${c}' stroke-width='1.05'><circle cx='20' cy='20' r='10'/><circle cx='0' cy='0' r='10'/><circle cx='40' cy='0' r='10'/><circle cx='0' cy='40' r='10'/><circle cx='40' cy='40' r='10'/><circle cx='20' cy='0' r='10'/><circle cx='0' cy='20' r='10'/><circle cx='40' cy='20' r='10'/><circle cx='20' cy='40' r='10'/></g></svg>`,
  },
  'wave-line': {
    size: 40,
    tile: (c) =>
      `<svg xmlns='${NS}' width='40' height='40' viewBox='0 0 40 40'><g fill='none' stroke='${c}' stroke-width='1.2' stroke-linecap='round'><path d='M0,10 q10,-8 20,0 t20,0'/><path d='M0,30 q10,-8 20,0 t20,0'/></g></svg>`,
  },

  // --- JEPANG -------------------------------------------------------------
  // Seigaiha: barisan gelombang setengah lingkaran bertingkat, tiap baris
  // digeser setengah langkah (0/10) sehingga tiling mulus di kedua sumbu.
  'seigaiha': {
    size: 40,
    tile: (c) => {
      const arc = (cx: number, cy: number) =>
        [9, 6, 3].map((r) => `<path d='M${cx - r},${cy} a${r},${r} 0 0 1 ${r * 2},0'/>`).join('');
      const row = (cy: number, off: number) =>
        [-10, 10, 30, 50].map((x) => arc(x + off, cy)).join('');
      return `<svg xmlns='${NS}' width='40' height='40' viewBox='0 0 40 40'><g fill='none' stroke='${c}' stroke-width='0.85'>${row(10, 10)}${row(20, 0)}${row(30, 10)}${row(40, 0)}</g></svg>`;
    },
  },
  // Asanoha: kisi bintang (daun rami) — garis lurus, tiling mulus di tepi.
  'asanoha': {
    size: 36,
    tile: (c) =>
      `<svg xmlns='${NS}' width='36' height='36' viewBox='0 0 36 36'><g fill='none' stroke='${c}' stroke-width='0.8'><path d='M18,0 L36,18 L18,36 L0,18 Z'/><path d='M0,0 L36,36 M36,0 L0,36'/><path d='M18,0 L18,36 M0,18 L36,18'/></g></svg>`,
  },
  // Sakura: bunga 5 kelopak — pusat + sudut (tiling: sudut saling melengkapi).
  'sakura': {
    size: 48,
    tile: (c) => {
      const bloom = (s: number) =>
        [0, 72, 144, 216, 288]
          .map((a) => `<ellipse cx='0' cy='${-6.5 * s}' rx='${3 * s}' ry='${5.5 * s}' transform='rotate(${a})'/>`)
          .join('') + `<circle r='${1.3 * s}' fill='${c}'/>`;
      return `<svg xmlns='${NS}' width='48' height='48' viewBox='0 0 48 48'><g fill='none' stroke='${c}' stroke-width='0.85'><g transform='translate(24,24)'>${bloom(1)}</g><g transform='translate(0,0)'>${bloom(0.6)}</g><g transform='translate(48,0)'>${bloom(0.6)}</g><g transform='translate(0,48)'>${bloom(0.6)}</g><g transform='translate(48,48)'>${bloom(0.6)}</g></g></svg>`;
    },
  },
  // Kumiko: kisi kayu — persegi + belah ketupat + diagonal.
  'kumiko': {
    size: 32,
    tile: (c) =>
      `<svg xmlns='${NS}' width='32' height='32' viewBox='0 0 32 32'><g fill='none' stroke='${c}' stroke-width='0.85'><rect x='0' y='0' width='32' height='32'/><path d='M16,0 L32,16 L16,32 L0,16 Z'/><path d='M0,0 L32,32 M32,0 L0,32'/></g></svg>`,
  },

  // --- CHINA --------------------------------------------------------------
  // Awan Ruyi: gulungan awan berkepala lobus — motif tersebar (bukan garis
  // sambung), dipakai tipis sebagai latar.
  'awan-ruyi': {
    size: 48,
    tile: (c) => {
      const cloud = `<path d='M2,13 a3.6,3.6 0 1 1 5.5,-2.8 a5,5 0 0 1 9,0.9 a3.6,3.6 0 1 1 5.5,2.8'/><path d='M7,13 q4.5,3.6 9,0'/>`;
      return `<svg xmlns='${NS}' width='48' height='48' viewBox='0 0 48 48'><g fill='none' stroke='${c}' stroke-width='0.9' stroke-linecap='round'><g transform='translate(1,3)'>${cloud}</g><g transform='translate(25,27)'>${cloud}</g></g></svg>`;
    },
  },
  // Kisi Jendela: kisi jendela klasik — persegi bersarang + siku sudut.
  'kisi-jendela': {
    size: 36,
    tile: (c) =>
      `<svg xmlns='${NS}' width='36' height='36' viewBox='0 0 36 36'><g fill='none' stroke='${c}' stroke-width='0.85'><rect x='0' y='0' width='36' height='36'/><rect x='9' y='9' width='18' height='18'/><path d='M0,0 L9,9 M36,0 L27,9 M0,36 L9,27 M36,36 L27,27'/><path d='M18,0 L18,9 M18,27 L18,36 M0,18 L9,18 M27,18 L36,18'/></g></svg>`,
  },
  // Peoni: bunga berlapis — dua lingkar kelopak + inti.
  'peoni': {
    size: 52,
    tile: (c) => {
      const ring = (n: number, cy: number, rx: number, ry: number) =>
        Array.from({ length: n }, (_, i) => i * (360 / n))
          .map((a) => `<ellipse cx='0' cy='${cy}' rx='${rx}' ry='${ry}' transform='rotate(${a})'/>`)
          .join('');
      return `<svg xmlns='${NS}' width='52' height='52' viewBox='0 0 52 52'><g fill='none' stroke='${c}' stroke-width='0.85'><g transform='translate(26,26)'>${ring(8, -11, 3.6, 4.8)}${ring(6, -6, 3.2, 4.2)}<circle r='2.2'/></g></g></svg>`;
    },
  },
};

// ---------------------------------------------------------------------------
// GLYPH — lambang kecil tiap motif, dipakai ulang di Divider & Corner.
// Digambar berpusat di (0,0), kira-kira dalam radius 12.
// ---------------------------------------------------------------------------
type Glyph = (c: string) => React.ReactNode;

const GLYPHS: Record<string, Glyph> = {
  'batik-kawung': (c) => (
    <g fill="none" stroke={c} strokeWidth={1.2}>
      <ellipse cx="0" cy="-6" rx="3" ry="5.5" />
      <ellipse cx="0" cy="6" rx="3" ry="5.5" />
      <ellipse cx="-6" cy="0" rx="5.5" ry="3" />
      <ellipse cx="6" cy="0" rx="5.5" ry="3" />
      <circle cx="0" cy="0" r="1" fill={c} />
    </g>
  ),
  'batik-parang': (c) => (
    <g fill="none" stroke={c} strokeWidth={1.2} strokeLinecap="round">
      <path d="M-9,9 L9,-9" />
      <path d="M-9,3 L-3,-9" />
      <path d="M3,9 L9,3" />
      <path d="M0,-4 L4,0 L0,4 L-4,0 Z" fill={c} stroke="none" />
    </g>
  ),
  'mega-mendung': (c) => (
    <g fill="none" stroke={c} strokeWidth={1.2} strokeLinecap="round">
      <path d="M-11,4 a5.5,5 0 0 1 11,0 a5.5,5 0 0 1 11,0" />
      <path d="M-6,4 a3,3 0 0 1 6,0" />
    </g>
  ),
  'wayang-gunungan': (c) => (
    <g fill="none" stroke={c} strokeWidth={1.2}>
      <path d="M0,-12 C7,-4 7,8 0,13 C-7,8 -7,-4 0,-12 Z" />
      <path d="M0,-5 L0,9" />
    </g>
  ),
  'floral-line': (c) => (
    <g fill="none" stroke={c} strokeWidth={1.15} strokeLinecap="round">
      <ellipse cx="0" cy="-6" rx="2.4" ry="4.2" />
      <ellipse cx="0" cy="6" rx="2.4" ry="4.2" />
      <ellipse cx="-6" cy="0" rx="4.2" ry="2.4" />
      <ellipse cx="6" cy="0" rx="4.2" ry="2.4" />
      <circle cx="0" cy="0" r="1.6" fill={c} />
    </g>
  ),
  'tropical-leaves': (c) => (
    <g fill="none" stroke={c} strokeWidth={1.15} strokeLinecap="round">
      <path d="M0,-11 C7,-4 7,8 0,12 C-7,8 -7,-4 0,-11 Z" />
      <path d="M0,-7 L0,9" />
      <path d="M0,-2 L-5,-4 M0,-2 L5,-4 M0,4 L-4,2 M0,4 L4,2" />
    </g>
  ),
  'art-deco': (c) => (
    <g fill="none" stroke={c} strokeWidth={1.15} strokeLinecap="round">
      <path d="M0,-11 L8,0 L0,11 L-8,0 Z" />
      <path d="M0,-6 L0,6" />
      <circle cx="0" cy="0" r="1.4" fill={c} />
    </g>
  ),
  'geometric-dots': (c) => (
    <g fill={c}>
      <circle cx="0" cy="-9" r="1.6" />
      <circle cx="0" cy="9" r="1.6" />
      <circle cx="-9" cy="0" r="1.6" />
      <circle cx="9" cy="0" r="1.6" />
      <circle cx="0" cy="0" r="2" />
    </g>
  ),
  'moroccan-tile': (c) => (
    <g fill="none" stroke={c} strokeWidth={1.15}>
      <circle cx="0" cy="-5" r="5" />
      <circle cx="0" cy="5" r="5" />
      <circle cx="-5" cy="0" r="5" />
      <circle cx="5" cy="0" r="5" />
    </g>
  ),
  'wave-line': (c) => (
    <g fill="none" stroke={c} strokeWidth={1.3} strokeLinecap="round">
      <path d="M-12,0 q6,-6 12,0 t12,0" />
    </g>
  ),

  // --- JEPANG ---
  seigaiha: (c) => (
    <g fill="none" stroke={c} strokeWidth={1.1}>
      <path d="M-10,6 a10,10 0 0 1 20,0" />
      <path d="M-6.5,6 a6.5,6.5 0 0 1 13,0" />
      <path d="M-3,6 a3,3 0 0 1 6,0" />
    </g>
  ),
  asanoha: (c) => (
    <g fill="none" stroke={c} strokeWidth={1.05}>
      <path d="M0,-11 L9.5,-5.5 L9.5,5.5 L0,11 L-9.5,5.5 L-9.5,-5.5 Z" />
      <path d="M0,-11 L0,11 M-9.5,-5.5 L9.5,5.5 M9.5,-5.5 L-9.5,5.5" />
    </g>
  ),
  sakura: (c) => (
    <g fill="none" stroke={c} strokeWidth={1.05}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={0} cy={-6.5} rx={3} ry={5.5} transform={`rotate(${a})`} />
      ))}
      <circle cx={0} cy={0} r={1.3} fill={c} />
    </g>
  ),
  kumiko: (c) => (
    <g fill="none" stroke={c} strokeWidth={1.05}>
      <rect x={-10} y={-10} width={20} height={20} />
      <path d="M0,-10 L10,0 L0,10 L-10,0 Z" />
      <path d="M-10,-10 L10,10 M10,-10 L-10,10" />
    </g>
  ),

  // --- CHINA ---
  'awan-ruyi': (c) => (
    <g fill="none" stroke={c} strokeWidth={1.05} strokeLinecap="round">
      <path d="M-11,3 a3.6,3.6 0 1 1 5.5,-2.8 a5,5 0 0 1 9,0.9 a3.6,3.6 0 1 1 5.5,2.8" />
      <path d="M-6,3 q4.5,3.6 9,0" />
    </g>
  ),
  'kisi-jendela': (c) => (
    <g fill="none" stroke={c} strokeWidth={1.05}>
      <rect x={-10} y={-10} width={20} height={20} />
      <rect x={-4.5} y={-4.5} width={9} height={9} />
      <path d="M-10,-10 L-4.5,-4.5 M10,-10 L4.5,-4.5 M-10,10 L-4.5,4.5 M10,10 L4.5,4.5" />
    </g>
  ),
  peoni: (c) => (
    <g fill="none" stroke={c} strokeWidth={1} >
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx={0} cy={-7} rx={3.2} ry={4.2} transform={`rotate(${a})`} />
      ))}
      <circle cx={0} cy={0} r={2} />
    </g>
  ),
};

// ---------------------------------------------------------------------------
// KOMPONEN PUBLIK
// ---------------------------------------------------------------------------

export interface MotifVisualProps {
  motifId: string;
  color?: string;
  className?: string;
}

/** Latar berulang, full-bleed. `opacity` kecil agar tak menyaingi konten. */
export function MotifPattern({
  motifId,
  color = '#000000',
  opacity = 0.06,
  scale = 1,
  className,
}: MotifVisualProps & { opacity?: number; scale?: number }) {
  const def = TILES[motifId] ?? TILES['geometric-dots'];
  const size = def.size * scale;
  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity,
        backgroundImage: tileUri(def.tile(color)),
        backgroundRepeat: 'repeat',
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

/** Pembatas antar-bagian: dua garis + lambang motif di tengah. */
export function MotifDivider({
  motifId,
  color = 'currentColor',
  className,
  width = 260,
}: MotifVisualProps & { width?: number }) {
  const glyph = GLYPHS[motifId] ?? GLYPHS['geometric-dots'];
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 260 30"
      width={width}
      style={{ maxWidth: '80%', height: 'auto', display: 'block' }}
      role="presentation"
    >
      <g stroke={color} strokeWidth={1} strokeLinecap="round">
        <line x1="14" y1="15" x2="104" y2="15" />
        <line x1="156" y1="15" x2="246" y2="15" />
        <circle cx="10" cy="15" r="1.6" fill={color} stroke="none" />
        <circle cx="250" cy="15" r="1.6" fill={color} stroke="none" />
      </g>
      <g transform="translate(130,15)">{glyph(color)}</g>
    </svg>
  );
}

/**
 * Lambang motif tunggal, tanpa garis pendamping. Untuk dipakai di dalam SVG
 * lain (mis. stempel) — karena itu ia mengembalikan <g>, bukan <svg>.
 * Glyph digambar berpusat di (0,0) dengan radius ±12.
 */
export function MotifGlyph({
  motifId,
  color = 'currentColor',
  size = 24,
}: MotifVisualProps & { size?: number }) {
  const glyph = GLYPHS[motifId] ?? GLYPHS['geometric-dots'];
  return <g transform={`scale(${size / 24})`}>{glyph(color)}</g>;
}

/** Hiasan sudut untuk cover. Default orientasi kiri-atas; putar via CSS. */
export function MotifCorner({
  motifId,
  color = 'currentColor',
  className,
  size = 96,
}: MotifVisualProps & { size?: number }) {
  const glyph = GLYPHS[motifId] ?? GLYPHS['geometric-dots'];
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 96 96"
      width={size}
      height={size}
      role="presentation"
    >
      <g fill="none" stroke={color} strokeLinecap="round">
        <path d="M14,50 L14,20 Q14,14 20,14 L50,14" strokeWidth={1.4} />
        <path d="M22,58 L22,24 Q22,22 24,22 L58,22" strokeWidth={0.8} opacity={0.55} />
      </g>
      <g transform="translate(34,34)">{glyph(color)}</g>
    </svg>
  );
}

// Ekspor daftar id untuk keperluan lain.
export const MOTIF_RENDER_IDS = MOTIFS_META.map((m) => m.id);
