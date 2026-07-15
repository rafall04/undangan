/* eslint-disable no-console */
// ============================================================================
// Generator backsound ORISINIL (komposisi kode ini sendiri → bebas hak cipta).
// Timbre music-box (sinus + harmonik, decay) + pad lembut. Loop mulus lewat
// tail-wrap (modulo). Output MP3 mono ke public/media/library/.
//   npm run gen-music
// Track royalty-free "kekinian" bisa ditambah manual ke folder yang sama +
// daftarkan di lib/music/library.ts.
// ============================================================================
import { mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import lamejs from '@breezystack/lamejs';

const SR = 44100;
const OUT_DIR = join(process.cwd(), 'public', 'media', 'library');

const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

interface Track {
  id: string;
  bpm: number;
  /** Chord per bar (nada MIDI). Arpeggio ambil dari sini. */
  bars: number[][];
  /** Pola langkah arpeggio (indeks nada chord) per bar, 8 langkah (1/8). */
  pattern: number[];
  /** Oktaf melodi relatif chord (mis. +12). */
  melodyOctave: number;
  kbps: number;
}

// Music-box note: harmonik + envelope decay eksponensial (attack cepat).
function addNote(buf: Float64Array, startSec: number, freq: number, gain: number) {
  const n0 = Math.floor(startSec * SR);
  const dur = 2.6; // detik ekor decay
  const len = Math.floor(dur * SR);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.exp(-t * 2.4) * (1 - Math.exp(-t * 120));
    const s =
      Math.sin(2 * Math.PI * freq * t) * 1.0 +
      Math.sin(2 * Math.PI * freq * 2 * t) * 0.32 +
      Math.sin(2 * Math.PI * freq * 3 * t) * 0.14 +
      Math.sin(2 * Math.PI * freq * 4 * t) * 0.06;
    buf[(n0 + i) % buf.length] += s * env * gain; // wrap → loop mulus
  }
}

// Pad lembut: root + fifth rendah, sustain sepanjang bar dengan fade.
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

function render(track: Track): Int16Array {
  const secPerBeat = 60 / track.bpm;
  const barSec = secPerBeat * 4;
  const totalSec = barSec * track.bars.length;
  const buf = new Float64Array(Math.floor(totalSec * SR));

  track.bars.forEach((chord, bar) => {
    const barStart = bar * barSec;
    // Pad: dua nada terbawah, satu oktaf turun.
    addPad(buf, barStart, barSec, midiToFreq(chord[0] - 12), 0.18);
    addPad(buf, barStart, barSec, midiToFreq(chord[1] - 12), 0.13);
    // Arpeggio melodi: 8 langkah 1/8.
    for (let step = 0; step < 8; step++) {
      const tone = chord[track.pattern[step] % chord.length] + track.melodyOctave;
      addNote(buf, barStart + step * (secPerBeat / 2), midiToFreq(tone), 0.5);
    }
  });

  // Normalisasi + soft-limit.
  let peak = 0;
  for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i]));
  const norm = peak > 0 ? 0.85 / peak : 1;
  const out = new Int16Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    let v = buf[i] * norm;
    v = Math.tanh(v * 1.1); // limit lembut
    out[i] = Math.max(-32768, Math.min(32767, Math.round(v * 32767)));
  }
  return out;
}

function toMp3(pcm: Int16Array, kbps: number): Buffer {
  const enc = new lamejs.Mp3Encoder(1, SR, kbps);
  const chunks: Buffer[] = [];
  const block = 1152;
  for (let i = 0; i < pcm.length; i += block) {
    const buf = enc.encodeBuffer(pcm.subarray(i, i + block));
    if (buf.length) chunks.push(Buffer.from(buf));
  }
  const end = enc.flush();
  if (end.length) chunks.push(Buffer.from(end));
  return Buffer.concat(chunks);
}

const TRACKS: Track[] = [
  {
    id: 'tenang',
    bpm: 64,
    bars: [
      [60, 64, 67, 71], // Cmaj7
      [57, 60, 64, 67], // Am7
      [53, 57, 60, 64], // Fmaj7
      [55, 59, 62, 65], // G
    ],
    pattern: [0, 1, 2, 3, 2, 3, 1, 2],
    melodyOctave: 12,
    kbps: 112,
  },
  {
    id: 'romantis',
    bpm: 72,
    bars: [
      [53, 57, 60, 64], // Fmaj7
      [50, 53, 57, 60], // Dm7
      [46, 50, 53, 57], // Bbmaj7
      [48, 52, 55, 58], // C7
    ],
    pattern: [0, 1, 2, 3, 2, 1, 0, 1],
    melodyOctave: 12,
    kbps: 112,
  },
  {
    id: 'ceria',
    bpm: 84,
    bars: [
      [55, 59, 62, 67], // G
      [52, 55, 59, 62], // Em7
      [48, 52, 55, 59], // Cmaj7
      [50, 54, 57, 62], // D
    ],
    pattern: [0, 2, 1, 3, 2, 0, 1, 2],
    melodyOctave: 12,
    kbps: 112,
  },
];

mkdirSync(OUT_DIR, { recursive: true });
for (const t of TRACKS) {
  const pcm = render(t);
  const mp3 = toMp3(pcm, t.kbps);
  const file = join(OUT_DIR, `${t.id}.mp3`);
  writeFileSync(file, mp3);
  console.log(`✓ ${t.id}.mp3  (${Math.round(statSync(file).size / 1024)} KB, ${(pcm.length / SR).toFixed(1)}s)`);
}
console.log('Selesai →', OUT_DIR);
