// ============================================================================
// FASE 2 — Model data undangan (runtime).
// Bentuk data yang dikonsumsi semua komponen bagian. Foto sudah berupa URL
// (atau undefined → placeholder). Loader klien (Fase 4) & builder demo (Fase 3)
// sama-sama menghasilkan bentuk ini.
// ============================================================================

export type StatusKehadiran = 'hadir' | 'tidak' | 'ragu';

export interface Mempelai {
  /** Nama panggilan (dipakai di cover & judul). */
  panggilan: string;
  /** Nama lengkap beserta gelar. */
  namaLengkap: string;
  /** Mis. "Putra pertama dari" / "Putri kedua dari". */
  urutan?: string;
  ayah: string;
  ibu: string;
  /** Handle Instagram tanpa @. */
  instagram?: string;
  /** URL foto (sudah diresolve). Kosong → placeholder monogram. */
  foto?: string;
  /** object-position crop, mis. "50% 30%". Kosong → center. */
  fotoFokus?: string;
  /** Placeholder blur-up (data-URI mungil) — tampil sementara foto dimuat. */
  fotoBlur?: string;
}

export interface Acara {
  nama: string; // "Akad Nikah", "Resepsi", dll.
  /** ISO date, mis. "2026-09-12". */
  tanggal: string;
  waktuMulai?: string; // "08:00"
  waktuSelesai?: string; // "10:00" atau "Selesai"
  zonaWaktu?: string; // "WIB" | "WITA" | "WIT"
  tempat: string;
  alamat?: string;
  /** Link Google Maps untuk tombol navigasi. */
  mapsUrl?: string;
  /** URL embed Google Maps (src iframe). */
  mapsEmbed?: string;
}

export interface MomenCerita {
  judul: string;
  tanggal?: string;
  deskripsi: string;
  foto?: string;
  /** object-position crop, mis. "50% 30%". Kosong → center. */
  fotoFokus?: string;
  /** Placeholder blur-up (data-URI mungil). */
  fotoBlur?: string;
}

export interface Ucapan {
  nama: string;
  pesan: string;
  kehadiran?: StatusKehadiran;
  /** ISO datetime; untuk contoh statis boleh label bebas. */
  waktu?: string;
}

export interface KutipanTeks {
  teks: string;
  sumber: string;
}

export interface Rekening {
  bank: string; // "BCA", "Mandiri", atau "GoPay"/"OVO" untuk e-wallet
  nomor: string;
  atasNama: string;
  jenis?: 'bank' | 'ewallet';
}

export interface Amplop {
  /** Teks pengantar opsional. */
  catatan?: string;
  rekening?: Rekening[];
  /** Alamat untuk kirim kado fisik (opsional). */
  alamatKado?: string;
}

/** Override kustom di atas tema. Semua opsional; kosong → pakai nilai tema. */
export interface FontOverride {
  /** Nilai CSS family, mis. '"Playfair Display"', atau nama font custom. */
  heading?: string;
  script?: string;
  body?: string;
}

export interface PaletteOverride {
  bg?: string;
  surface?: string;
  primary?: string;
  accent?: string;
  ink?: string;
  muted?: string;
}

/** Font milik sendiri (self-hosted). `file` = nama file di folder klien;
 *  `dataUrl` opsional untuk pratinjau Studio (tidak diekspor). */
export interface CustomFont {
  family: string;
  file?: string;
  dataUrl?: string;
  /** URL terselesaikan (diisi loader/studio); dipakai @font-face. */
  src?: string;
}

export interface DataUndangan {
  /** Slug tema dari registry. */
  temaSlug: string;
  /** True → salam Islami (Assalamualaikum + basmalah) & ayat. */
  islami: boolean;

  mempelai: { pria: Mempelai; wanita: Mempelai };
  /** Urutan tampil nama di cover/mempelai. Default 'pria-dulu'. */
  urutanNama?: 'pria-dulu' | 'wanita-dulu';

  acara: Acara[];
  /** ISO datetime acara utama — untuk hitung mundur & cover. */
  tanggalUtama: string;

  // --- Teks & media opsional ---
  salamPembuka?: string;
  ayat?: KutipanTeks;
  quote?: KutipanTeks;
  ceritaCinta?: MomenCerita[];
  /** URL foto galeri (sudah diresolve, sudah terurut). */
  galeri?: string[];
  fotoCover?: string;
  /** object-position crop foto sampul, mis. "50% 30%". Kosong → center. */
  fotoCoverFokus?: string;
  /** Placeholder blur-up foto sampul (data-URI mungil). */
  fotoCoverBlur?: string;
  /** Siaran langsung (opsional). */
  liveStreaming?: {
    judul?: string;
    deskripsi?: string;
    tanggal?: string;
    waktu?: string;
    youtube?: string;
    instagram?: string;
    facebook?: string;
    link?: string;
  };
  musik?: { judul?: string; src: string };
  ucapanContoh?: Ucapan[];
  penutup?: string;
  hashtag?: string;
  amplop?: Amplop;

  // --- Kustomisasi lanjutan (override di atas tema) ---
  fontOverride?: FontOverride;
  paletteOverride?: PaletteOverride;
  /** Ganti motif ornamen terlepas dari tema. */
  motifOverride?: string;
  /** Font milik sendiri (self-hosted). */
  customFonts?: CustomFont[];
}

/** Nama singkat pasangan, hormati urutanNama. */
export function pasanganPanggilan(d: DataUndangan): [string, string] {
  const { pria, wanita } = d.mempelai;
  return d.urutanNama === 'wanita-dulu'
    ? [wanita.panggilan, pria.panggilan]
    : [pria.panggilan, wanita.panggilan];
}

/** Inisial untuk monogram, mis. "B & S". */
export function monogramPasangan(d: DataUndangan): string {
  const [a, b] = pasanganPanggilan(d);
  return `${(a[0] ?? '').toUpperCase()} & ${(b[0] ?? '').toUpperCase()}`;
}
