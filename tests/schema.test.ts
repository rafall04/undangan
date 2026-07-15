import { describe, it, expect } from 'vitest';
import { configKlienSchema } from '@/lib/clients/schema';

const valid = {
  temaSlug: 'sakinah',
  islami: true,
  accessKey: 'rahasia123',
  urutanNama: 'pria-dulu',
  tanggalUtama: '2026-10-10T08:00:00',
  mempelai: {
    pria: { panggilan: 'Budi', namaLengkap: 'Budi S', ayah: 'A', ibu: 'B' },
    wanita: { panggilan: 'Sari', namaLengkap: 'Sari W', ayah: 'C', ibu: 'D' },
  },
  acara: [{ nama: 'Akad', tanggal: '2026-10-10', tempat: 'Masjid' }],
};

describe('configKlienSchema', () => {
  it('config valid lolos', () => {
    expect(configKlienSchema.safeParse(valid).success).toBe(true);
  });
  it('accessKey terlalu pendek gagal', () => {
    expect(configKlienSchema.safeParse({ ...valid, accessKey: 'ab' }).success).toBe(false);
  });
  it('tanggal acara salah format gagal', () => {
    const bad = { ...valid, acara: [{ nama: 'Akad', tanggal: '10-10-2026', tempat: 'X' }] };
    expect(configKlienSchema.safeParse(bad).success).toBe(false);
  });
  it('acara kosong gagal', () => {
    expect(configKlienSchema.safeParse({ ...valid, acara: [] }).success).toBe(false);
  });
  it('paletteOverride wajib hex', () => {
    const bad = { ...valid, paletteOverride: { primary: 'merah' } };
    expect(configKlienSchema.safeParse(bad).success).toBe(false);
    const ok = { ...valid, paletteOverride: { primary: '#6b4423' } };
    expect(configKlienSchema.safeParse(ok).success).toBe(true);
  });
  it('zonaWaktu di luar WIB/WITA/WIT gagal', () => {
    const bad = { ...valid, acara: [{ nama: 'Akad', tanggal: '2026-10-10', tempat: 'X', zonaWaktu: 'GMT' }] };
    expect(configKlienSchema.safeParse(bad).success).toBe(false);
  });
});
