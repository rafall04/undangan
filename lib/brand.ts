// ============================================================================
// Konstanta identitas brand & bisnis. UBAH DI SINI (nomor WA, harga, dll).
// ============================================================================

export const BRAND = {
  nama: 'Rafayana',
  induk: 'RAF Undangan',
  penuh: 'Rafayana by RAF Undangan',
  tagline: 'Setiap perjalanan cinta layak diabadikan.',
  domain: 'undangan.raf.my.id',
  baseUrl: 'https://undangan.raf.my.id',
  // Nomor WA bisnis — hanya FALLBACK. Nilai yang dipakai diambil dari
  // Pengaturan (DB, bisa diedit admin di /admin/settings). Lihat lib/settings.ts.
  whatsapp: '6285233047094',
  instagram: 'rafundangan',
  email: 'halo@raf.my.id',
};

/** Buat link wa.me dengan teks terisi. */
export function waLink(pesan: string, nomor: string = BRAND.whatsapp): string {
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

// CATATAN: Paket & harga TIDAK lagi di sini — sekarang tersimpan di DB dan
// dapat diedit admin lewat /admin/settings. Lihat DEFAULT_SETTINGS di
// lib/settings.ts (satu sumber kebenaran, agar harga tak pernah berbeda antar tempat).

// Langkah cara pesan.
export const CARA_PESAN = [
  { n: 1, judul: 'Pilih Tema', teks: 'Jelajahi 250+ tema terkurasi dan temukan yang paling mewakili kisah Anda.' },
  { n: 2, judul: 'Kirim Data', teks: 'Kirim data mempelai, jadwal acara, dan foto melalui WhatsApp kami.' },
  { n: 3, judul: 'Undangan Jadi', teks: 'Undangan digital Anda siap dalam 1–2 hari, lengkap dengan tautan personal.' },
  { n: 4, judul: 'Sebar ke Tamu', teks: 'Gunakan alat kirim kami untuk membagikan undangan ke ratusan tamu dengan rapi.' },
];

// FAQ landing (jawaban sesuai fitur nyata; termasuk live streaming).
export const FAQ = [
  { q: 'Berapa lama proses pembuatannya?', a: 'Undangan Anda siap dalam 1–2 hari kerja setelah data mempelai, jadwal acara, dan foto lengkap kami terima.' },
  { q: 'Belum punya foto, apakah tetap bisa?', a: 'Tentu bisa. Undangan tetap tampil elegan memakai monogram inisial nama Anda dan pasangan — tanpa foto pun tetap cantik.' },
  { q: 'Berapa lama masa aktif undangannya?', a: 'Sesuai paket: Perak aktif 3 bulan, Emas 6 bulan, dan Platinum 12 bulan sejak diterbitkan.' },
  { q: 'Apakah bisa revisi?', a: 'Bisa. Anda dapat merevisi data & detail acara sampai mendekati hari-H melalui admin kami.' },
  { q: 'Bagaimana cara menyebar undangan ke tamu?', a: 'Kami sediakan alat kirim: tautan personal untuk tiap tamu, template pesan WhatsApp siap pakai, QR code, dan pelacakan status terkirim.' },
  { q: 'Apakah ada konfirmasi kehadiran (RSVP) & buku ucapan?', a: 'Ada. Tamu dapat mengonfirmasi kehadiran serta mengirim ucapan & doa langsung dari halaman undangan.' },
  { q: 'Bisa disiarkan langsung (live streaming)?', a: 'Bisa. Undangan mendukung tautan siaran langsung via YouTube, Instagram, atau Facebook untuk tamu yang berhalangan hadir.' },
  { q: 'Bagaimana cara memesannya?', a: 'Pilih tema di katalog, lalu hubungi kami via WhatsApp. Kirim data & foto, dan undangan Anda langsung kami kerjakan.' },
];

// Keunggulan.
export const KEUNGGULAN = [
  { judul: '250+ Tema Terkurasi', teks: 'Bukan template acak — tiap tema dirancang harmonis oleh tim kami.' },
  { judul: 'Foto Warga Kelas Satu', teks: 'Setiap foto tertata rapi dengan bingkai ornamen; tak ada foto gepeng.' },
  { judul: 'Mobile-First', teks: 'Dirancang untuk dibuka dari HP lewat WhatsApp — ringan & cepat.' },
  { judul: 'Alat Kirim Massal', teks: 'Tautan personal per tamu, template pesan, QR code, dan pelacakan status.' },
  { judul: 'Hitung Mundur & RSVP', teks: 'Hitung mundur real-time, konfirmasi kehadiran, dan buku ucapan.' },
  { judul: 'Aman & Pribadi', teks: 'Pengiriman lewat WhatsApp pribadi Anda — akun aman dari pemblokiran.' },
];
