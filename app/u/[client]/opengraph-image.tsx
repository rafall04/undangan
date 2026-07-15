import { loadClient } from '@/lib/clients/load';
import { pasanganPanggilan, monogramPasangan } from '@/lib/invitation/types';
import { tanggalSedang } from '@/lib/invitation/format';
import { ogImage, OG_SIZE } from '@/lib/og/render';

export const runtime = 'nodejs';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Undangan Pernikahan — Rafayana';

export default function OG({ params }: { params: { client: string } }) {
  let bundle;
  try {
    bundle = loadClient(params.client);
  } catch {
    bundle = null;
  }
  if (!bundle) {
    return ogImage({ a: 'Rafayana', b: 'RAF', dateStr: '', overline: 'Undangan', monogram: 'R', deep: '#3a2c1e', accent: '#a9791d' });
  }
  const { data, tema } = bundle;
  const [a, b] = pasanganPanggilan(data);
  const deep = data.paletteOverride?.bg && data.paletteOverride?.primary
    ? data.paletteOverride.primary
    : tema.palet.gelap
      ? tema.palet.surface
      : tema.palet.primary;
  const accent = data.paletteOverride?.accent ?? tema.palet.accent;
  return ogImage({
    a,
    b,
    dateStr: tanggalSedang(data.tanggalUtama),
    overline: data.islami ? 'Walimatul Urs' : 'The Wedding Of',
    monogram: monogramPasangan(data).replace(/\s/g, ''),
    deep,
    accent,
  });
}
