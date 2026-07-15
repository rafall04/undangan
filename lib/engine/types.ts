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

export interface MotifMeta {
  id: string;
  nama: string;
  nuansa: MotifNuansa;
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
  | 'manuscript';

export interface LayoutMeta {
  id: LayoutId;
  nama: string;
  deskripsi: string;
}

// --- Tema (entri registry) -------------------------------------------------
export interface Tema {
  slug: string;
  namaTampilan: string;
  kategori: KategoriTema;
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
