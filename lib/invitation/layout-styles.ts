import type { LayoutId, Budaya } from '@/lib/engine';

// ============================================================================
// FASE 1d/2/3 — Gaya layout sebagai DATA.
// Semua layout dirender oleh satu komposer (InvitationBody) yang membaca preset
// ini. Menambah layout = menambah preset, bukan menyalin komposer (Prinsip #1).
//
// TIGA SUMBU yang membentuk identitas sebuah tema:
//   1. urutan[]  — TATANAN bagian. Dulu hardcoded sama untuk 300 tema.
//   2. varian    — POSISI/bentuk tiap bagian (pembuka/countdown/acara/galeri),
//                  meniru Cover yang sejak awal punya 19 varian dan karena itu
//                  terasa hidup, sementara isi terasa mati karena cuma punya 1.
//   3. signature — CIRI KHAS BUDAYA. Sengaja diturunkan dari `budaya`, BUKAN
//                  dari layout. Sebabnya: layout dipakai lintas budaya (dulu
//                  'royal' dipakai tema Jawa, Barat, DAN China sehingga ketiganya
//                  tampil identik). Dengan signature per budaya, Jawa+royal dan
//                  China+royal tetap berbeda karakter.
// ============================================================================

export type CoverVariant =
  | 'classic'
  | 'editorial'
  | 'frame'
  | 'polaroid'
  | 'royal'
  | 'minimal'
  | 'timeless'
  | 'split'
  | 'stamp'
  | 'magazine'
  | 'arch'
  | 'ticket'
  | 'band'
  | 'poster'
  | 'circular'
  | 'letter'
  | 'botanical'
  | 'duotone'
  | 'scrapbook';

export type MempelaiVariant =
  | 'card'
  | 'polaroid'
  | 'royal'
  | 'editorial'
  | 'side'
  | 'stamp'
  | 'arch'
  | 'circular'
  | 'tape';

/** Bagaimana tiap bagian dibungkus. */
export type SectionChrome =
  | 'card'
  | 'open'
  | 'dashed'
  | 'accent-left'
  | 'arch'
  | 'band'
  | 'ornate'
  | 'tape';

/** Gaya judul bagian. */
export type HeadingStyle = 'script-serif' | 'uppercase-thin' | 'double-rule' | 'ornate';

// --- Sumbu 1: tatanan ------------------------------------------------------

/** Setiap bagian isi undangan. Urutannya ditentukan layout, bukan komposer. */
export type SectionId =
  | 'pembuka'
  | 'countdown'
  | 'mempelai'
  | 'cerita'
  | 'acara'
  | 'peta'
  | 'galeri'
  | 'live'
  | 'rsvp'
  | 'amplop'
  | 'penutup';

export const SEMUA_SECTION: SectionId[] = [
  'pembuka',
  'countdown',
  'mempelai',
  'cerita',
  'acara',
  'peta',
  'galeri',
  'live',
  'rsvp',
  'amplop',
  'penutup',
];

// Tatanan terkurasi. Masing-masing WAJIB memuat kesebelas bagian tepat sekali —
// dijaga oleh assertUrutanValid() di bawah agar bagian tak pernah hilang/dobel.

/** Alur umum: sapa → hitung mundur → siapa → kisah → kapan → di mana. */
const BAKU: SectionId[] = ['pembuka', 'countdown', 'mempelai', 'cerita', 'acara', 'peta', 'galeri', 'live', 'rsvp', 'amplop', 'penutup'];

/** Adat: keluarga & restu lebih dulu, hitung mundur belakangan. */
const ADAT: SectionId[] = ['pembuka', 'mempelai', 'acara', 'countdown', 'cerita', 'galeri', 'peta', 'live', 'amplop', 'rsvp', 'penutup'];

/** Tenang: tanpa "jualan" hitung mundur di depan; ia muncul setelah konteks. */
const TENANG: SectionId[] = ['pembuka', 'mempelai', 'cerita', 'acara', 'peta', 'galeri', 'countdown', 'live', 'rsvp', 'amplop', 'penutup'];

