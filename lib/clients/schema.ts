import { z } from 'zod';

// ============================================================================
// FASE 4 — Skema config.json klien (validasi runtime dengan zod).
// Berbeda dari DataUndangan: di sini foto berupa NAMA FILE (bukan URL). Loader
// (load.ts) memetakan nama file → URL bila filenya ada di folder photos/.
// ============================================================================

const kutipan = z.object({
  teks: z.string().min(1),
  sumber: z.string().min(1),
});

const mempelai = z.object({
  panggilan: z.string().min(1),
  namaLengkap: z.string().min(1),
  urutan: z.string().optional(),
  ayah: z.string().min(1),
  ibu: z.string().min(1),
  instagram: z.string().optional(),
  /** Nama file foto di folder photos/, mis. "groom.jpg". */
  foto: z.string().optional(),
});

const acara = z.object({
  nama: z.string().min(1),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  waktuMulai: z.string().optional(),
  waktuSelesai: z.string().optional(),
  zonaWaktu: z.enum(['WIB', 'WITA', 'WIT']).optional(),
  tempat: z.string().min(1),
  alamat: z.string().optional(),
  mapsUrl: z.string().url().optional(),
  mapsEmbed: z.string().url().optional(),
});

const momenCerita = z.object({
  judul: z.string().min(1),
  tanggal: z.string().optional(),
  deskripsi: z.string().min(1),
  foto: z.string().optional(),
});

const ucapan = z.object({
  nama: z.string().min(1),
  pesan: z.string().min(1),
  kehadiran: z.enum(['hadir', 'tidak', 'ragu']).optional(),
  waktu: z.string().optional(),
});

const tamu = z.object({
  nama: z.string().min(1),
  telepon: z.string().optional(),
  grup: z.string().optional(),
});

const rekening = z.object({
  bank: z.string().min(1),
  nomor: z.string().min(1),
  atasNama: z.string().min(1),
  jenis: z.enum(['bank', 'ewallet']).optional(),
});

const amplop = z.object({
  catatan: z.string().optional(),
  rekening: z.array(rekening).optional(),
  alamatKado: z.string().optional(),
});

const fontOverride = z.object({
  heading: z.string().optional(),
  script: z.string().optional(),
  body: z.string().optional(),
});

const hex = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Warna harus hex, mis. #6b4423');
const paletteOverride = z.object({
  bg: hex.optional(),
  surface: hex.optional(),
  primary: hex.optional(),
  accent: hex.optional(),
  ink: hex.optional(),
  muted: hex.optional(),
});

const customFont = z.object({
  family: z.string().min(1),
  file: z.string().optional(),
});

export const configKlienSchema = z.object({
  /** Slug tema dari registry engine. */
  temaSlug: z.string().min(1),
  islami: z.boolean().default(false),
  /** Kode akses sederhana untuk halaman /kirim. */
  accessKey: z.string().min(3),

  urutanNama: z.enum(['pria-dulu', 'wanita-dulu']).default('pria-dulu'),
  mempelai: z.object({ pria: mempelai, wanita: mempelai }),

  /** ISO datetime acara utama (untuk hitung mundur & cover). */
  tanggalUtama: z.string().min(1),
  acara: z.array(acara).min(1),

  salamPembuka: z.string().optional(),
  ayat: kutipan.optional(),
  quote: kutipan.optional(),
  ceritaCinta: z.array(momenCerita).optional(),
  /** Daftar nama file foto galeri, urut. */
  galeri: z.array(z.string()).optional(),
  fotoCover: z.string().optional(),
  musik: z
    .object({ judul: z.string().optional(), file: z.string().optional(), src: z.string().optional() })
    .optional(),
  ucapanContoh: z.array(ucapan).optional(),
  penutup: z.string().optional(),
  hashtag: z.string().optional(),
  amplop: amplop.optional(),

  // --- Kustomisasi lanjutan (opsional) ---
  fontOverride: fontOverride.optional(),
  paletteOverride: paletteOverride.optional(),
  motifOverride: z.string().optional(),
  customFonts: z.array(customFont).optional(),

  /** Daftar tamu opsional (alternatif guests.csv) untuk alat kirim. */
  tamu: z.array(tamu).optional(),

  /** Template pesan WA default (opsional; {nama} & {link}). */
  templatePesan: z.string().optional(),
});

export type ConfigKlien = z.infer<typeof configKlienSchema>;
export type TamuConfig = z.infer<typeof tamu>;
