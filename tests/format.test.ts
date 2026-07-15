import { describe, it, expect } from 'vitest';
import { contrastRatio, hexToRgb } from '@/lib/engine/contrast';
import { tanggalPanjang, rentangWaktu, googleCalendarUrl, hitungMundur } from '@/lib/invitation/format';

describe('contrast utils', () => {
  it('hexToRgb', () => expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 }));
  it('hex pendek', () => expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 }));
  it('kontras hitam-putih = 21', () => expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0));
  it('hex tak valid melempar', () => expect(() => hexToRgb('#zzz')).toThrow());
});

describe('format tanggal & waktu', () => {
  it('tanggalPanjang berbahasa Indonesia', () => {
    expect(tanggalPanjang('2026-09-12')).toBe('Sabtu, 12 September 2026');
  });
  it('rentangWaktu', () => {
    expect(rentangWaktu('08:00', '10:00', 'WIB')).toBe('08.00 – 10.00 WIB');
    expect(rentangWaktu('19:00', 'Selesai', 'WITA')).toBe('19.00 – Selesai WITA');
    expect(rentangWaktu('08:00', undefined, 'WIB')).toBe('08.00 WIB s.d. Selesai');
  });
  it('googleCalendarUrl memuat tanggal & judul', () => {
    const u = googleCalendarUrl({ judul: 'Akad Nikah', tanggal: '2026-09-12', waktuMulai: '08:00', waktuSelesai: '10:00' });
    expect(u).toContain('calendar.google.com');
    expect(u).toContain('20260912T080000');
    expect(u).toContain('20260912T100000');
    // URLSearchParams meng-encode spasi sebagai '+'
    expect(u).toContain('text=Akad+Nikah');
    expect(new URL(u).searchParams.get('text')).toBe('Akad Nikah');
  });
});

describe('hitungMundur', () => {
  it('hitung selisih hari/jam/menit', () => {
    const now = new Date('2026-09-10T08:00:00').getTime();
    const s = hitungMundur('2026-09-12T10:30:00', now);
    expect(s.lewat).toBe(false);
    expect(s.hari).toBe(2);
    expect(s.jam).toBe(2);
    expect(s.menit).toBe(30);
  });
  it('target lewat → lewat true', () => {
    const now = new Date('2026-09-13T00:00:00').getTime();
    expect(hitungMundur('2026-09-12T10:00:00', now).lewat).toBe(true);
  });
});
