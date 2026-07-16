import type { TemaResolved } from '@/lib/engine';
import { REGISTRY } from '@/lib/engine';
import type { DataUndangan, Ucapan } from '@/lib/invitation/types';

// ============================================================================
// FASE 3 — 6 pasangan fiktif untuk demo tema. Dirotasi per tema (deterministik)
// agar demo tiap kategori tidak monoton. Tanpa foto → placeholder monogram.
// ============================================================================

interface Couple {
  pria: { panggilan: string; namaLengkap: string; urutan: string; ayah: string; ibu: string; ig?: string };
  wanita: { panggilan: string; namaLengkap: string; urutan: string; ayah: string; ibu: string; ig?: string };
  kota: string;
  tempatAkad: string;
  tempatResepsi: string;
  alamatResepsi: string;
  tanggal: string; // ISO date
  hashtag: string;
  cerita: { judul: string; tanggal: string; deskripsi: string }[];
}

const COUPLES: Couple[] = [
  {
    pria: { panggilan: 'Raka', namaLengkap: 'Raka Pratama, S.T.', urutan: 'Putra pertama dari', ayah: 'Sujarwo', ibu: 'Retno Wulandari', ig: 'raka.pratama' },
    wanita: { panggilan: 'Ayu', namaLengkap: 'Ayu Lestari, S.Ked.', urutan: 'Putri kedua dari', ayah: 'Hendra Saputra', ibu: 'Dewi Anggraini', ig: 'ayu.lestari' },
    kota: 'Jakarta',
    tempatAkad: 'Masjid Agung Al-Azhar',
    tempatResepsi: 'Balai Kartini, Ruby Room',
    alamatResepsi: 'Jl. Jend. Gatot Subroto, Jakarta Selatan',
    tanggal: '2026-09-12',
    hashtag: 'RakaMenujuAyu',
    cerita: [
      { judul: 'Pertama Bertemu', tanggal: '2021-03-05', deskripsi: 'Dipertemukan dalam satu proyek kampus, tak menyangka akan sejauh ini.' },
      { judul: 'Menjalin Hubungan', tanggal: '2022-06-18', deskripsi: 'Memutuskan untuk saling menguatkan dan bertumbuh bersama.' },
      { judul: 'Lamaran', tanggal: '2026-02-14', deskripsi: 'Di hadapan kedua keluarga, sebuah janji suci dimulai.' },
    ],
  },
  {
    pria: { panggilan: 'Dimas', namaLengkap: 'Dimas Aryasatya', urutan: 'Putra ketiga dari', ayah: 'Widodo', ibu: 'Sri Mulyani', ig: 'dimas.arya' },
    wanita: { panggilan: 'Kirana', namaLengkap: 'Kirana Maheswari', urutan: 'Putri pertama dari', ayah: 'Bambang S.', ibu: 'Yuliana', ig: 'kirana.m' },
    kota: 'Yogyakarta',
    tempatAkad: 'Pendopo Ndalem Ageng',
    tempatResepsi: 'Royal Ambarrukmo, Ballroom',
    alamatResepsi: 'Jl. Laksda Adisucipto, Yogyakarta',
    tanggal: '2026-08-23',
    hashtag: 'DimasKiranaSelamanya',
    cerita: [
      { judul: 'Awal Cerita', tanggal: '2020-11-02', deskripsi: 'Bermula dari obrolan panjang di sebuah kedai kopi tua.' },
      { judul: 'Restu Keluarga', tanggal: '2025-12-20', deskripsi: 'Dua keluarga bertemu, restu pun mengalir.' },
    ],
  },
  {
    pria: { panggilan: 'Farhan', namaLengkap: 'Farhan Abdurrahman, Lc.', urutan: 'Putra kedua dari', ayah: 'H. Mahfud', ibu: 'Hj. Aminah', ig: 'farhan.abd' },
    wanita: { panggilan: 'Zahra', namaLengkap: 'Zahra Nur Fadhilah', urutan: 'Putri pertama dari', ayah: 'H. Sholeh', ibu: 'Hj. Maryam', ig: 'zahra.nf' },
    kota: 'Bandung',
    tempatAkad: 'Masjid Raya Bandung',
    tempatResepsi: 'Gedung Sabuga',
    alamatResepsi: 'Jl. Tamansari No. 73, Bandung',
    tanggal: '2026-10-04',
    hashtag: 'FarhanZahraBarakah',
    cerita: [
      { judul: 'Taaruf', tanggal: '2025-09-10', deskripsi: 'Dipertemukan dengan niat baik, dalam bimbingan keluarga.' },
      { judul: 'Khitbah', tanggal: '2026-01-11', deskripsi: 'Melangkah menuju penyempurnaan separuh agama.' },
    ],
  },
  {
    pria: { panggilan: 'Bagas', namaLengkap: 'Bagas Nugroho', urutan: 'Putra pertama dari', ayah: 'Suryadi', ibu: 'Endang', ig: 'bagas.n' },
    wanita: { panggilan: 'Melati', namaLengkap: 'Melati Puspita', urutan: 'Putri ketiga dari', ayah: 'Gunawan', ibu: 'Ratih', ig: 'melati.p' },
    kota: 'Surabaya',
    tempatAkad: 'Kediaman Mempelai Wanita',
    tempatResepsi: 'Convention Hall Grand City',
    alamatResepsi: 'Jl. Walikota Mustajab, Surabaya',
    tanggal: '2026-07-19',
    hashtag: 'BagasMelatiMekar',
    cerita: [
      { judul: 'Sebangku', tanggal: '2016-07-18', deskripsi: 'Teman satu bangku SMA yang akhirnya menua bersama.' },
      { judul: 'Kembali Bertemu', tanggal: '2023-04-09', deskripsi: 'Takdir mempertemukan kembali setelah bertahun berpisah.' },
      { judul: 'Melamar', tanggal: '2026-03-01', deskripsi: 'Sebuah cincin dan sebuah janji di bawah langit senja.' },
    ],
  },
  {
    pria: { panggilan: 'Reza', namaLengkap: 'Reza Mahendra', urutan: 'Putra kedua dari', ayah: 'Iskandar', ibu: 'Fitri', ig: 'reza.mhndra' },
    wanita: { panggilan: 'Salsa', namaLengkap: 'Salsabila Rahmadani', urutan: 'Putri pertama dari', ayah: 'Taufik', ibu: 'Nurhayati', ig: 'salsa.rd' },
    kota: 'Bali',
    tempatAkad: 'The Ungasan Chapel',
    tempatResepsi: 'Sunset Garden, Uluwatu',
    alamatResepsi: 'Jl. Pantai Selatan Gau, Ungasan, Bali',
    tanggal: '2026-11-15',
    hashtag: 'RezaSalsaJourney',
    cerita: [
      { judul: 'Satu Kantor', tanggal: '2019-02-25', deskripsi: 'Dua rekan kerja yang saling melengkapi dalam diam.' },
      { judul: 'Perjalanan Pertama', tanggal: '2021-08-30', deskripsi: 'Sebuah trip yang mengubah segalanya.' },
    ],
  },
  {
    pria: { panggilan: 'Yoga', namaLengkap: 'Yoga Prasetya', urutan: 'Putra pertama dari', ayah: 'Hariyanto', ibu: 'Lestari', ig: 'yoga.pras' },
    wanita: { panggilan: 'Nadia', namaLengkap: 'Nadia Safitri', urutan: 'Putri kedua dari', ayah: 'Rahmat', ibu: 'Sulastri', ig: 'nadia.sft' },
    kota: 'Medan',
    tempatAkad: 'Kediaman Mempelai Wanita',
    tempatResepsi: 'Grand Ballroom Adimulia Hotel',
    alamatResepsi: 'Jl. Diponegoro No. 8, Medan',
    tanggal: '2026-12-06',
    hashtag: 'YogaNadiaForever',
    cerita: [
      { judul: 'Tak Sengaja', tanggal: '2022-05-14', deskripsi: 'Salah kirim pesan yang berujung pada obrolan tak berujung.' },
      { judul: 'Menjadi Kita', tanggal: '2023-10-01', deskripsi: 'Dua hati memutuskan berjalan searah.' },
    ],
  },
];

