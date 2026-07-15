import { describe, it, expect } from 'vitest';
import { generatePalette } from '@/lib/studio/palette-gen';
import { contrastRatio } from '@/lib/engine/contrast';

const SEEDS = ['#6b4423', '#1b2a4a', '#5c1a2b', '#0f5136', '#7a5a66', '#b0512e', '#3d2159', '#2a6f97', '#e0a3c8', '#999999'];

describe('generatePalette — jaminan kontras WCAG AA', () => {
  for (const mode of ['light', 'dark'] as const) {
    for (const seed of SEEDS) {
      it(`${mode} ${seed}: ink lolos AA di bg & surface`, () => {
        const p = generatePalette(seed, mode);
        expect(contrastRatio(p.ink!, p.bg!)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(p.ink!, p.surface!)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
  it('menghasilkan 6 warna hex valid', () => {
    const p = generatePalette('#6b4423');
    for (const k of ['bg', 'surface', 'primary', 'accent', 'ink', 'muted'] as const) {
      expect(p[k]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
  it('seed tak valid tidak melempar', () => {
    expect(() => generatePalette('bukan-hex')).not.toThrow();
  });
});
