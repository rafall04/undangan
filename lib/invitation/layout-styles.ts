import type { LayoutId } from '@/lib/engine';

// ============================================================================
// FASE 1d/2 — Gaya layout sebagai DATA.
// Kesembilan layout dirender oleh satu komposer (InvitationBody) yang membaca
// preset ini. Menambah layout = menambah preset + cabang varian, bukan menyalin
// seluruh komposer (Prinsip Utama #1).
// ============================================================================

export type CoverVariant =
  | 'classic'
  | 'editorial'
  | 'frame'
  | 'polaroid'
  | 'royal'
  | 'minimal'
  | 'timeless'
  | 'split'
  | 'stamp'
  | 'magazine'
  | 'arch'
  | 'ticket'
  | 'band'
  | 'poster'
  | 'circular'
  | 'letter'
  | 'botanical'
  | 'duotone'
  | 'scrapbook';

export type MempelaiVariant =
  | 'card'
  | 'polaroid'
  | 'royal'
  | 'editorial'
  | 'side'
  | 'stamp'
  | 'arch'
  | 'circular'
  | 'tape';

/** Bagaimana tiap bagian dibungkus. */
export type SectionChrome =
  | 'card'
  | 'open'
  | 'dashed'
  | 'accent-left'
  | 'arch'
  | 'band'
  | 'ornate'
  | 'tape';

/** Gaya judul bagian. */
export type HeadingStyle = 'script-serif' | 'uppercase-thin' | 'double-rule' | 'ornate';

export interface LayoutStyle {
  id: LayoutId;
  containerClass: string;
  /** Bingkai ornamen mengelilingi seluruh undangan. */
  framed: boolean;
  patternOpacity: number;
  patternScale: number;
  chrome: SectionChrome;
  /** Kelas tambahan untuk kartu (chrome 'card'). */
  cardClass: string;
  headingAlign: 'center' | 'left';
  headingStyle: HeadingStyle;
  cover: CoverVariant;
  mempelai: MempelaiVariant;
  galeriPolaroid: boolean;
}

