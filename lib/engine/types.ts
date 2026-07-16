// ============================================================================
// Theme Engine — Tipe Inti
// ----------------------------------------------------------------------------
// Sebuah "tema" bukan file terpisah, melainkan kombinasi terkurasi dari empat
// dimensi: layout × palet × pasangan font × motif ornamen. Semua tipe di sini
// bebas dari React/CSS agar bisa diimpor oleh script node (sanity-check, CLI).
// ============================================================================

export type KategoriTema =
  | 'Adat & Tradisional'
  | 'Elegan & Mewah'
  | 'Modern & Minimalis'
  | 'Rustic & Garden'
  | 'Islami'
  | 'Vintage & Retro';

export const SEMUA_KATEGORI: KategoriTema[] = [
  'Adat & Tradisional',
  'Elegan & Mewah',
  'Modern & Minimalis',
  'Rustic & Garden',
  'Islami',
  'Vintage & Retro',
];

// --- Palet warna -----------------------------------------------------------
export type KategoriPalet = 'Nusantara' | 'Elegan' | 'Soft';

export interface Palet {
  id: string;
  nama: string;
  kategori: KategoriPalet;
  /** Latar halaman. */
  bg: string;
  /** Latar kartu/permukaan (sedikit berbeda dari bg). */
  surface: string;
  /** Warna utama tema (heading aksen, tombol). */
  primary: string;
  /** Aksen sekunder (emas, terakota, dsb). */
  accent: string;
  /** Warna teks utama — wajib kontras AA terhadap bg & surface. */
  ink: string;
  /** Teks sekunder/redup. */
  muted: string;
  /** True bila palet bernuansa gelap (bg gelap, ink terang). */
  gelap?: boolean;
  /** Gradien untuk overlay cover agar teks selalu terbaca. */
  coverGradient: string;
}

// --- Pasangan font ---------------------------------------------------------
export interface PasanganFont {
  id: string;
  nama: string;
  /** Nama family CSS untuk heading (serif/display). */
  heading: string;
  /** Nama family CSS untuk aksen tulisan tangan (script). */
  script: string;
  /** Nama family CSS untuk teks tubuh. */
  body: string;
}

// --- Motif ornamen ---------------------------------------------------------
export type MotifNuansa = 'nusantara' | 'floral' | 'geometris' | 'netral';

/**
 * Sumbu KEDUA katalog (selain `kategori` yang mengurusi GAYA). Dipakai agar
 * pelanggan bisa mencari "Jawa + Elegan" atau "Jepang + Minimalis".
 *
 * ATURAN: budaya sebuah tema mengikuti MOTIFNYA, bukan namanya. Jangan pernah
 * memberi nama berbudaya X pada tema yang memakai motif budaya Y (dulu ada
 * "Minang Saiyo" memakai batik parang Jawa — itu keliru dan sudah diperbaiki).
 * 'universal' = pola dekoratif tanpa klaim budaya tertentu.
 */
export type Budaya = 'jawa' | 'nusantara' | 'jepang' | 'china' | 'barat' | 'universal';

export const SEMUA_BUDAYA: Budaya[] = ['jawa', 'nusantara', 'jepang', 'china', 'barat', 'universal'];

export const LABEL_BUDAYA: Record<Budaya, string> = {
  jawa: 'Jawa',
  nusantara: 'Nusantara',
  jepang: 'Jepang',
  china: 'China',
  barat: 'Barat',
  universal: 'Universal',
};

export interface MotifMeta {
  id: string;
  nama: string;
  nuansa: MotifNuansa;
  /** Asal budaya motif — sumber kebenaran untuk `Tema.budaya`. */
  budaya: Budaya;
}

// --- Layout ----------------------------------------------------------------
export type LayoutId =
  | 'classic-scroll'
  | 'editorial'
  | 'frame'
  | 'polaroid'
  | 'royal'
  | 'minimalis'
  | 'timeless'
  | 'split'
  | 'stamp'
  // gelombang kedua
  | 'magazine'
  | 'arch'
  | 'ticket'
  | 'band'
  | 'poster'
  | 'circular'
  | 'letter'
  | 'botanical'
  | 'duotone'
  | 'scrapbook'
  | 'ornate'
  | 'gazette'
  | 'lantern'
  | 'tropis'
  | 'manuscript'
  // Layout EKSKLUSIF per budaya. Tidak boleh dipakai pool budaya lain —
  // dijaga oleh guard di gen-registry. Inilah yang membuat tema Jawa dan
  // tema China tidak lagi tampil identik (dulu keduanya sama-sama 'royal').
  | 'pendhapa' // jawa
  // 'tenun', bukan 'songket': motif nusantara kita masih dedaunan tropis yang
  // generik. Songket itu tenun khas Melayu/Minang/Palembang — menamainya begitu
  // mengulang kekeliruan "Minang Saiyo memakai batik Jawa" yang sudah kita buang.
  | 'tenun' // nusantara
  | 'washi' // jepang
  | 'noren' // jepang
  | 'shuangxi'; // china

export interface LayoutMeta {
  id: LayoutId;
  nama: string;
  deskripsi: string;
}

// --- Tema (entri registry) -------------------------------------------------
export interface Tema {
  slug: string;
  namaTampilan: string;
  /** Sumbu GAYA. */
  kategori: KategoriTema;
  /** Sumbu BUDAYA — diturunkan dari motif oleh generator, bukan dari nama. */
  budaya: Budaya;
  layoutId: LayoutId;
  paletId: string;
  fontId: string;
  motifId: string;
  tagline: string;
}

/** Tema yang sudah "diselesaikan" — referensi id ditukar dengan objek nyata. */
export interface TemaResolved extends Tema {
  palet: Palet;
  font: PasanganFont;
  motif: MotifMeta;
  layout: LayoutMeta;
}
