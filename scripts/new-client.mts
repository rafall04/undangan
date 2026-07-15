/* eslint-disable no-console */
// ============================================================================
// CLI: buat klien baru.  Jalankan:  npm run new-client -- <slug>
// Menyalin template config + struktur folder photos/ agar undangan baru bisa
// dibuat dalam hitungan menit.
// ============================================================================
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REGISTRY_BY_SLUG } from '../lib/engine/registry';

const slug = (process.argv[2] ?? '').trim();

if (!slug) {
  console.error('Pemakaian: npm run new-client -- <slug>\nContoh    : npm run new-client -- andi-nia');
  process.exit(1);
}
if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error(`Slug tidak valid: "${slug}". Gunakan huruf kecil, angka, dan tanda hubung saja.`);
  process.exit(1);
}

const baseDir = join(process.cwd(), 'content', 'clients', slug);
if (existsSync(baseDir)) {
  console.error(`Klien "${slug}" sudah ada di ${baseDir}. Batal.`);
  process.exit(1);
}

const temaDefault = REGISTRY_BY_SLUG['ivori'] ? 'ivori' : Object.keys(REGISTRY_BY_SLUG)[0];

const template = {
  temaSlug: temaDefault,
  islami: false,
  accessKey: `${slug}-ubah-ini`,
  urutanNama: 'pria-dulu',
  hashtag: '',
  tanggalUtama: '2026-12-31T08:00:00',
  mempelai: {
    pria: {
      panggilan: 'Nama Pria',
      namaLengkap: 'Nama Lengkap Pria',
      urutan: 'Putra pertama dari',
      ayah: 'Nama Ayah',
      ibu: 'Nama Ibu',
      instagram: '',
      foto: 'groom.jpg',
    },
    wanita: {
      panggilan: 'Nama Wanita',
      namaLengkap: 'Nama Lengkap Wanita',
      urutan: 'Putri pertama dari',
      ayah: 'Nama Ayah',
      ibu: 'Nama Ibu',
      instagram: '',
      foto: 'bride.jpg',
    },
  },
  acara: [
    {
      nama: 'Akad Nikah',
      tanggal: '2026-12-31',
      waktuMulai: '08:00',
      waktuSelesai: '10:00',
      zonaWaktu: 'WIB',
      tempat: 'Nama Tempat Akad',
      alamat: 'Alamat lengkap',
    },
    {
      nama: 'Resepsi',
      tanggal: '2026-12-31',
      waktuMulai: '11:00',
      waktuSelesai: 'Selesai',
      zonaWaktu: 'WIB',
      tempat: 'Nama Gedung Resepsi',
      alamat: 'Alamat lengkap',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Nama+Gedung',
      mapsEmbed: 'https://maps.google.com/maps?q=Jakarta&output=embed',
    },
  ],
  quote: {
    teks: 'Cinta sejati adalah perjalanan dua hati yang memilih untuk berjalan searah.',
    sumber: 'Rafayana',
  },
  ceritaCinta: [
    { judul: 'Pertama Bertemu', tanggal: '2022-01-01', deskripsi: 'Ceritakan momen pertama kalian bertemu.', foto: 'story-01.jpg' },
  ],
  galeri: ['gallery-01.jpg', 'gallery-02.jpg', 'gallery-03.jpg'],
  fotoCover: 'cover.jpg',
  musik: { judul: 'Instrumen', src: '/media/placeholder-song.wav' },
  ucapanContoh: [
    { nama: 'Nama Tamu', pesan: 'Selamat menempuh hidup baru!', kehadiran: 'hadir', waktu: 'Baru saja' },
  ],
  penutup:
    'Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
  templatePesan:
    'Yth. Bapak/Ibu/Saudara/i {nama}\n\nTanpa mengurangi rasa hormat, kami mengundang Anda ke pernikahan kami.\n\nTautan undangan:\n{link}\n\nTerima kasih.',
  tamu: [{ nama: 'Contoh Tamu', telepon: '081234567890', grup: 'Keluarga' }],
};

mkdirSync(baseDir, { recursive: true });
mkdirSync(join(baseDir, 'photos'), { recursive: true });
writeFileSync(join(baseDir, 'config.json'), JSON.stringify(template, null, 2) + '\n', 'utf8');
writeFileSync(
  join(baseDir, 'photos', 'README.txt'),
  [
    'Letakkan foto klien di folder ini. Nama file harus cocok dengan config.json.',
    '',
    'Rekomendasi ukuran:',
    '  cover.jpg      → 1200×1500 (potret) atau 1600×1000 (lanskap)',
    '  groom/bride    → 800×1000 (rasio 4:5)',
    '  gallery-XX.jpg → min 1000px sisi terpanjang',
    '  story-XX.jpg   → 900×700',
    '',
    'Format: .jpg / .png / .webp / .svg. Foto yang tidak ada otomatis memakai placeholder monogram.',
  ].join('\n'),
  'utf8',
);

console.log(`✓ Klien "${slug}" dibuat di ${baseDir}`);
console.log(`  • Edit content/clients/${slug}/config.json`);
console.log(`  • Taruh foto di content/clients/${slug}/photos/`);
console.log(`  • Tema default: ${temaDefault} (ganti "temaSlug" sesuai katalog)`);
console.log(`  • Pratinjau  : /u/${slug}   ·   Alat kirim: /u/${slug}/kirim`);
console.log(`  • JANGAN lupa ubah "accessKey" untuk halaman kirim.`);
