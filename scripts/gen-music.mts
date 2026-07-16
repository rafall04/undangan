/* eslint-disable no-console */
// ============================================================================
// Generator backsound ORISINIL (komposisi kode ini → bebas hak cipta).
// Dua gaya:
//  • musicbox: sinus + harmonik, arpeggio lembut (diatonik).
//  • gamelan : timbre metalofon inharmonik + gong + laras SLENDRO (nuansa Jawa).
// Loop mulus lewat tail-wrap (modulo). Output MP3 mono → public/media/library/.
//   npm run gen-music
// Lagu berhak cipta (Indonesia/Jawa asli) TIDAK boleh dipakai — hanya royalty-
// free/CC0 atau komposisi orisinil seperti ini.
// ============================================================================
import { mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import lamejs from '@breezystack/lamejs';

const SR = 44100;
const OUT_DIR = join(process.cwd(), 'public', 'media', 'library');
const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
// Laras slendro: 5 nada ~240 sen (0.2 oktaf) per langkah.
const slendroFreq = (base: number, deg: number) => {
  const oct = Math.floor(deg / 5);
  const step = ((deg % 5) + 5) % 5;
  return base * Math.pow(2, oct + step * 0.2);
};

// --- Timbre: music-box (harmonik + decay) ---
function addNote(buf: Float64Array, startSec: number, freq: number, gain: number) {
  const n0 = Math.floor(startSec * SR);
  const len = Math.floor(2.6 * SR);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.exp(-t * 2.4) * (1 - Math.exp(-t * 120));
    const s =
      Math.sin(2 * Math.PI * freq * t) +
      Math.sin(2 * Math.PI * freq * 2 * t) * 0.32 +
      Math.sin(2 * Math.PI * freq * 3 * t) * 0.14 +
      Math.sin(2 * Math.PI * freq * 4 * t) * 0.06;
    buf[(n0 + i) % buf.length] += s * env * gain;
  }
}

// --- Timbre: metalofon gamelan (parsial inharmonik, decay) ---
const METAL: Array<[number, number, number]> = [
  [1, 1, 1.9],
  [2.01, 0.5, 1.5],
  [2.76, 0.35, 1.1],
  [5.15, 0.18, 0.7],
  [6.63, 0.1, 0.5],
];
function addMetal(buf: Float64Array, startSec: number, freq: number, gain: number) {
  const n0 = Math.floor(startSec * SR);
  const len = Math.floor(2.2 * SR);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const atk = 1 - Math.exp(-t * 200);
    let s = 0;
    for (const [r, a, d] of METAL) s += a * Math.sin(2 * Math.PI * freq * r * t) * Math.exp(-t / d);
    buf[(n0 + i) % buf.length] += s * atk * gain * 0.5;
  }
}

// --- Gong/kempul: rendah, parsial inharmonik, decay panjang ---
const GONG: Array<[number, number]> = [
  [1, 1],
  [1.48, 0.5],
  [2.03, 0.35],
  [2.66, 0.22],
  [3.01, 0.12],
];
function addGong(buf: Float64Array, startSec: number, freq: number, gain: number) {
  const n0 = Math.floor(startSec * SR);
  const len = Math.floor(4.2 * SR);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const atk = 1 - Math.exp(-t * 60);
    let s = 0;
    for (const [r, a] of GONG) s += a * Math.sin(2 * Math.PI * freq * r * t);
    buf[(n0 + i) % buf.length] += s * atk * Math.exp(-t / 3.4) * gain * 0.5;
  }
}

// --- Pad lembut (drone) ---
function addPad(buf: Float64Array, startSec: number, durSec: number, freq: number, gain: number) {
  const n0 = Math.floor(startSec * SR);
  const len = Math.floor(durSec * SR);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const fade = Math.min(1, t / 0.8, (durSec - t) / 0.8);
    const s = Math.sin(2 * Math.PI * freq * t) * 0.6 + Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.22;
    buf[(n0 + i) % buf.length] += s * Math.max(0, fade) * gain;
  }
}

