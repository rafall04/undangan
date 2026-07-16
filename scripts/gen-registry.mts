/* eslint-disable no-console */
// ============================================================================
// Generator registry tema. Menghasilkan lib/engine/registry.ts sebagai array
// literal eksplisit yang BISA diedit manual satu per satu.
// Jalankan: npx tsx scripts/gen-registry.mts
//
// Prinsip kurasi:
//  - Tiap kategori punya kolam (pool) palet/font/motif/layout yang SALING COCOK,
//    sehingga kombinasi jelek (mis. kawung + dusty blue) mustahil terbentuk.
//  - Kombinasi (layout,palet,font,motif) unik secara global.
//  - Nama & slug unik. Tiap kategori ≥ 20 tema (total 120).
// ============================================================================
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { PALETTE_BY_ID } from '../lib/engine/palettes';
import { FONT_BY_ID } from '../lib/engine/fonts';
import { MOTIF_META_BY_ID } from '../lib/engine/motifs-meta';
import { LAYOUT_META_BY_ID } from '../lib/engine/layouts-meta';
import type { KategoriTema, LayoutId, Budaya } from '../lib/engine/types';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface CategoryPool {
  kategori: KategoriTema;
  /**
   * Bila diisi, SEMUA motif pool ini wajib berbudaya sama — dijaga generator.
   * Ini yang mencegah terulangnya "nama Minang tapi motif batik Jawa".
   */
  budaya?: Budaya;
  palettes: string[];
  fonts: string[];
  motifs: string[];
  layouts: LayoutId[];
  names: string[];
  taglines: string[];
}

/**
 * Layout yang DIKUNCI untuk satu budaya. Pool berbudaya lain tak boleh
 * memakainya — dijaga oleh guard di bawah.
 *
 * Kenapa ada: dulu pool Jawa dan pool China memakai delapan layout yang sama
 * persis (royal/frame/ornate/circular/timeless/letter/band/classic-scroll),
 * jadi "Kawung Ratri" (Jawa) dan "Merah Kencana" (China) benar-benar tema yang
 * sama — hanya beda palet, font, dan motif. Sampulnya beda karena Cover punya
 * 19 varian; begitu dibuka, keduanya identik.
 *
 * Layout yang TIDAK terdaftar di sini bebas dipakai pool mana pun. Itu disengaja:
 * pool bergaya (Elegan/Modern/Rustic/Islami/Vintage) tak mengklaim budaya
 * tertentu, jadi berbagi layout di antara mereka memang wajar.
 */
const LAYOUT_EKSKLUSIF: Partial<Record<Budaya, LayoutId[]>> = {
  jawa: ['pendhapa', 'ornate', 'arch', 'band', 'circular'],
  jepang: ['washi', 'noren', 'minimalis', 'duotone', 'split'],
  china: ['shuangxi', 'lantern', 'frame', 'letter'],
  nusantara: ['tenun', 'tropis', 'botanical'],
};

/** Peta balik: layout -> budaya pemiliknya. */
const PEMILIK_LAYOUT = new Map<LayoutId, Budaya>();
(Object.keys(LAYOUT_EKSKLUSIF) as Budaya[]).forEach((b) => {
  (LAYOUT_EKSKLUSIF[b] ?? []).forEach((l) => {
    const sudah = PEMILIK_LAYOUT.get(l);
    if (sudah) {
      throw new Error(
        `Layout "${l}" diklaim eksklusif oleh dua budaya: "${sudah}" dan "${b}".`,
      );
    }
    PEMILIK_LAYOUT.set(l, b);
  });
});