/** Simetris: berpasangan, amplop naik karena angpao bagian dari adat. */
const SIMETRIS: SectionId[] = ['pembuka', 'mempelai', 'cerita', 'countdown', 'acara', 'peta', 'galeri', 'amplop', 'live', 'rsvp', 'penutup'];

/** Naratif: kisah dulu, baru siapa dan kapan. */
const NARATIF: SectionId[] = ['pembuka', 'cerita', 'mempelai', 'galeri', 'acara', 'countdown', 'peta', 'live', 'rsvp', 'amplop', 'penutup'];

/** Tiket: acara langsung di atas, seperti tiket masuk. */
const TIKET: SectionId[] = ['pembuka', 'acara', 'countdown', 'mempelai', 'peta', 'cerita', 'galeri', 'live', 'rsvp', 'amplop', 'penutup'];

/** Album: foto jadi tokoh utama. */
const ALBUM: SectionId[] = ['pembuka', 'mempelai', 'galeri', 'cerita', 'countdown', 'acara', 'peta', 'live', 'rsvp', 'amplop', 'penutup'];

/** Ringkas: inti (siapa/kapan/di mana) dituntaskan lebih dulu. */
const RINGKAS: SectionId[] = ['pembuka', 'mempelai', 'acara', 'peta', 'countdown', 'cerita', 'galeri', 'live', 'rsvp', 'amplop', 'penutup'];

// --- Sumbu 2: varian struktur per bagian -----------------------------------

export type PembukaVariant =
  | 'center' // rata tengah klasik
  | 'rail' // rata kiri dengan rel aksen
  | 'tategaki' // kolom vertikal + ruang kosong (ma)
  | 'couplet' // dua bait berpasangan, simetris
  | 'gunungan'; // dibingkai lengkung gunungan

export type CountdownVariant =
  | 'boxes' // empat kotak (lama)
  | 'ring' // cincin progres
  | 'inline' // satu baris ramping
  | 'rule' // angka besar dipisah garis rambut
  | 'stack'; // bertumpuk vertikal

export type AcaraVariant =
  | 'card' // kartu bertumpuk (lama)
  | 'timeline' // garis waktu vertikal
  | 'stub' // sobekan tiket
  | 'duo'; // dua kolom berdampingan

export type GaleriVariant =
  | 'grid'
  | 'polaroid'
  | 'masonry'
  | 'filmstrip'
  | 'scatter';

// --- Sumbu 3: ciri khas budaya ---------------------------------------------

export type Signature = 'gunungan' | 'tenun' | 'kamon' | 'seal' | 'deco' | 'none';

/**
 * Ciri khas ditentukan BUDAYA, bukan layout — inilah yang menjamin dua tema
 * berbudaya beda tak pernah identik walau kebetulan memakai layout sama
 * (dulu Kawung Ratri/jawa, Menara Gading/barat, dan Merah Kencana/china
 * sama-sama layout 'royal' dan hasilnya tampil persis sama).
 *
 * Karena itu setiap budaya WAJIB punya penanda yang tergambar — 'none' hanya
 * untuk 'universal', yang memang tak mengklaim budaya apa pun.
 *
 * Catatan: 'kamon' (medali lambang) berbeda dari varian pembuka 'tategaki'.
 * Yang pertama ciri budaya (menempel di tema Jepang mana pun), yang kedua
 * pilihan layout (hanya washi & noren). Dua sumbu, jangan dicampur.
 */
export const SIGNATURE_BY_BUDAYA: Record<Budaya, Signature> = {
  jawa: 'gunungan',
  nusantara: 'tenun',
  jepang: 'kamon',
  china: 'seal',
  barat: 'deco',
  universal: 'none',
};