const AYAT = {
  teks: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.',
  sumber: 'QS. Ar-Rum: 21',
};
const QUOTE = {
  teks: 'Cinta bukan tentang menemukan seseorang yang sempurna, melainkan belajar melihat dengan sempurna seseorang yang tak sempurna.',
  sumber: 'Sam Keen',
};

const UCAPAN_CONTOH: Ucapan[] = [
  { nama: 'Keluarga Besar Wijaya', pesan: 'Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.', kehadiran: 'hadir', waktu: '2 hari lalu' },
  { nama: 'Rani & Doni', pesan: 'Bahagia selalu untuk kalian berdua. Sampai jumpa di hari bahagia!', kehadiran: 'hadir', waktu: '3 hari lalu' },
  { nama: 'Teman Kuliah', pesan: 'Akhirnyaaa! Selamat ya, semoga langgeng sampai kakek nenek. 🤍', kehadiran: 'ragu', waktu: '5 hari lalu' },
  { nama: 'Pak Bagyo', pesan: 'Turut berbahagia. Mohon maaf belum bisa hadir, doa terbaik menyertai.', kehadiran: 'tidak', waktu: '1 minggu lalu' },
];

/** Pilih pasangan secara deterministik berdasarkan posisi tema di registry. */
function pickCoupleIndex(tema: TemaResolved): number {
  const idx = REGISTRY.findIndex((t) => t.slug === tema.slug);
  return ((idx < 0 ? 0 : idx) % COUPLES.length);
}