const POOLS: CategoryPool[] = [
  {
    kategori: 'Adat & Tradisional',
    budaya: 'jawa', // semua motif pool ini memang batik/wayang Jawa
    palettes: [
      'sogan-keraton',
      'parang-emas',
      'mega-mendung',
      'lurik-lawas',
      'emerald-songket',
      'maroon-minang',
    ],
    fonts: ['royal-cinzel', 'abadi-garamond', 'sastra-lora', 'editorial-marcellus', 'klasik-anggun'],
    motifs: ['batik-kawung', 'batik-parang', 'mega-mendung', 'wayang-gunungan'],
    layouts: ['pendhapa', 'ornate', 'arch', 'band', 'circular'],
    names: [
      'Kawung Ratri', 'Adiwangsa', 'Sekar Jagad', 'Wastra Kencana', 'Purnama Keraton',
      // 'Songket Sriwijaya' & 'Minang Saiyo' DIHAPUS: keduanya memakai motif
      // batik Jawa — menamainya Palembang/Minang itu keliru. Nama Minang &
      // Songket akan dipakai lagi setelah motif aslinya benar-benar dibuat.
      'Parang Seling', 'Mendung Kirana', 'Gunungan Emas', 'Sekar Kedhaton', 'Tirta Wening',
      'Lurik Senja', 'Sogan Wangi', 'Nawasena Jawa', 'Adiluhung', 'Puspita Nagari',
      'Larasati Ayu', 'Hastungkara', 'Kusuma Bangsa', 'Cakrawala Rani', 'Wilujeng Rawuh',
      'Truntum Sari', 'Sidomukti', 'Sidoluhur', 'Wahyu Tumurun', 'Semen Rama',
      'Ratu Kencana', 'Pandhawa', 'Arjuna Wiwaha', 'Panembrama', 'Dewandaru',
      'Widoro Kandang', 'Tirta Kamandanu', 'Sekar Arum', 'Roro Jonggrang', 'Manggala Yudha',
      'Gadhing Mataram', 'Sinom Parijotho', 'Ronggo Warsito', 'Kartika Jaya', 'Sabda Palon',
      'Puspa Kriya', 'Wangsa Jaya',
    ],
    taglines: [
      'Dua keluarga, satu kehormatan.',
      'Menyatukan tekad dalam adat leluhur.',
      'Restu yang mengalir dari generasi ke generasi.',
      'Perjalanan cinta yang dijaga tradisi.',
      'Sekar mekar, janji pun terucap.',
      'Di bawah restu para leluhur.',
      'Warisan rasa, ikatan selamanya.',
      'Merangkai janji dalam balutan budaya.',
    ],
  },
  {
    kategori: 'Elegan & Mewah',
    palettes: [
      'navy-gold',
      'burgundy-wine',
      'emerald-luxe',
      'black-tie',
      'royal-purple',
      'champagne-blush',
      'parang-emas',
    ],
    fonts: ['royal-cinzel', 'klasik-anggun', 'editorial-marcellus', 'abadi-garamond', 'romansa'],
    motifs: ['art-deco', 'floral-line', 'moroccan-tile', 'geometric-dots'],
    layouts: ['royal', 'timeless', 'magazine', 'classic-scroll', 'gazette', 'poster'],
    names: [
      'Menara Gading', 'Svarga', 'Aurora Emas', 'Noble Navy', 'Anggun Burgundy',
      'Zamrud Raya', 'Midnight Champagne', 'Ungu Kirana', 'Beludru Anggur', 'Deco Lumière',
      'Grand Ballroom', 'Regal Rosé', 'Golden Reverie', 'Kencana Malam', 'Permata Biru',
      'Mahkota Emas', 'Velvet Noir', 'Elysian', 'Opulen', 'Lentera Emas',
      'Kristal Malam', 'Sutra Emas', 'Cahaya Kirana', 'Balairung', 'Astana Kencana',
      'Nirmala', 'Puri Agung', 'Kemilau Senja', 'Ratna Mutu', 'Anggana',
      'Adiratna', 'Wibawa', 'Prameswari', 'Kencana Wungu', 'Gemintang',
      'Selaras Emas', 'Maharani', 'Cahaya Purnama', 'Bianglala', 'Kalpataru',
      'Damar Kencana', 'Purnama Wibawa',
    ],
    taglines: [
      'Kemewahan yang mengabadikan cinta.',
      'Setiap detail berkilau untuk Anda.',
      'Malam agung dua insan.',
      'Anggun, abadi, tak terlupakan.',
      'Cinta yang layak dirayakan megah.',
      'Berkilau dalam keanggunan.',
      'Kisah yang ditulis dengan emas.',
      'Elegansi di setiap langkah.',
    ],
  },
  {
    kategori: 'Modern & Minimalis',
    palettes: [
      'ivory-minimal',
      'dusty-blue',
      'mauve-taupe',
      'navy-gold',
      'black-tie',
      'sage-garden',
    ],
    fonts: ['modern-josefin', 'serene-tenor', 'romansa', 'klasik-anggun'],
    motifs: ['geometric-dots', 'wave-line', 'art-deco', 'floral-line'],
    layouts: ['poster', 'editorial', 'magazine', 'timeless', 'ticket', 'classic-scroll'],
    names: [
      'Serene', 'Ruang Putih', 'Garis Waktu', 'Biru Kabut', 'Taupe Lembut',
      'Monokrom', 'Simfoni Sunyi', 'Nordika', 'Metropolis', 'Lembayung Muda',
      'Sahaja', 'Kanvas Polos', 'Modula', 'Senyap', 'Lini Bersih',
      'Kabut Pagi', 'Ivori', 'Sudut Tenang', 'Aksara Muda', 'Selaras',
      'Lugas', 'Bening', 'Titik Temu', 'Ruang Sunyi', 'Bidang',
      'Cakra Modern', 'Simetri', 'Jeda', 'Nuansa', 'Skala',
      'Hening Putih', 'Garis Tepi', 'Laras Muda', 'Tenar', 'Pias',
      'Klasik Bersih', 'Sisi Terang', 'Ranah', 'Kutub', 'Lembar Baru',
      'Pola Dasar', 'Ambang',
    ],
    taglines: [
      'Sederhana, tulus, bermakna.',
      'Cinta tak perlu banyak kata.',
      'Ruang untuk kisah kalian.',
      'Bersih, hangat, dan jujur.',
      'Modern tanpa kehilangan rasa.',
      'Sedikit yang berbicara banyak.',
      'Kisah kalian, tanpa hiasan berlebih.',
      'Tenang seperti pagi.',
    ],
  },
  {
    // Motif tropical-leaves DIPINDAH ke pool Nusantara di bawah. Sebabnya: pool
    // ini tak berbudaya, sehingga tema nusantara di sini akan berbagi layout
    // dengan tema universal — persis pola bug yang sedang kita berantas.
    kategori: 'Rustic & Garden',
    palettes: [
      'sage-garden',
      'terracotta-sunset',
      'olive-rustic',
      'champagne-blush',
      'mauve-taupe',
    ],
    fonts: ['sastra-lora', 'editorial-marcellus', 'modern-josefin', 'romansa'],
    motifs: ['floral-line', 'wave-line', 'geometric-dots'],
    layouts: ['polaroid', 'stamp', 'scrapbook', 'classic-scroll', 'editorial'],
    names: [
      'Taman Sekar', 'Terakota Senja', 'Zaitun Desa', 'Kebun Mawar',
      'Panen Raya', 'Rustika', 'Bunga Rumput', 'Senja Kebun',
      'Ladang Bunga', 'Embun Pagi', 'Rimbun',
      'Serai & Sekar', 'Tanah Liat', 'Pekarangan', 'Mekar Desa',
      'Kirana Taman', 'Bunga Matahari',
      'Kabut Kebun', 'Rumput Ilalang', 'Serumpun',
      'Taman Anggrek', 'Melati Desa', 'Kemuning', 'Beranda Hijau',
      'Semak Bunga', 'Pagi Berembun', 'Lembah Sekar', 'Akar & Ranting',
    ],
    taglines: [
      'Cinta yang tumbuh seperti taman.',
      'Hangat seperti tanah dan dedaunan.',
      'Merayakan cinta di pelukan alam.',
      'Sederhana, mekar, dan bersahaja.',
      'Di antara bunga dan senja.',
      'Akar yang kuat, cinta yang tumbuh.',
      'Alam menjadi saksi janji kami.',
      'Bersemi bersama, selamanya.',
    ],
  },
  {
    kategori: 'Islami',
    palettes: [
      'emerald-luxe',
      'emerald-songket',
      'navy-gold',
      'sogan-keraton',
      'royal-purple',
      'ivory-minimal',
      'dusty-blue',
    ],
    fonts: ['royal-cinzel', 'abadi-garamond', 'editorial-marcellus', 'klasik-anggun', 'serene-tenor'],
    motifs: ['moroccan-tile', 'geometric-dots', 'art-deco', 'floral-line'],
    layouts: ['manuscript', 'timeless', 'royal', 'classic-scroll', 'gazette'],
    names: [
      'Barakah', 'Sakinah', 'Mawaddah', 'Warahmah', 'Samara',
      'Andalusia', 'Nur Cahaya', 'Baiturrahman', 'Mitsaqan Ghaliza', 'Firdaus',
      'Zaitun Suci', 'Marhaban', 'Qalbun Salim', 'Cordoba', 'Nikah Berkah',
      'Auliya', 'Raudhah', 'Sabiqah', 'Kirana Nur', 'Taaruf',
      'Nurul Iman', 'Ar Rahman', 'Sabrina Nur', 'Hidayah', 'Istiqamah',
      'Mahabbah', 'Ridha Ilahi', 'Baitul Izzah', 'Nur Iman', 'Khaira Ummah',
      'Tsabita', 'Sirah', 'Nur Hikmah', 'Jannati', 'Rahmatan',
      'Musyahadah', 'Nur Zahra', 'Baraka Allah', 'Fii Amanillah', 'Munawwarah',
      'Qonita', 'Sabhira',
    ],
    taglines: [
      'Menyempurnakan separuh agama.',
      'Dalam ridha-Nya kami bersatu.',
      'Sakinah, mawaddah, wa rahmah.',
      'Menjalin ikatan suci karena-Nya.',
      'Barakallahu lakuma wa baraka alaikuma.',
      'Janji suci di bawah restu Ilahi.',
      'Menggenapkan iman dalam mahligai.',
      'Cinta yang berlabuh pada ridha-Nya.',
    ],
  },
  {
    kategori: 'Vintage & Retro',
    palettes: [
      'champagne-blush',
      'mauve-taupe',
      'burgundy-wine',
      'terracotta-sunset',
      'lurik-lawas',
      'olive-rustic',
      'sogan-keraton',
    ],
    fonts: ['editorial-marcellus', 'klasik-anggun', 'romansa', 'sastra-lora', 'abadi-garamond'],
    motifs: ['art-deco', 'floral-line', 'moroccan-tile', 'wave-line'],
    layouts: ['stamp', 'polaroid', 'gazette', 'ticket', 'manuscript', 'magazine'],
    names: [
      'Nostalgia', 'Sepia Kenangan', 'Deco Vintage', 'Beludru Lawas', 'Kembang Lawas',
      'Antique Rose', 'Retropolis', 'Masa Silam', 'Sekar Lawas', 'Gramofon',
      'Kelasik', 'Sepuh Emas', 'Album Lama', 'Pita Seluloid', 'Zaman Baheula',
      'Renjana Lawas', 'Vinyl Senja', 'Potret Lawas', 'Kaca Patri', 'Tempo Doeloe',
      'Klasik Sepia', 'Radio Tua', 'Surat Lawas', 'Bianglala Lawas', 'Kenangan Emas',
      'Fotografi Lawas', 'Sepeda Onthel', 'Loteng Kenangan', 'Piringan Hitam', 'Amplop Lawas',
      'Nada Lawas', 'Mesin Tik', 'Poster Lawas', 'Beranda Tua', 'Kartu Pos',
      'Warna Pudar', 'Lampu Minyak', 'Jendela Lawas', 'Kebaya Lawas', 'Sketsa Lawas',
      'Sudut Retro', 'Album Sepia',
    ],
    taglines: [
      'Kenangan yang tak lekang waktu.',
      'Cinta klasik yang abadi.',
      'Merajut janji bergaya masa silam.',
      'Nostalgia dalam setiap detail.',
      'Manis seperti kenangan lama.',
      'Cinta bergaya tempo doeloe.',
      'Sehangat album kenangan.',
      'Klasik, abadi, penuh rasa.',
    ],
  },
  {
    kategori: 'Modern & Minimalis',
    budaya: 'jepang', // seigaiha/asanoha/sakura/kumiko — semuanya motif Jepang
    palettes: ['indigo-washi', 'sakura-sumi', 'ivory-minimal'],
    fonts: ['serene-tenor', 'modern-josefin', 'klasik-anggun', 'editorial-marcellus'],
    motifs: ['seigaiha', 'asanoha', 'sakura', 'kumiko'],
    layouts: ['washi', 'noren', 'minimalis', 'duotone', 'split'],
    names: [
      'Sakura Fubuki', 'Aoi Nami', 'Kumiko Kayu', 'Asanoha Putih', 'Hanami',
      'Yuki Sakura', 'Ai Indigo', 'Ombak Seigaiha', 'Sumi Bunga', 'Kiyomi',
      'Haruka', 'Shizuka', 'Momiji Senja', 'Tsuki Malam', 'Sora Biru',
      'Nami Perak', 'Hoshi Kirana', 'Kaze Sakura', 'Miyabi', 'Wabi Sabi',
      'Zen Putih', 'Komorebi', 'Sakura Senja', 'Indigo Tenang',
    ],
    taglines: [
      'Tenang seperti taman batu.',
      'Sederhana, dalam, bermakna.',
      'Seindah sakura yang gugur pelan.',
      'Ketenangan yang menyatukan.',
      'Keheningan yang berbicara.',
      'Ombak yang tak pernah berhenti berjanji.',
      'Cinta dalam kesederhanaan.',
      'Sekali bertemu, selamanya berarti.',
    ],
  },
  {
    kategori: 'Rustic & Garden',
    budaya: 'nusantara', // tropical-leaves — dedaunan tropis Nusantara
    palettes: ['emerald-songket', 'sage-garden', 'terracotta-sunset', 'olive-rustic', 'maroon-minang'],
    fonts: ['sastra-lora', 'editorial-marcellus', 'romansa', 'klasik-anggun'],
    motifs: ['tropical-leaves'],
    layouts: ['tenun', 'tropis', 'botanical'],
    // Nama sengaja bertema alam & bahari Nusantara secara UMUM. Jangan pakai
    // nama yang mengklaim suku tertentu (Minang, Palembang, Bali, …) selama
    // motifnya masih dedaunan tropis generik — itu kekeliruan yang sama dengan
    // "Minang Saiyo" memakai batik Jawa. Pakai lagi kalau motif aslinya sudah ada.
    names: [
      'Rimba Tropis', 'Nusa Kirana', 'Sabana Senja', 'Pucuk Daun', 'Palem Senja',
      'Teratai Kolam', 'Sawah Senja', 'Padi Menguning', 'Daun Talas', 'Anggrek Hutan',
      'Bougenville', 'Dedaunan', 'Hutan Kecil', 'Lereng Hijau', 'Kembang Sepatu',
      'Khatulistiwa', 'Pesisir Senja', 'Rimbun Nusa',
    ],
    taglines: [
      'Cinta yang tumbuh di tanah khatulistiwa.',
      'Sehijau rimba, sehangat mentari.',
      'Merayakan cinta di pelukan Nusantara.',
      'Dari pesisir sampai pegunungan.',
      'Subur, rimbun, dan bersahaja.',
      'Alam Nusantara menjadi saksi.',
      'Tumbuh bersama, seperti akar dan tanah.',
      'Di antara dedaunan dan cahaya senja.',
    ],
  },
  {
    kategori: 'Elegan & Mewah',
    budaya: 'china', // awan-ruyi/kisi-jendela/peoni — semuanya motif China
    palettes: ['merah-kencana', 'giok-kencana', 'black-tie'],
    fonts: ['royal-cinzel', 'editorial-marcellus', 'klasik-anggun', 'abadi-garamond'],
    motifs: ['awan-ruyi', 'kisi-jendela', 'peoni'],
    layouts: ['shuangxi', 'lantern', 'frame', 'letter'],
    names: [
      'Merah Kencana', 'Giok Kirana', 'Awan Ruyi', 'Peoni Emas', 'Naga Kencana',
      'Lentera Merah', 'Giok Harmoni', 'Shuang Xi', 'Bunga Persik', 'Kirana Timur',
      'Phoenix Kencana', 'Teratai Merah', 'Sutra Merah', 'Kisi Kencana', 'Mutiara Timur',
      'Anggrek Giok', 'Bambu Emas', 'Awan Kirana', 'Peoni Senja', 'Merah Delima',
      'Kencana Timur', 'Lentera Giok', 'Tirai Merah', 'Purnama Timur',
    ],
    taglines: [
      'Kebahagiaan berlipat dua.',
      'Merah yang membawa restu.',
      'Seindah peoni yang mekar penuh.',
      'Awan membawa harapan baik.',
      'Kemakmuran dan cinta bersatu.',
      'Dua keluarga, satu kehormatan.',
      'Keberuntungan mengiringi janji.',
      'Anggun dalam warna keberkahan.',
    ],
  },
];

