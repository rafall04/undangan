// ============================================================================
// Format tanggal/waktu berbahasa Indonesia (tanpa dependensi eksternal).
// ============================================================================

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/** Parse "2026-09-12" atau ISO datetime menjadi Date (lokal, tanpa TZ shift). */
function parseTanggal(iso: string): Date {
  // Ambil bagian tanggal saja bila ada 'T'.
  const [datePart] = iso.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** "Sabtu, 12 September 2026" */
export function tanggalPanjang(iso: string): string {
  const dt = parseTanggal(iso);
  return `${HARI[dt.getDay()]}, ${dt.getDate()} ${BULAN[dt.getMonth()]} ${dt.getFullYear()}`;
}

/** "12 September 2026" */
export function tanggalSedang(iso: string): string {
  const dt = parseTanggal(iso);
  return `${dt.getDate()} ${BULAN[dt.getMonth()]} ${dt.getFullYear()}`;
}

/** "12.09.2026" */
export function tanggalRingkas(iso: string): string {
  const dt = parseTanggal(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(dt.getDate())}.${p(dt.getMonth() + 1)}.${dt.getFullYear()}`;
}

export function namaHari(iso: string): string {
  return HARI[parseTanggal(iso).getDay()];
}

/** Rentang waktu, mis. "08.00 – 10.00 WIB" atau "19.00 WIB s.d. Selesai". */
export function rentangWaktu(a?: string, b?: string, tz = 'WIB'): string {
  const fmt = (t?: string) => (t ? t.replace(':', '.') : '');
  if (a && b) return `${fmt(a)} – ${b.toLowerCase() === 'selesai' ? 'Selesai' : fmt(b)} ${tz}`;
  if (a) return `${fmt(a)} ${tz} s.d. Selesai`;
  return '';
}

/**
 * Buat link "Simpan ke Google Calendar".
 * Butuh tanggal (ISO) + waktu mulai/selesai (HH:MM). Zona waktu diabaikan
 * pada level UTC-offset agar tetap sederhana (dianggap waktu lokal acara).
 */
export function googleCalendarUrl(opts: {
  judul: string;
  tanggal: string;
  waktuMulai?: string;
  waktuSelesai?: string;
  lokasi?: string;
  detail?: string;
}): string {
  const [datePart] = opts.tanggal.split('T');
  const ymd = datePart.replace(/-/g, '');
  const clean = (t?: string, fb = '000000') =>
    t ? t.replace(':', '') + '00' : fb;
  const start = `${ymd}T${clean(opts.waktuMulai, '080000')}`;
  const end = `${ymd}T${clean(opts.waktuSelesai, '100000')}`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: opts.judul,
    dates: `${start}/${end}`,
    details: opts.detail ?? '',
    location: opts.lokasi ?? '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export interface SisaWaktu {
  hari: number;
  jam: number;
  menit: number;
  detik: number;
  lewat: boolean;
}

/** Selisih dari sekarang ke target (ISO datetime). */
export function hitungMundur(targetIso: string, now: number = Date.now()): SisaWaktu {
  const target = new Date(targetIso).getTime();
  let diff = Math.floor((target - now) / 1000);
  if (diff <= 0) return { hari: 0, jam: 0, menit: 0, detik: 0, lewat: true };
  const hari = Math.floor(diff / 86400);
  diff -= hari * 86400;
  const jam = Math.floor(diff / 3600);
  diff -= jam * 3600;
  const menit = Math.floor(diff / 60);
  const detik = diff - menit * 60;
  return { hari, jam, menit, detik, lewat: false };
}
