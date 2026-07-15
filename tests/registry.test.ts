import { describe, it, expect } from 'vitest';
import { REGISTRY } from '@/lib/engine/registry';
import { PALETTE_BY_ID, PALETTES } from '@/lib/engine/palettes';
import { FONT_BY_ID } from '@/lib/engine/fonts';
import { MOTIF_META_BY_ID } from '@/lib/engine/motifs-meta';
import { LAYOUT_META_BY_ID } from '@/lib/engine/layouts-meta';
import { SEMUA_KATEGORI } from '@/lib/engine/types';
import { contrastRatio, AA_NORMAL, AA_LARGE } from '@/lib/engine/contrast';

describe('integritas registry', () => {
  it('slug unik', () => {
    const slugs = REGISTRY.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
  it('nama tampilan unik', () => {
    const nama = REGISTRY.map((t) => t.namaTampilan);
    expect(new Set(nama).size).toBe(nama.length);
  });
  it('kombinasi (layout,palet,font,motif) unik', () => {
    const combos = REGISTRY.map((t) => `${t.layoutId}|${t.paletId}|${t.fontId}|${t.motifId}`);
    expect(new Set(combos).size).toBe(combos.length);
  });
  it('semua referensi id valid', () => {
    for (const t of REGISTRY) {
      expect(PALETTE_BY_ID[t.paletId], t.slug).toBeTruthy();
      expect(FONT_BY_ID[t.fontId], t.slug).toBeTruthy();
      expect(MOTIF_META_BY_ID[t.motifId], t.slug).toBeTruthy();
      expect(LAYOUT_META_BY_ID[t.layoutId], t.slug).toBeTruthy();
    }
  });
  it('tiap kategori ≥ 15 tema', () => {
    for (const kat of SEMUA_KATEGORI) {
      expect(REGISTRY.filter((t) => t.kategori === kat).length).toBeGreaterThanOrEqual(15);
    }
  });
});

describe('kontras palet (WCAG AA)', () => {
  for (const p of PALETTES) {
    it(`${p.id}: ink & muted lolos`, () => {
      expect(contrastRatio(p.ink, p.bg)).toBeGreaterThanOrEqual(AA_NORMAL);
      expect(contrastRatio(p.ink, p.surface)).toBeGreaterThanOrEqual(AA_NORMAL);
      expect(contrastRatio(p.muted, p.surface)).toBeGreaterThanOrEqual(AA_LARGE);
    });
  }
});