// Bila nama tema menyebut warna tertentu, utamakan palet yang cocok (jika ada
// di pool kategori) agar "Anggun Burgundy" tidak berpalet ungu, dsb.
const COLOR_MAP: Array<[RegExp, string[]]> = [
  [/navy/i, ['navy-gold']],
  [/burgundy|anggur|wine/i, ['burgundy-wine']],
  [/zamrud|emerald/i, ['emerald-luxe', 'emerald-songket']],
  [/ungu|purple/i, ['royal-purple']],
  [/champagne|blush|rosé|rose/i, ['champagne-blush']],
  [/noir|midnight|hitam/i, ['black-tie', 'parang-emas']],
  [/biru|blue/i, ['navy-gold', 'dusty-blue', 'mega-mendung']],
  [/sage/i, ['sage-garden']],
  [/terakota|terracotta/i, ['terracotta-sunset']],
  [/zaitun|olive/i, ['olive-rustic']],
  [/mauve|taupe/i, ['mauve-taupe']],
  [/maroon|minang/i, ['maroon-minang']],
  [/sogan/i, ['sogan-keraton']],
  [/sakura|sumi|momiji/i, ['sakura-sumi']],
  [/indigo|aoi|\bai\b/i, ['indigo-washi']],
  [/giok|jade/i, ['giok-kencana']],
  [/merah|delima/i, ['merah-kencana']],
];