export const LAYOUT_STYLES: Record<LayoutId, LayoutStyle> = {
  'classic-scroll': {
    id: 'classic-scroll',
    containerClass: 'max-w-invite',
    framed: false,
    patternOpacity: 0.05,
    patternScale: 1,
    chrome: 'card',
    cardClass: 'rounded-3xl shadow-sm ring-1 ring-black/5',
    headingAlign: 'center',
    headingStyle: 'script-serif',
    cover: 'classic',
    mempelai: 'card',
    galeriPolaroid: false,
  },
  editorial: {
    id: 'editorial',
    containerClass: 'max-w-xl',
    framed: false,
    patternOpacity: 0.04,
    patternScale: 1.4,
    chrome: 'open',
    cardClass: '',
    headingAlign: 'left',
    headingStyle: 'script-serif',
    cover: 'editorial',
    mempelai: 'editorial',
    galeriPolaroid: false,
  },
  frame: {
    id: 'frame',
    containerClass: 'max-w-invite',
    framed: true,
    patternOpacity: 0.06,
    patternScale: 1,
    chrome: 'card',
    cardClass: 'rounded-2xl ring-1 ring-[color-mix(in_srgb,var(--accent)_35%,transparent)]',
    headingAlign: 'center',
    headingStyle: 'script-serif',
    cover: 'frame',
    mempelai: 'card',
    galeriPolaroid: false,
  },
  polaroid: {
    id: 'polaroid',
    containerClass: 'max-w-invite',
    framed: false,
    patternOpacity: 0.05,
    patternScale: 1.1,
    chrome: 'card',
    cardClass: 'rounded-xl shadow-md ring-1 ring-black/5',
    headingAlign: 'center',
    headingStyle: 'script-serif',
    cover: 'polaroid',
    mempelai: 'polaroid',
    galeriPolaroid: true,
  },
  royal: {
    id: 'royal',
    containerClass: 'max-w-[28rem]',
    framed: true,
    patternOpacity: 0.05,
    patternScale: 0.95,
    chrome: 'card',
    cardClass:
      'rounded-none ring-1 ring-[color-mix(in_srgb,var(--accent)_45%,transparent)] shadow-sm',
    headingAlign: 'center',
    headingStyle: 'script-serif',
    cover: 'royal',
    mempelai: 'royal',
    galeriPolaroid: false,
  },

  // --- Layout baru ---------------------------------------------------------
  minimalis: {
    id: 'minimalis',
    containerClass: 'max-w-[26rem]',
    framed: false,
    patternOpacity: 0.025,
    patternScale: 1.6,
    chrome: 'open',
    cardClass: '',
    headingAlign: 'center',
    headingStyle: 'uppercase-thin',
    cover: 'minimal',
    mempelai: 'side',
    galeriPolaroid: false,
  },
  timeless: {
    id: 'timeless',
    containerClass: 'max-w-invite',
    framed: false,
    patternOpacity: 0, // bersih, tanpa pola latar
    patternScale: 1,
    chrome: 'open',
    cardClass: '',
    headingAlign: 'center',
    headingStyle: 'double-rule',
    cover: 'timeless',
    mempelai: 'card',
    galeriPolaroid: false,
  },
  split: {
    id: 'split',
    containerClass: 'max-w-invite',
    framed: false,
    patternOpacity: 0.04,
    patternScale: 1.2,
    chrome: 'accent-left',
    cardClass: '',
    headingAlign: 'left',
    headingStyle: 'script-serif',
    cover: 'split',
    mempelai: 'side',
    galeriPolaroid: false,
  },
  stamp: {
    id: 'stamp',
    containerClass: 'max-w-invite',
    framed: false,
    patternOpacity: 0.05,
    patternScale: 1.1,
    chrome: 'dashed',
    cardClass: '',
    headingAlign: 'center',
    headingStyle: 'script-serif',
    cover: 'stamp',
    mempelai: 'stamp',
    galeriPolaroid: true,
  },

  // --- Gelombang kedua (15 layout) ----------------------------------------
  magazine: {
    id: 'magazine', containerClass: 'max-w-xl', framed: false, patternOpacity: 0.03, patternScale: 1.5,
    chrome: 'open', cardClass: '', headingAlign: 'left', headingStyle: 'script-serif',
    cover: 'magazine', mempelai: 'editorial', galeriPolaroid: false,
  },
  arch: {
    id: 'arch', containerClass: 'max-w-invite', framed: false, patternOpacity: 0.05, patternScale: 1,
    chrome: 'arch', cardClass: '', headingAlign: 'center', headingStyle: 'script-serif',
    cover: 'arch', mempelai: 'arch', galeriPolaroid: false,
  },
  ticket: {
    id: 'ticket', containerClass: 'max-w-invite', framed: false, patternOpacity: 0.045, patternScale: 1.1,
    chrome: 'dashed', cardClass: '', headingAlign: 'center', headingStyle: 'uppercase-thin',
    cover: 'ticket', mempelai: 'side', galeriPolaroid: true,
  },
  band: {
    id: 'band', containerClass: 'max-w-invite', framed: false, patternOpacity: 0.04, patternScale: 1.2,
    chrome: 'band', cardClass: '', headingAlign: 'center', headingStyle: 'script-serif',
    cover: 'band', mempelai: 'card', galeriPolaroid: false,
  },
  poster: {
    id: 'poster', containerClass: 'max-w-xl', framed: false, patternOpacity: 0.04, patternScale: 1.4,
    chrome: 'open', cardClass: '', headingAlign: 'left', headingStyle: 'uppercase-thin',
    cover: 'poster', mempelai: 'editorial', galeriPolaroid: false,
  },
  circular: {
    id: 'circular', containerClass: 'max-w-invite', framed: false, patternOpacity: 0.05, patternScale: 1,
    chrome: 'card', cardClass: 'rounded-3xl shadow-sm ring-1 ring-black/5', headingAlign: 'center', headingStyle: 'script-serif',
    cover: 'circular', mempelai: 'circular', galeriPolaroid: false,
  },
  letter: {
    id: 'letter', containerClass: 'max-w-invite', framed: false, patternOpacity: 0, patternScale: 1,
    chrome: 'open', cardClass: '', headingAlign: 'center', headingStyle: 'double-rule',
    cover: 'letter', mempelai: 'card', galeriPolaroid: false,
  },
  botanical: {
    id: 'botanical', containerClass: 'max-w-invite', framed: false, patternOpacity: 0.06, patternScale: 1.1,
    chrome: 'ornate', cardClass: '', headingAlign: 'center', headingStyle: 'ornate',
    cover: 'botanical', mempelai: 'card', galeriPolaroid: false,
  },
  duotone: {
    id: 'duotone', containerClass: 'max-w-invite', framed: false, patternOpacity: 0.04, patternScale: 1.3,
    chrome: 'accent-left', cardClass: '', headingAlign: 'left', headingStyle: 'uppercase-thin',
    cover: 'duotone', mempelai: 'side', galeriPolaroid: false,
  },
  scrapbook: {
    id: 'scrapbook', containerClass: 'max-w-invite', framed: false, patternOpacity: 0.05, patternScale: 1.1,
    chrome: 'tape', cardClass: '', headingAlign: 'center', headingStyle: 'script-serif',
    cover: 'scrapbook', mempelai: 'tape', galeriPolaroid: true,
  },
  ornate: {
    id: 'ornate', containerClass: 'max-w-[28rem]', framed: true, patternOpacity: 0.05, patternScale: 0.95,
    chrome: 'ornate', cardClass: '', headingAlign: 'center', headingStyle: 'ornate',
    cover: 'frame', mempelai: 'card', galeriPolaroid: false,
  },
  gazette: {
    id: 'gazette', containerClass: 'max-w-xl', framed: false, patternOpacity: 0.03, patternScale: 1.3,
    chrome: 'band', cardClass: '', headingAlign: 'center', headingStyle: 'double-rule',
    cover: 'poster', mempelai: 'card', galeriPolaroid: false,
  },
  lantern: {
    id: 'lantern', containerClass: 'max-w-invite', framed: true, patternOpacity: 0.06, patternScale: 1,
    chrome: 'ornate', cardClass: '', headingAlign: 'center', headingStyle: 'script-serif',
    cover: 'arch', mempelai: 'arch', galeriPolaroid: false,
  },
  tropis: {
    id: 'tropis', containerClass: 'max-w-invite', framed: false, patternOpacity: 0.07, patternScale: 1.1,
    chrome: 'card', cardClass: 'rounded-2xl shadow-md ring-1 ring-black/5', headingAlign: 'center', headingStyle: 'script-serif',
    cover: 'botanical', mempelai: 'polaroid', galeriPolaroid: true,
  },
  manuscript: {
    id: 'manuscript', containerClass: 'max-w-invite', framed: false, patternOpacity: 0, patternScale: 1,
    chrome: 'open', cardClass: '', headingAlign: 'center', headingStyle: 'double-rule',
    cover: 'letter', mempelai: 'side', galeriPolaroid: false,
  },
};

export function getLayoutStyle(id: LayoutId): LayoutStyle {
  return LAYOUT_STYLES[id] ?? LAYOUT_STYLES['classic-scroll'];
}