/** Bangun DataUndangan demo lengkap untuk sebuah tema. */
export function buildDemoData(tema: TemaResolved): DataUndangan {
  const c = COUPLES[pickCoupleIndex(tema)];
  const islami = tema.kategori === 'Islami';
  const tz = c.kota === 'Bali' ? 'WITA' : 'WIB';

  return {
    temaSlug: tema.slug,
    islami,
    urutanNama: 'pria-dulu',
    mempelai: {
      pria: { panggilan: c.pria.panggilan, namaLengkap: c.pria.namaLengkap, urutan: c.pria.urutan, ayah: c.pria.ayah, ibu: c.pria.ibu, instagram: c.pria.ig },
      wanita: { panggilan: c.wanita.panggilan, namaLengkap: c.wanita.namaLengkap, urutan: c.wanita.urutan, ayah: c.wanita.ayah, ibu: c.wanita.ibu, instagram: c.wanita.ig },
    },
    tanggalUtama: `${c.tanggal}T08:00:00`,
    acara: [
      {
        nama: 'Akad Nikah',
        tanggal: c.tanggal,
        waktuMulai: '08:00',
        waktuSelesai: '10:00',
        zonaWaktu: tz,
        tempat: c.tempatAkad,
        alamat: c.alamatResepsi,
      },
      {
        nama: 'Resepsi',
        tanggal: c.tanggal,
        waktuMulai: '11:00',
        waktuSelesai: 'Selesai',
        zonaWaktu: tz,
        tempat: c.tempatResepsi,
        alamat: c.alamatResepsi,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.tempatResepsi + ' ' + c.kota)}`,
        mapsEmbed: `https://maps.google.com/maps?q=${encodeURIComponent(c.tempatResepsi + ' ' + c.kota)}&output=embed`,
      },
    ],
    salamPembuka: islami ? undefined : 'Dengan memohon rahmat dan ridha Tuhan Yang Maha Esa',
    ayat: islami ? AYAT : undefined,
    quote: islami ? undefined : QUOTE,
    ceritaCinta: c.cerita.map((m) => ({ judul: m.judul, tanggal: m.tanggal, deskripsi: m.deskripsi })),
    galeri: ['', '', '', '', '', '', '', ''], // 8 slot → placeholder monogram (mosaic 6–9)
    musik: { judul: 'Gamelan Asmara', src: '/media/library/gamelan-asmara.mp3' },
    ucapanContoh: UCAPAN_CONTOH,
    hashtag: c.hashtag,
    amplop: {
      rekening: [
        { bank: 'BCA', nomor: '1234567890', atasNama: c.pria.namaLengkap, jenis: 'bank' },
        { bank: 'GoPay', nomor: '0812' + '3456789', atasNama: c.wanita.namaLengkap, jenis: 'ewallet' },
      ],
      alamatKado: `Jl. Contoh No. 10, ${c.kota}`,
    },
    liveStreaming: {
      deskripsi:
        'Bagi Bapak/Ibu/Saudara/i yang berhalangan hadir, akad & resepsi dapat disaksikan secara langsung melalui:',
      tanggal: 'Hari-H',
      waktu: `08:00 ${tz}`,
      youtube: 'https://www.youtube.com/',
      instagram: 'https://www.instagram.com/',
    },
  };
}