function preferredPalette(name: string, pool: string[]): string | null {
  for (const [re, cands] of COLOR_MAP) {
    if (re.test(name)) {
      const hit = cands.find((c) => pool.includes(c));
      if (hit) return hit;
    }
  }
  return null;
}

// Bila nama tema menyebut motif tertentu, utamakan motif itu — supaya "Sakura
// Fubuki" benar-benar bermotif sakura (bukan gelombang), dan "Kawung Ratri"
// benar-benar berkawung. Hanya memilih dari motif milik pool, jadi nama satu
// budaya tak mungkin menarik motif budaya lain.
const MOTIF_MAP: Array<[RegExp, string[]]> = [
  // Jawa
  [/kawung/i, ['batik-kawung']],
  [/parang/i, ['batik-parang']],
  [/mendung/i, ['mega-mendung']],
  [/gunungan|wayang/i, ['wayang-gunungan']],
  // Jepang
  [/sakura|hanami|momiji/i, ['sakura']],
  [/seigaiha|nami|ombak/i, ['seigaiha']],
  [/asanoha/i, ['asanoha']],
  [/kumiko/i, ['kumiko']],
  // China
  [/ruyi|awan/i, ['awan-ruyi']],
  [/peoni/i, ['peoni']],
  [/kisi|jendela/i, ['kisi-jendela']],
];

