import { describe, it, expect } from 'vitest';
import {
  normalizePhone,
  parseGuests,
  dedupeGuests,
  buildMessage,
  personalLink,
  waUrl,
  toCSV,
} from '@/lib/kirim/utils';

describe('normalizePhone', () => {
  it('08xx → 628xx', () => expect(normalizePhone('081234567890')).toBe('6281234567890'));
  it('+62 → 62', () => expect(normalizePhone('+6281234567890')).toBe('6281234567890'));
  it('62 tetap', () => expect(normalizePhone('6281234567890')).toBe('6281234567890'));
  it('8xx → 628xx', () => expect(normalizePhone('81234567890')).toBe('6281234567890'));
  it('buang spasi/strip', () => expect(normalizePhone('0812-3456-7890')).toBe('6281234567890'));
  it('kosong → kosong', () => expect(normalizePhone('')).toBe(''));
  it('terlalu pendek → kosong', () => expect(normalizePhone('0812')).toBe(''));
});

describe('parseGuests', () => {
  it('nama saja', () => {
    expect(parseGuests('Bapak Andi Wijaya')).toEqual([{ nama: 'Bapak Andi Wijaya', telepon: undefined }]);
  });
  it('nama, koma, telepon', () => {
    expect(parseGuests('Ibu Siti, 081234567890')).toEqual([{ nama: 'Ibu Siti', telepon: '6281234567890' }]);
  });
  it('nama TAB telepon', () => {
    expect(parseGuests('Rudi\t0856-111-2233')[0]).toEqual({ nama: 'Rudi', telepon: '628561112233' });
  });
  it('nama spasi telepon di akhir', () => {
    expect(parseGuests('Siti Nurbaya 081234567890')[0]).toEqual({ nama: 'Siti Nurbaya', telepon: '6281234567890' });
  });
  it('toleran spasi berlebih & baris kosong', () => {
    const r = parseGuests('  Andi  \n\n  Budi , 08123456789 \n');
    expect(r).toHaveLength(2);
    expect(r[0].nama).toBe('Andi');
    expect(r[1]).toEqual({ nama: 'Budi', telepon: '628123456789' });
  });
  it('nama dengan slash tetap utuh', () => {
    expect(parseGuests('Bapak/Ibu Hendra')[0].nama).toBe('Bapak/Ibu Hendra');
  });
});

describe('dedupeGuests', () => {
  it('buang duplikat nama (case-insensitive)', () => {
    const r = dedupeGuests([{ nama: 'Andi' }, { nama: 'andi' }, { nama: 'Budi' }]);
    expect(r).toHaveLength(2);
  });
});

describe('buildMessage & link', () => {
  it('isi {nama} & {link}', () => {
    expect(buildMessage('Hai {nama}, {link}', 'Andi', 'x')).toBe('Hai Andi, x');
  });
  it('personalLink encode karakter khusus', () => {
    expect(personalLink('https://x.id', '/u/budi-sari', 'Bapak/Ibu Hendra')).toBe(
      'https://x.id/u/budi-sari?to=Bapak%2FIbu%20Hendra',
    );
  });
  it('waUrl normalisasi nomor', () => {
    expect(waUrl('081234567890', 'hai')).toBe('https://wa.me/6281234567890?text=hai');
  });
});

describe('toCSV', () => {
  it('header + quoting aman', () => {
    const csv = toCSV([{ nama: 'A "X"', telepon: '628', link: 'u', terkirim: true }]);
    expect(csv).toContain('"Nama","Telepon","Link Undangan","Status"');
    expect(csv).toContain('"A ""X""","628","u","Terkirim"');
  });
});
