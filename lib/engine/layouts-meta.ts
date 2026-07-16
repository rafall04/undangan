import type { LayoutMeta, LayoutId } from './types';

// ============================================================================
// FASE 1d — Metadata layout (9 layout). Komponen React-nya di
// lib/invitation/layouts/ (dibangun bersama komponen bagian di Fase 2).
// ============================================================================

export const LAYOUTS_META: LayoutMeta[] = [
  {
    id: 'classic-scroll',
    nama: 'Classic Scroll',
    deskripsi:
      'Satu kolom tengah dengan kartu-kartu lembut — gaya undangan digital pada umumnya.',
  },
  {
    id: 'editorial',
    nama: 'Editorial',
    deskripsi:
      'Tipografi besar ala majalah, foto full-bleed, banyak ruang kosong.',
  },
  {
    id: 'frame',
    nama: 'Frame',
    deskripsi: 'Seluruh undangan berada di dalam bingkai ornamen tema.',
  },
  {
    id: 'polaroid',
    nama: 'Polaroid',
    deskripsi:
      'Galeri & mempelai bergaya foto polaroid/scrapbook dengan rotasi halus.',
  },
  {
    id: 'royal',
    nama: 'Royal',
    deskripsi:
      'Formal simetris, monogram besar, pembuka ala kartu cetak klasik.',
  },
  {
    id: 'minimalis',
    nama: 'Minimalis',
    deskripsi:
      'Sangat bersih — huruf kapital tipis ber-tracking, tanpa kartu, ruang lega.',
  },
  {
    id: 'timeless',
    nama: 'Timeless',
    deskripsi:
      'Kartu cetak klasik dengan bingkai garis ganda; nama serif besar, tanpa pola latar.',
  },
  {
    id: 'split',
    nama: 'Split',
    deskripsi:
      'Cover terbelah dua (foto + blok warna); bagian isi berkartu dengan aksen garis di tepi.',
  },
  {
    id: 'stamp',
    nama: 'Postcard',
    deskripsi:
      'Gaya kartu pos/perangko — bingkai putus-putus, monogram berperangko, hangat & vintage.',
  },
  { id: 'magazine', nama: 'Magazine', deskripsi: 'Tipografi besar asimetris ala sampul majalah; nama menimpa foto.' },
  { id: 'arch', nama: 'Arch', deskripsi: 'Bingkai foto melengkung (arch) di cover & mempelai — lembut & elegan.' },
  { id: 'ticket', nama: 'Ticket', deskripsi: 'Gaya tiket acara: tepi berperforasi, detail rapi, modern.' },
  { id: 'band', nama: 'Color Band', deskripsi: 'Tiap bagian jadi pita warna penuh berselang-seling — berani & rapi.' },
  { id: 'poster', nama: 'Poster', deskripsi: 'Nama raksasa ala poster, detail ringkas — bold & modern.' },
  { id: 'circular', nama: 'Circular', deskripsi: 'Foto & segel berbentuk lingkaran — simetris & lembut.' },
  { id: 'letter', nama: 'Letter', deskripsi: 'Gaya surat/manuskrip: pembuka formal, garis ganda, bersih.' },
  { id: 'botanical', nama: 'Botanical', deskripsi: 'Bingkai dedaunan/floral di tiap bagian — segar & romantis.' },
  { id: 'duotone', nama: 'Duotone', deskripsi: 'Blok dua warna diagonal yang tegas — modern & grafis.' },
  { id: 'scrapbook', nama: 'Scrapbook', deskripsi: 'Foto ditempel selotip washi, tulisan tangan — hangat & personal.' },
  { id: 'ornate', nama: 'Ornate', deskripsi: 'Ornamen sudut mewah di tiap kartu — klasik & megah.' },
  { id: 'gazette', nama: 'Gazette', deskripsi: 'Pita warna + garis ganda ala koran lawas — vintage editorial.' },
  { id: 'lantern', nama: 'Lantern', deskripsi: 'Lengkung & ornamen ala lentera Maroko — hangat & islami.' },
  { id: 'tropis', nama: 'Tropis', deskripsi: 'Dedaunan tropis full-bleed & foto polaroid — nuansa resort.' },
  { id: 'manuscript', nama: 'Manuscript', deskripsi: 'Surat klasik dua kolom, garis ganda — anggun & tenang.' },

  // --- Layout EKSKLUSIF per budaya ----------------------------------------
  // Dikunci ke satu budaya lewat LAYOUT_EKSKLUSIF di scripts/gen-registry.mts.
  { id: 'pendhapa', nama: 'Pendhapa', deskripsi: 'Atap joglo bertingkat menaungi salam; keluarga & restu didahulukan — Jawa.' },
  { id: 'tenun', nama: 'Tenun', deskripsi: 'Pita tenun belah ketupat, foto tersebar, nuansa tropis — Nusantara.' },
  { id: 'washi', nama: 'Washi', deskripsi: 'Salam mengalir vertikal (tategaki) dengan ruang kosong lapang — Jepang.' },
  { id: 'noren', nama: 'Noren', deskripsi: 'Tategaki berpita, galeri mengalir tinggi-rendah — Jepang.' },
  { id: 'shuangxi', nama: 'Shuangxi', deskripsi: 'Bait berpasangan mengapit cap, simetris penuh — China.' },
];

export const LAYOUT_META_BY_ID: Record<LayoutId, LayoutMeta> = Object.fromEntries(
  LAYOUTS_META.map((l) => [l.id, l]),
) as Record<LayoutId, LayoutMeta>;

export function getLayoutMeta(id: LayoutId): LayoutMeta {
  const l = LAYOUT_META_BY_ID[id];
  if (!l) throw new Error(`Layout tidak ditemukan: ${id}`);
  return l;
}

export const LAYOUT_IDS: LayoutId[] = LAYOUTS_META.map((l) => l.id);
