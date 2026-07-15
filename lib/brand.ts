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
  // Nomor WhatsApp bisnis (format internasional tanpa +). GANTI sesuai milik Anda.
  whatsapp: '6281234567890',
  instagram: 'rafundangan',
  email: 'halo@raf.my.id',
};

/** Buat link wa.me dengan teks terisi. */
export function waLink(pesan: string, nomor: string = BRAND.whatsapp): string {
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

export interface Paket {
  id: string;
  nama: string;
  harga: string;
  hargaAngka: number;
  ringkas: string;
  populer?: boolean;
  fitur: string[];
}

// Tiga paket harga (silakan sesuaikan).
export const PAKET: Paket[] = [
  {
    id: 'perak',
    nama: 'Perak',
    harga: 'Rp99.000',
    hargaAngka: 99000,
    ringkas: 'Cukup untuk undangan yang manis & lengkap.',
    fitur: [
      'Pilih dari 250+ tema',
      'Data lengkap: mempelai, akad & resepsi',
      'Hitung mundur & Google Calendar',
      'Galeri hingga 8 foto',
      'RSVP & ucapan tamu',
      'Aktif 3 bulan',
    ],
  },
  {
    id: 'emas',
    nama: 'Emas',
    harga: 'Rp199.000',
    hargaAngka: 199000,
    ringkas: 'Paling populer — fitur lengkap untuk hari besar Anda.',
    populer: true,
    fitur: [
      'Semua fitur paket Perak',
      'Galeri tanpa batas + love story',
      'Musik latar & peta lokasi',
      'Alat kirim massal + QR code',
      'Kelola daftar tamu & pelacakan',
      'Aktif 6 bulan',
    ],
  },
  {
    id: 'platinum',
    nama: 'Platinum',
    harga: 'Rp349.000',
    hargaAngka: 349000,
    ringkas: 'Sentuhan eksklusif & pendampingan penuh.',
    fitur: [
      'Semua fitur paket Emas',
      'Kustomisasi warna & font khusus',
      'Domain personal (nama Anda)',
      'Prioritas pengerjaan 1x24 jam',
      'Pendampingan via WhatsApp',
      'Aktif 12 bulan',
    ],
  },
];

// Langkah cara pesan.
export const CARA_PESAN = [
  { n: 1, judul: 'Pilih Tema', teks: 'Jelajahi 250+ tema terkurasi dan temukan yang paling mewakili kisah Anda.' },
  { n: 2, judul: 'Kirim Data', teks: 'Kirim data mempelai, jadwal acara, dan foto melalui WhatsApp kami.' },
  { n: 3, judul: 'Undangan Jadi', teks: 'Undangan digital Anda siap dalam 1–2 hari, lengkap dengan tautan personal.' },
  { n: 4, judul: 'Sebar ke Tamu', teks: 'Gunakan alat kirim kami untuk membagikan undangan ke ratusan tamu dengan rapi.' },
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
