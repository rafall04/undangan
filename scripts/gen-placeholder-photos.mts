/* eslint-disable no-console */
// ============================================================================
// Membuat foto placeholder (SVG/gradien) untuk klien contoh budi-sari.
// TIDAK mengunduh apa pun dari internet. Jalankan:
//   npx tsx scripts/gen-placeholder-photos.mts
// ============================================================================
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'content', 'clients', 'budi-sari', 'photos');
mkdirSync(DIR, { recursive: true });

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function grad(id: string, c1: string, c2: string) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
}

function bust() {
  // Siluet bust sederhana (kepala + bahu) translusen.
  return `<g fill="rgba(255,255,255,0.30)"><circle cx="400" cy="430" r="120"/><path d="M210,760 C210,610 320,560 400,560 C480,560 590,610 590,760 Z"/></g>`;
}

function deco(seed: number) {
  const shapes: string[] = [];
  for (let i = 0; i < 5; i++) {
    const x = ((seed * 97 + i * 137) % 760) + 20;
    const y = ((seed * 53 + i * 211) % 900) + 40;
    const r = 18 + ((seed + i) % 4) * 10;
    shapes.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(255,255,255,0.08)"/>`);
  }
  return shapes.join('');
}

function svgPhoto(opts: {
  w: number;
  h: number;
  c1: string;
  c2: string;
  label: string;
  sub?: string;
  seed: number;
  silhouette?: boolean;
}) {
  const { w, h, c1, c2, label, sub, seed, silhouette } = opts;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice">
<defs>${grad('g', c1, c2)}<radialGradient id="v" cx="0.5" cy="0.4" r="0.8"><stop offset="0.6" stop-color="rgba(0,0,0,0)"/><stop offset="1" stop-color="rgba(0,0,0,0.28)"/></radialGradient></defs>
<rect width="800" height="1000" fill="url(#g)"/>
${deco(seed)}
${silhouette ? bust() : ''}
<rect width="800" height="1000" fill="url(#v)"/>
<text x="400" y="${silhouette ? 900 : 500}" text-anchor="middle" font-family="Georgia, serif" font-size="46" fill="rgba(255,255,255,0.92)">${esc(label)}</text>
${sub ? `<text x="400" y="${silhouette ? 950 : 552}" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="rgba(255,255,255,0.7)">${esc(sub)}</text>` : ''}
</svg>`;
}

const PALETTES: [string, string][] = [
  ['#6b4423', '#a9791d'],
  ['#1b2a4a', '#4a6685'],
  ['#5c1a2b', '#b08d57'],
  ['#10402c', '#a98f4f'],
  ['#47603f', '#94793f'],
  ['#7a5a66', '#a98d7a'],
  ['#b0512e', '#c2823f'],
  ['#3d2159', '#a5883f'],
];

const files: Array<{ name: string; svg: string }> = [];

// Cover (romantis, lanskap-ish tapi tetap 4:5-ish via slice)
files.push({ name: 'cover.svg', svg: svgPhoto({ w: 1200, h: 1500, c1: '#5a3620', c2: '#a9791d', label: 'Foto Sampul', sub: 'Budi & Sari', seed: 3 }) });
// Mempelai
files.push({ name: 'groom.svg', svg: svgPhoto({ w: 800, h: 1000, c1: '#2b3d5c', c2: '#6b4423', label: 'Mempelai Pria', seed: 7, silhouette: true }) });
files.push({ name: 'bride.svg', svg: svgPhoto({ w: 800, h: 1000, c1: '#7a4a3a', c2: '#a9791d', label: 'Mempelai Wanita', seed: 11, silhouette: true }) });
// Galeri 1..8
for (let i = 1; i <= 8; i++) {
  const [a, b] = PALETTES[i % PALETTES.length];
  files.push({ name: `gallery-${String(i).padStart(2, '0')}.svg`, svg: svgPhoto({ w: 900, h: 900, c1: a, c2: b, label: `Momen ${i}`, seed: i * 5 }) });
}
// Cerita 1..3
for (let i = 1; i <= 3; i++) {
  const [a, b] = PALETTES[(i + 2) % PALETTES.length];
  files.push({ name: `story-${String(i).padStart(2, '0')}.svg`, svg: svgPhoto({ w: 900, h: 700, c1: a, c2: b, label: `Cerita ${i}`, seed: i * 9 }) });
}

for (const f of files) writeFileSync(join(DIR, f.name), f.svg.replace(/\n/g, ''), 'utf8');
console.log(`OK — ${files.length} foto placeholder ditulis ke ${DIR}`);