function preferredMotif(name: string, pool: string[]): string | null {
  for (const [re, cands] of MOTIF_MAP) {
    if (re.test(name)) {
      const hit = cands.find((c) => pool.includes(c));
      if (hit) return hit;
    }
  }
  return null;
}

function slugify(s: string): string {
  const combiningMarks = new RegExp('[\\u0300-\\u036f]', 'g');
  return s
    .normalize('NFD')
    .replace(combiningMarks, '')
    .toLowerCase()
    .replace(/&/g, ' dan ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface Entry {
  slug: string;
  namaTampilan: string;
  kategori: KategoriTema;
  budaya: Budaya;
  layoutId: LayoutId;
  paletId: string;
  fontId: string;
  motifId: string;
  tagline: string;
}

const entries: Entry[] = [];
const usedCombo = new Set<string>();
const usedSlug = new Set<string>();
const problems: string[] = [];

for (const pool of POOLS) {
  // JAGA KEJUJURAN LABEL: bila pool mengklaim sebuah budaya, semua motifnya
  // wajib benar-benar berasal dari budaya itu. Inilah yang membuat kasus lama
  // ("Minang Saiyo" memakai batik parang Jawa) mustahil terulang.
  if (pool.budaya) {
    for (const m of pool.motifs) {
      const meta = MOTIF_META_BY_ID[m];
      if (meta && meta.budaya !== pool.budaya) {
        problems.push(
          `Pool ${pool.kategori} mengklaim budaya "${pool.budaya}" tapi motif "${m}" berbudaya "${meta.budaya}"`,
        );
      }
    }
  }

  // JAGA KEKHASAN BUDAYA: layout yang dikunci untuk satu budaya tak boleh bocor
  // ke pool berbudaya lain. Tanpa ini, tema Jawa & tema China kembali memakai
  // layout yang sama dan — begitu sampul dibuka — tampil identik lagi.
  for (const l of pool.layouts) {
    const pemilik = PEMILIK_LAYOUT.get(l);
    if (pemilik && pemilik !== pool.budaya) {
      problems.push(
        `Pool ${pool.kategori} (budaya "${pool.budaya ?? 'tak diklaim'}") memakai layout "${l}" ` +
          `yang eksklusif milik budaya "${pemilik}"`,
      );
    }
  }

  const n = pool.names.length;
  for (let i = 0; i < n; i++) {
    const name = pool.names[i];
    const slug = slugify(name);
    if (usedSlug.has(slug)) problems.push(`Slug ganda: ${slug}`);
    usedSlug.add(slug);

    const layoutId = pool.layouts[i % pool.layouts.length];
    const paletId =
      preferredPalette(name, pool.palettes) ?? pool.palettes[i % pool.palettes.length];
    const fontId = pool.fonts[i % pool.fonts.length];
    // Motif digeser sampai kombinasi (layout,palet,font,motif) unik global.
    // Mulai dari motif yang cocok dengan namanya bila ada.
    let motifId = preferredMotif(name, pool.motifs) ?? pool.motifs[i % pool.motifs.length];
    let guard = 0;
    while (usedCombo.has(`${layoutId}|${paletId}|${fontId}|${motifId}`)) {
      guard++;
      motifId = pool.motifs[(i + guard) % pool.motifs.length];
      if (guard > pool.motifs.length + 2) {
        problems.push(`Tak bisa unik untuk ${name}`);
        break;
      }
    }
    usedCombo.add(`${layoutId}|${paletId}|${fontId}|${motifId}`);

    // Validasi referensi id.
    if (!PALETTE_BY_ID[paletId]) problems.push(`Palet tak ada: ${paletId}`);
    if (!FONT_BY_ID[fontId]) problems.push(`Font tak ada: ${fontId}`);
    if (!MOTIF_META_BY_ID[motifId]) problems.push(`Motif tak ada: ${motifId}`);
    if (!LAYOUT_META_BY_ID[layoutId]) problems.push(`Layout tak ada: ${layoutId}`);

    entries.push({
      slug,
      namaTampilan: name,
      kategori: pool.kategori,
      // Budaya DITURUNKAN dari motif — bukan dari nama tema. Ini aturannya.
      budaya: MOTIF_META_BY_ID[motifId]?.budaya ?? 'universal',
      layoutId,
      paletId,
      fontId,
      motifId,
      tagline: pool.taglines[i % pool.taglines.length],
    });
  }
}

if (problems.length) {
  console.error('MASALAH generator:\n' + problems.join('\n'));
  process.exit(1);
}

// --- Emit file --------------------------------------------------------------
const lines: string[] = [];
lines.push('// ============================================================================');
lines.push('// FASE 1e — Registry tema (DIBUAT oleh scripts/gen-registry.mts).');
lines.push('// Ini daftar EKSPLISIT & boleh diedit manual satu per satu. Untuk membuat');
lines.push('// ulang dari pool: `npx tsx scripts/gen-registry.mts`.');
lines.push('// ============================================================================');
lines.push("import type { Tema } from './types';");
lines.push('');
lines.push('export const REGISTRY: Tema[] = [');
let currentCat = '';
for (const e of entries) {
  if (e.kategori !== currentCat) {
    currentCat = e.kategori;
    lines.push(`  // --- ${currentCat} ---`);
  }
  const obj =
    `  { slug: ${JSON.stringify(e.slug)}, namaTampilan: ${JSON.stringify(e.namaTampilan)}, ` +
    `kategori: ${JSON.stringify(e.kategori)}, budaya: ${JSON.stringify(e.budaya)}, ` +
    `layoutId: ${JSON.stringify(e.layoutId)}, ` +
    `paletId: ${JSON.stringify(e.paletId)}, fontId: ${JSON.stringify(e.fontId)}, ` +
    `motifId: ${JSON.stringify(e.motifId)}, tagline: ${JSON.stringify(e.tagline)} },`;
  lines.push(obj);
}
lines.push('];');
lines.push('');
lines.push('export const REGISTRY_BY_SLUG: Record<string, Tema> = Object.fromEntries(');
lines.push('  REGISTRY.map((t) => [t.slug, t]),');
lines.push(');');
lines.push('');

const outPath = resolve(__dirname, '../lib/engine/registry.ts');
writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log(`OK — ${entries.length} tema ditulis ke ${outPath}`);
