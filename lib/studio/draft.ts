import type { ConfigKlien } from '@/lib/clients/schema';
import type { DataUndangan } from '@/lib/invitation/types';

// ============================================================================
// Panel edit mandiri (studio) — model draft.
// Draft = ConfigKlien yang disunting client di browser (disimpan localStorage).
// Diekspor jadi config.json untuk diserahkan ke admin (sesuai arsitektur tanpa
// database). Foto tetap diurus terpisah (nama file), preview memakai placeholder.
// ============================================================================

export const STUDIO_KEY = 'rafayana:studio:draft';

// Draft = ConfigKlien, tapi customFonts boleh membawa dataUrl (untuk pratinjau;
// tidak ikut diekspor).
export type Draft = Omit<ConfigKlien, 'customFonts'> & {
  customFonts?: Array<{ family: string; file?: string; dataUrl?: string }>;
};

export const DEFAULT_DRAFT: Draft = {
  temaSlug: 'ivori',
  islami: false,
  accessKey: 'ubah-kode-ini',
  urutanNama: 'pria-dulu',
  hashtag: '',
  tanggalUtama: '2026-12-12T08:00:00',
  mempelai: {
    pria: { panggilan: 'Arya', namaLengkap: 'Arya Pratama', urutan: 'Putra pertama dari', ayah: 'Bapak Pria', ibu: 'Ibu Pria', instagram: '', foto: 'groom.jpg' },
    wanita: { panggilan: 'Kirana', namaLengkap: 'Kirana Dewi', urutan: 'Putri pertama dari', ayah: 'Bapak Wanita', ibu: 'Ibu Wanita', instagram: '', foto: 'bride.jpg' },
  },
  acara: [
    { nama: 'Akad Nikah', tanggal: '2026-12-12', waktuMulai: '08:00', waktuSelesai: '10:00', zonaWaktu: 'WIB', tempat: 'Masjid / Gedung', alamat: 'Alamat lengkap' },
    { nama: 'Resepsi', tanggal: '2026-12-12', waktuMulai: '11:00', waktuSelesai: 'Selesai', zonaWaktu: 'WIB', tempat: 'Gedung Resepsi', alamat: 'Alamat lengkap', mapsEmbed: 'https://maps.google.com/maps?q=Jakarta&output=embed', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Jakarta' },
  ],
  quote: { teks: 'Cinta sejati adalah perjalanan dua hati yang memilih berjalan searah.', sumber: 'Rafayana' },
  galeri: [],
  musik: { judul: 'Instrumen', src: '/media/placeholder-song.wav' },
  ucapanContoh: [{ nama: 'Sahabat', pesan: 'Selamat menempuh hidup baru!', kehadiran: 'hadir', waktu: 'Baru saja' }],
  penutup: 'Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
  amplop: { rekening: [{ bank: 'BCA', nomor: '1234567890', atasNama: 'Nama', jenis: 'bank' }] },
  templatePesan: 'Yth. Bapak/Ibu/Saudara/i {nama}\n\nTanpa mengurangi rasa hormat, kami mengundang Anda ke pernikahan kami.\n\nTautan undangan:\n{link}\n\nTerima kasih.',
  tamu: [],
};

export function loadDraft(): Draft {
  if (typeof window === 'undefined') return DEFAULT_DRAFT;
  try {
    const raw = localStorage.getItem(STUDIO_KEY);
    if (raw) return { ...DEFAULT_DRAFT, ...JSON.parse(raw) };
  } catch {
    /* abaikan */
  }
  return DEFAULT_DRAFT;
}

export function saveDraft(d: Draft): void {
  try {
    localStorage.setItem(STUDIO_KEY, JSON.stringify(d));
  } catch {
    /* abaikan */
  }
}

/** Draft → DataUndangan untuk pratinjau (foto pakai placeholder). */
export function draftToData(d: Draft): DataUndangan {
  return {
    temaSlug: d.temaSlug,
    islami: d.islami,
    urutanNama: d.urutanNama,
    mempelai: {
      pria: { ...d.mempelai.pria, foto: undefined },
      wanita: { ...d.mempelai.wanita, foto: undefined },
    },
    tanggalUtama: d.tanggalUtama,
    acara: d.acara,
    salamPembuka: d.salamPembuka,
    ayat: d.islami ? d.ayat : undefined,
    quote: !d.islami ? d.quote : undefined,
    ceritaCinta: d.ceritaCinta?.map((m) => ({ ...m, foto: undefined })),
    galeri: ['', '', '', '', '', ''],
    fotoCover: undefined,
    musik: d.musik?.src ? { judul: d.musik.judul, src: d.musik.src } : undefined,
    ucapanContoh: d.ucapanContoh,
    penutup: d.penutup,
    hashtag: d.hashtag,
    amplop: d.amplop,
    fontOverride: d.fontOverride,
    paletteOverride: d.paletteOverride,
    motifOverride: d.motifOverride,
    customFonts: d.customFonts?.map((f) => ({ family: f.family, src: f.dataUrl })),
  };
}

/** Draft → string config.json (rapi). dataUrl font custom DIBUANG dari ekspor. */
export function draftToConfigJson(d: Draft): string {
  const clean: Draft = { ...d };
  if (!clean.hashtag) delete (clean as Partial<Draft>).hashtag;
  if (clean.customFonts) {
    clean.customFonts = clean.customFonts.map((f) => ({ family: f.family, file: f.file }));
  }
  return JSON.stringify(clean, null, 2) + '\n';
}
