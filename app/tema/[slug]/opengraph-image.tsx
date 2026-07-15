import { getTemaBySlug } from '@/lib/engine';
import { buildDemoData } from '@/lib/demo/couples';
import { pasanganPanggilan, monogramPasangan } from '@/lib/invitation/types';
import { tanggalSedang } from '@/lib/invitation/format';
import { ogImage, OG_SIZE } from '@/lib/og/render';

export const runtime = 'nodejs';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Undangan Pernikahan — Rafayana';

export default function OG({ params }: { params: { slug: string } }) {
  const tema = getTemaBySlug(params.slug);
  if (!tema) {
    return ogImage({ a: 'Rafayana', b: 'RAF', dateStr: '', overline: 'Undangan', monogram: 'R', deep: '#3a2c1e', accent: '#a9791d' });
  }
  const data = buildDemoData(tema);
  const [a, b] = pasanganPanggilan(data);
  const deep = tema.palet.gelap ? tema.palet.surface : tema.palet.primary;
  return ogImage({
    a,
    b,
    dateStr: tanggalSedang(data.tanggalUtama),
    overline: data.islami ? 'Walimatul Urs' : 'The Wedding Of',
    monogram: monogramPasangan(data).replace(/\s/g, ''),
    deep,
    accent: tema.palet.accent,
  });
}