export interface LayoutStyle {
  id: LayoutId;
  containerClass: string;
  /** Bingkai ornamen mengelilingi seluruh undangan. */
  framed: boolean;
  patternOpacity: number;
  patternScale: number;
  chrome: SectionChrome;
  /** Kelas tambahan untuk kartu (chrome 'card'). */
  cardClass: string;
  headingAlign: 'center' | 'left';
  headingStyle: HeadingStyle;
  cover: CoverVariant;
  mempelai: MempelaiVariant;
  /** Tatanan bagian isi. */
  urutan: SectionId[];
  pembuka: PembukaVariant;
  countdown: CountdownVariant;
  acara: AcaraVariant;
  galeri: GaleriVariant;
}

export const LAYOUT_STYLES: Record<LayoutId, LayoutStyle> = {
  'classic-scroll': {
    id: 'classic-scroll',
    containerClass: 'max-w-invite',
    framed: false,
    patternOpacity: 0.05,
    patternScale: 1,
    chrome: 'card',
    cardClass: 'rounded-3xl shadow-sm ring-1 ring-black/5',
    headingAlign: 'center',
    headingStyle: 'script-serif',
    cover: 'classic',
    mempelai: 'card',
    urutan: BAKU,
    pembuka: 'center',
    countdown: 'boxes',
    acara: 'card',
    galeri: 'grid',
  },
  editorial: {
    id: 'editorial',
    containerClass: 'max-w-xl',
    framed: false,
    patternOpacity: 0.04,
    patternScale: 1.4,
    chrome: 'open',
    cardClass: '',
    headingAlign: 'left',
    headingStyle: 'script-serif',
    cover: 'editorial',
    mempelai: 'editorial',
    urutan: NARATIF,
    pembuka: 'rail',
    countdown: 'inline',
    acara: 'timeline',
    galeri: 'masonry',
  },
  frame: {
    id: 'frame',
    containerClass: 'max-w-invite',
    framed: true,
    patternOpacity: 0.06,
    patternScale: 1,
    chrome: 'card',
    cardClass: 'rounded-2xl ring-1 ring-[color-mix(in_srgb,var(--accent)_35%,transparent)]',
    headingAlign: 'center',
    headingStyle: 'script-serif',
    cover: 'frame',
    mempelai: 'card',
    urutan: BAKU,
    pembuka: 'center',
    countdown: 'ring',
    acara: 'card',
    galeri: 'grid',
  },
  polaroid: {
    id: 'polaroid',
    containerClass: 'max-w-invite',
    framed: false,
    patternOpacity: 0.05,
    patternScale: 1.1,
    chrome: 'card',
    cardClass: 'rounded-xl shadow-md ring-1 ring-black/5',
    headingAlign: 'center',
    headingStyle: 'script-serif',
    cover: 'polaroid',
    mempelai: 'polaroid',
    urutan: ALBUM,
    pembuka: 'center',
    countdown: 'stack',
    acara: 'card',
    galeri: 'polaroid',
  },
  royal: {
    id: 'royal',
    containerClass: 'max-w-[28rem]',
    framed: true,
    patternOpacity: 0.05,
    patternScale: 0.95,
    chrome: 'card',
    cardClass:
      'rounded-none ring-1 ring-[color-mix(in_srgb,var(--accent)_45%,transparent)] shadow-sm',
    headingAlign: 'center',
    headingStyle: 'script-serif',
    cover: 'royal',
    mempelai: 'royal',
    urutan: BAKU,
    pembuka: 'center',
    countdown: 'ring',
    acara: 'duo',
    galeri: 'grid',
  },

  // --- Layout baru ---------------------------------------------------------
  minimalis: {
    id: 'minimalis',
    containerClass: 'max-w-[26rem]',
    framed: false,
    patternOpacity: 0.025,
    patternScale: 1.6,
    chrome: 'open',
    cardClass: '',
    headingAlign: 'center',
    headingStyle: 'uppercase-thin',
    cover: 'minimal',
    mempelai: 'side',
    urutan: RINGKAS,
    pembuka: 'rail',
    countdown: 'rule',
    acara: 'duo',
    galeri: 'filmstrip',
  },
  timeless: {
    id: 'timeless',
    containerClass: 'max-w-invite',
    framed: false,
    patternOpacity: 0, // bersih, tanpa pola latar
    patternScale: 1,
    chrome: 'open',
    cardClass: '',
    headingAlign: 'center',
    headingStyle: 'double-rule',
    cover: 'timeless',
    mempelai: 'card',
    urutan: BAKU,
    pembuka: 'center',
    countdown: 'rule',
    acara: 'timeline',
    galeri: 'grid',
  },
  split: {
    id: 'split',
    containerClass: 'max-w-invite',
    framed: false,
    patternOpacity: 0.04,
    patternScale: 1.2,
    chrome: 'accent-left',
    cardClass: '',
    headingAlign: 'left',
    headingStyle: 'script-serif',
    cover: 'split',
    mempelai: 'side',
    urutan: NARATIF,
    pembuka: 'rail',
    countdown: 'inline',
    acara: 'duo',
    galeri: 'filmstrip',
  },
  stamp: {
    id: 'stamp',
    containerClass: 'max-w-invite',
    framed: false,
    patternOpacity: 0.05,
    patternScale: 1.1,
    chrome: 'dashed',
    cardClass: '',
    headingAlign: 'center',
    headingStyle: 'script-serif',
    cover: 'stamp',
    mempelai: 'stamp',
    urutan: TIKET,
    pembuka: 'center',
    countdown: 'stack',
    acara: 'stub',
    galeri: 'scatter',
  },

  // --- Gelombang kedua (15 layout) ----------------------------------------
  magazine: {
    id: 'magazine', containerClass: 'max-w-xl', framed: false, patternOpacity: 0.03, patternScale: 1.5,
    chrome: 'open', cardClass: '', headingAlign: 'left', headingStyle: 'script-serif',
    cover: 'magazine', mempelai: 'editorial',
    urutan: NARATIF, pembuka: 'rail', countdown: 'inline', acara: 'timeline', galeri: 'masonry',
  },
  arch: {
    id: 'arch', containerClass: 'max-w-invite', framed: false, patternOpacity: 0.05, patternScale: 1,
    chrome: 'arch', cardClass: '', headingAlign: 'center', headingStyle: 'script-serif',
    cover: 'arch', mempelai: 'arch',
    urutan: BAKU, pembuka: 'center', countdown: 'ring', acara: 'card', galeri: 'grid',
  },
  ticket: {
    id: 'ticket', containerClass: 'max-w-invite', framed: false, patternOpacity: 0.045, patternScale: 1.1,
    chrome: 'dashed', cardClass: '', headingAlign: 'center', headingStyle: 'uppercase-thin',
    cover: 'ticket', mempelai: 'side',
    urutan: TIKET, pembuka: 'center', countdown: 'inline', acara: 'stub', galeri: 'filmstrip',
  },
  band: {
    id: 'band', containerClass: 'max-w-invite', framed: false, patternOpacity: 0.04, patternScale: 1.2,
    chrome: 'band', cardClass: '', headingAlign: 'center', headingStyle: 'script-serif',
    cover: 'band', mempelai: 'card',
    urutan: BAKU, pembuka: 'center', countdown: 'rule', acara: 'timeline', galeri: 'grid',
  },
  poster: {
    id: 'poster', containerClass: 'max-w-xl', framed: false, patternOpacity: 0.04, patternScale: 1.4,
    chrome: 'open', cardClass: '', headingAlign: 'left', headingStyle: 'uppercase-thin',
    cover: 'poster', mempelai: 'editorial',
    urutan: NARATIF, pembuka: 'rail', countdown: 'stack', acara: 'duo', galeri: 'masonry',
  },
  circular: {
    id: 'circular', containerClass: 'max-w-invite', framed: false, patternOpacity: 0.05, patternScale: 1,
    chrome: 'card', cardClass: 'rounded-3xl shadow-sm ring-1 ring-black/5', headingAlign: 'center', headingStyle: 'script-serif',
    cover: 'circular', mempelai: 'circular',
    urutan: BAKU, pembuka: 'center', countdown: 'ring', acara: 'card', galeri: 'grid',
  },
  letter: {
    id: 'letter', containerClass: 'max-w-invite', framed: false, patternOpacity: 0, patternScale: 1,
    chrome: 'open', cardClass: '', headingAlign: 'center', headingStyle: 'double-rule',
    cover: 'letter', mempelai: 'card',
    urutan: BAKU, pembuka: 'center', countdown: 'rule', acara: 'card', galeri: 'grid',
  },
  botanical: {
    id: 'botanical', containerClass: 'max-w-invite', framed: false, patternOpacity: 0.06, patternScale: 1.1,
    chrome: 'ornate', cardClass: '', headingAlign: 'center', headingStyle: 'ornate',
    cover: 'botanical', mempelai: 'card',
    urutan: ALBUM, pembuka: 'center', countdown: 'stack', acara: 'card', galeri: 'scatter',
  },
  duotone: {
    id: 'duotone', containerClass: 'max-w-invite', framed: false, patternOpacity: 0.04, patternScale: 1.3,
    chrome: 'accent-left', cardClass: '', headingAlign: 'left', headingStyle: 'uppercase-thin',
    cover: 'duotone', mempelai: 'side',
    urutan: NARATIF, pembuka: 'rail', countdown: 'inline', acara: 'duo', galeri: 'filmstrip',
  },
  scrapbook: {
    id: 'scrapbook', containerClass: 'max-w-invite', framed: false, patternOpacity: 0.05, patternScale: 1.1,
    chrome: 'tape', cardClass: '', headingAlign: 'center', headingStyle: 'script-serif',
    cover: 'scrapbook', mempelai: 'tape',
    urutan: ALBUM, pembuka: 'center', countdown: 'stack', acara: 'card', galeri: 'scatter',
  },
  ornate: {
    id: 'ornate', containerClass: 'max-w-[28rem]', framed: true, patternOpacity: 0.05, patternScale: 0.95,
    chrome: 'ornate', cardClass: '', headingAlign: 'center', headingStyle: 'ornate',
    cover: 'frame', mempelai: 'card',
    urutan: BAKU, pembuka: 'center', countdown: 'ring', acara: 'card', galeri: 'grid',
  },
  gazette: {
    id: 'gazette', containerClass: 'max-w-xl', framed: false, patternOpacity: 0.03, patternScale: 1.3,
    chrome: 'band', cardClass: '', headingAlign: 'center', headingStyle: 'double-rule',
    cover: 'poster', mempelai: 'card',
    urutan: TIKET, pembuka: 'center', countdown: 'rule', acara: 'timeline', galeri: 'masonry',
  },
  lantern: {
    id: 'lantern', containerClass: 'max-w-invite', framed: true, patternOpacity: 0.06, patternScale: 1,
    chrome: 'ornate', cardClass: '', headingAlign: 'center', headingStyle: 'script-serif',
    cover: 'arch', mempelai: 'arch',
    urutan: SIMETRIS, pembuka: 'center', countdown: 'ring', acara: 'card', galeri: 'grid',
  },
  tropis: {
    id: 'tropis', containerClass: 'max-w-invite', framed: false, patternOpacity: 0.07, patternScale: 1.1,
    chrome: 'card', cardClass: 'rounded-2xl shadow-md ring-1 ring-black/5', headingAlign: 'center', headingStyle: 'script-serif',
    cover: 'botanical', mempelai: 'polaroid',
    urutan: ALBUM, pembuka: 'center', countdown: 'stack', acara: 'card', galeri: 'polaroid',
  },
  manuscript: {
    id: 'manuscript', containerClass: 'max-w-invite', framed: false, patternOpacity: 0, patternScale: 1,
    chrome: 'open', cardClass: '', headingAlign: 'center', headingStyle: 'double-rule',
    cover: 'letter', mempelai: 'side',
    urutan: BAKU, pembuka: 'center', countdown: 'rule', acara: 'timeline', galeri: 'grid',
  },

  // --- Layout EKSKLUSIF per budaya ----------------------------------------
  // Hanya boleh dipakai pool budaya yang bersangkutan (dijaga gen-registry).
  pendhapa: {
    id: 'pendhapa', containerClass: 'max-w-invite', framed: true, patternOpacity: 0.07, patternScale: 0.9,
    chrome: 'arch', cardClass: '', headingAlign: 'center', headingStyle: 'ornate',
    cover: 'arch', mempelai: 'royal',
    urutan: ADAT, pembuka: 'gunungan', countdown: 'ring', acara: 'timeline', galeri: 'grid',
  },
  tenun: {
    id: 'tenun', containerClass: 'max-w-invite', framed: false, patternOpacity: 0.08, patternScale: 1.05,
    chrome: 'band', cardClass: '', headingAlign: 'center', headingStyle: 'ornate',
    cover: 'band', mempelai: 'card',
    urutan: ADAT, pembuka: 'center', countdown: 'stack', acara: 'card', galeri: 'scatter',
  },
  washi: {
    id: 'washi', containerClass: 'max-w-[27rem]', framed: false, patternOpacity: 0.03, patternScale: 1.5,
    chrome: 'open', cardClass: '', headingAlign: 'left', headingStyle: 'uppercase-thin',
    cover: 'minimal', mempelai: 'side',
    urutan: TENANG, pembuka: 'tategaki', countdown: 'rule', acara: 'duo', galeri: 'filmstrip',
  },
  noren: {
    id: 'noren', containerClass: 'max-w-[27rem]', framed: false, patternOpacity: 0.05, patternScale: 1.3,
    chrome: 'band', cardClass: '', headingAlign: 'center', headingStyle: 'uppercase-thin',
    cover: 'split', mempelai: 'circular',
    urutan: TENANG, pembuka: 'tategaki', countdown: 'inline', acara: 'timeline', galeri: 'masonry',
  },
  shuangxi: {
    id: 'shuangxi', containerClass: 'max-w-[28rem]', framed: true, patternOpacity: 0.06, patternScale: 0.95,
    chrome: 'ornate', cardClass: '', headingAlign: 'center', headingStyle: 'double-rule',
    cover: 'circular', mempelai: 'circular',
    urutan: SIMETRIS, pembuka: 'couplet', countdown: 'ring', acara: 'duo', galeri: 'grid',
  },
};