function normalizeToMp3(buf: Float64Array, kbps: number): Buffer {
  let peak = 0;
  for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i]));
  const norm = peak > 0 ? 0.85 / peak : 1;
  const pcm = new Int16Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    const v = Math.tanh(buf[i] * norm * 1.1);
    pcm[i] = Math.max(-32768, Math.min(32767, Math.round(v * 32767)));
  }
  const enc = new lamejs.Mp3Encoder(1, SR, kbps);
  const chunks: Buffer[] = [];
  for (let i = 0; i < pcm.length; i += 1152) {
    const b = enc.encodeBuffer(pcm.subarray(i, i + 1152));
    if (b.length) chunks.push(Buffer.from(b));
  }
  const end = enc.flush();
  if (end.length) chunks.push(Buffer.from(end));
  return Buffer.concat(chunks);
}

interface MusicBox {
  id: string;
  kind: 'musicbox';
  bpm: number;
  bars: number[][];
  pattern: number[];
  melodyOctave: number;
  kbps: number;
}
interface Gamelan {
  id: string;
  kind: 'gamelan';
  bpm: number;
  baseFreq: number;
  melody: number[]; // derajat slendro per 1/8; pola diulang
  kbps: number;
}
type Track = MusicBox | Gamelan;

function renderMusicBox(t: MusicBox): Float64Array {
  const spb = 60 / t.bpm;
  const barSec = spb * 4;
  const buf = new Float64Array(Math.floor(barSec * t.bars.length * SR));
  t.bars.forEach((chord, bar) => {
    const b0 = bar * barSec;
    addPad(buf, b0, barSec, midiToFreq(chord[0] - 12), 0.18);
    addPad(buf, b0, barSec, midiToFreq(chord[1] - 12), 0.13);
    for (let s = 0; s < 8; s++) {
      const tone = chord[t.pattern[s] % chord.length] + t.melodyOctave;
      addNote(buf, b0 + s * (spb / 2), midiToFreq(tone), 0.5);
    }
  });
  return buf;
}

function renderGamelan(t: Gamelan): Float64Array {
  const stepDur = 60 / t.bpm / 2; // 1/8
  const buf = new Float64Array(Math.floor(t.melody.length * stepDur * SR));
  const total = t.melody.length * stepDur;
  addPad(buf, 0, total, t.baseFreq / 2, 0.14);
  addPad(buf, 0, total, slendroFreq(t.baseFreq / 2, 2), 0.08);
  t.melody.forEach((deg, i) => {
    const at = i * stepDur;
    addMetal(buf, at, slendroFreq(t.baseFreq, deg), 0.5);
    if (i === 0) addGong(buf, at, t.baseFreq / 2, 0.6);
    else if (i % 4 === 0) addGong(buf, at, t.baseFreq / 2, 0.26);
  });
  return buf;
}

const TRACKS: Track[] = [
  { id: 'tenang', kind: 'musicbox', bpm: 64, bars: [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]], pattern: [0, 1, 2, 3, 2, 3, 1, 2], melodyOctave: 12, kbps: 112 },
  { id: 'romantis', kind: 'musicbox', bpm: 72, bars: [[53, 57, 60, 64], [50, 53, 57, 60], [46, 50, 53, 57], [48, 52, 55, 58]], pattern: [0, 1, 2, 3, 2, 1, 0, 1], melodyOctave: 12, kbps: 112 },
  { id: 'ceria', kind: 'musicbox', bpm: 84, bars: [[55, 59, 62, 67], [52, 55, 59, 62], [48, 52, 55, 59], [50, 54, 57, 62]], pattern: [0, 2, 1, 3, 2, 0, 1, 2], melodyOctave: 12, kbps: 112 },
  // --- Nuansa Jawa (slendro, gamelan) ---
  { id: 'gamelan-asmara', kind: 'gamelan', bpm: 56, baseFreq: 262, melody: [4, 3, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 2, 1, 0, 2], kbps: 128 },
  { id: 'langgam-tresna', kind: 'gamelan', bpm: 50, baseFreq: 235, melody: [2, 3, 4, 3, 4, 4, 3, 2, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1, 2, 0, 1, 2, 3], kbps: 128 },
];

mkdirSync(OUT_DIR, { recursive: true });
for (const t of TRACKS) {
  const buf = t.kind === 'musicbox' ? renderMusicBox(t) : renderGamelan(t);
  const mp3 = normalizeToMp3(buf, t.kbps);
  const file = join(OUT_DIR, `${t.id}.mp3`);
  writeFileSync(file, mp3);
  console.log(`✓ ${t.id}.mp3  (${Math.round(statSync(file).size / 1024)} KB, ${(buf.length / SR).toFixed(1)}s, ${t.kind})`);
}
console.log('Selesai →', OUT_DIR);