/**
 * Jaring pengaman: tatanan yang cacat berarti bagian undangan HILANG dari
 * halaman tamu tanpa error — kegagalan senyap yang paling mahal di sini.
 * Karena LAYOUT_STYLES statis, cukup divalidasi sekali saat modul dimuat.
 */
function assertUrutanValid(): void {
  const lengkap = new Set<string>(SEMUA_SECTION);
  Object.entries(LAYOUT_STYLES).forEach(([id, s]) => {
    const unik = new Set<string>(s.urutan);
    if (unik.size !== s.urutan.length) {
      throw new Error(`Layout "${id}": ada bagian dobel di urutan.`);
    }
    SEMUA_SECTION.forEach((bagian) => {
      if (!unik.has(bagian)) throw new Error(`Layout "${id}": bagian "${bagian}" hilang dari urutan.`);
    });
    s.urutan.forEach((bagian) => {
      if (!lengkap.has(bagian)) throw new Error(`Layout "${id}": bagian tak dikenal "${bagian}".`);
    });
  });
}
assertUrutanValid();

export function getLayoutStyle(id: LayoutId): LayoutStyle {
  return LAYOUT_STYLES[id] ?? LAYOUT_STYLES['classic-scroll'];
}

export function getSignature(budaya: Budaya): Signature {
  return SIGNATURE_BY_BUDAYA[budaya] ?? 'none';
}
