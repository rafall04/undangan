/* eslint-disable no-console */
// ============================================================================
// FASE 1 — Sanity-check registry & palet.
// Memvalidasi:
//   1. Slug unik.
//   2. Nama tampilan unik.
//   3. Semua referensi id (palet/font/motif/layout) valid.
//   4. Kombinasi (layout,palet,font,motif) unik.
//   5. Tiap kategori punya ≥ 15 tema.
//   6. Kontras teks tiap palet lolos ambang WCAG AA (dihitung programatik).
// Jalankan: npm run sanity  (atau: npx tsx scripts/sanity-check.mts)
// Keluar dengan kode 1 bila ada pelanggaran.
// ============================================================================
import { REGISTRY } from '../lib/engine/registry';
import { PALETTES, PALETTE_BY_ID } from '../lib/engine/palettes';
import { FONT_BY_ID } from '../lib/engine/fonts';
import { MOTIF_META_BY_ID } from '../lib/engine/motifs-meta';
import { LAYOUT_META_BY_ID } from '../lib/engine/layouts-meta';
import { SEMUA_KATEGORI } from '../lib/engine/types';
import { contrastRatio, ratio2, AA_NORMAL, AA_LARGE } from '../lib/engine/contrast';

const errors: string[] = [];
const warnings: string[] = [];

// --- 1 & 2: keunikan slug & nama -------------------------------------------
const seenSlug = new Map<string, number>();
const seenNama = new Map<string, number>();
for (const t of REGISTRY) {
  seenSlug.set(t.slug, (seenSlug.get(t.slug) ?? 0) + 1);
  seenNama.set(t.namaTampilan, (seenNama.get(t.namaTampilan) ?? 0) + 1);
}
for (const [slug, n] of seenSlug) if (n > 1) errors.push(`Slug ganda (${n}×): ${slug}`);
for (const [nama, n] of seenNama) if (n > 1) errors.push(`Nama ganda (${n}×): ${nama}`);

// --- 3: referensi valid -----------------------------------------------------
for (const t of REGISTRY) {
  if (!PALETTE_BY_ID[t.paletId]) errors.push(`${t.slug}: paletId tak valid "${t.paletId}"`);
  if (!FONT_BY_ID[t.fontId]) errors.push(`${t.slug}: fontId tak valid "${t.fontId}"`);
  if (!MOTIF_META_BY_ID[t.motifId]) errors.push(`${t.slug}: motifId tak valid "${t.motifId}"`);
  if (!LAYOUT_META_BY_ID[t.layoutId]) errors.push(`${t.slug}: layoutId tak valid "${t.layoutId}"`);
}

// --- 4: kombinasi unik ------------------------------------------------------
const seenCombo = new Map<string, string[]>();
for (const t of REGISTRY) {
  const key = `${t.layoutId}|${t.paletId}|${t.fontId}|${t.motifId}`;
  const arr = seenCombo.get(key) ?? [];
  arr.push(t.slug);
  seenCombo.set(key, arr);
}
for (const [key, slugs] of seenCombo)
  if (slugs.length > 1) errors.push(`Kombinasi identik (${key}): ${slugs.join(', ')}`);

// --- 5: minimal 15 per kategori --------------------------------------------
const perKategori = new Map<string, number>();
for (const t of REGISTRY) perKategori.set(t.kategori, (perKategori.get(t.kategori) ?? 0) + 1);
for (const kat of SEMUA_KATEGORI) {
  const n = perKategori.get(kat) ?? 0;
  if (n < 15) errors.push(`Kategori "${kat}" hanya ${n} tema (min 15)`);
}
// Kategori tak dikenal?
for (const kat of perKategori.keys())
  if (!SEMUA_KATEGORI.includes(kat as never)) errors.push(`Kategori tak dikenal: ${kat}`);

// --- 6: kontras palet -------------------------------------------------------
let paletFail = 0;
for (const p of PALETTES) {
  const checks: Array<[string, string, string, number]> = [
    ['ink/bg', p.ink, p.bg, AA_NORMAL],
    ['ink/surface', p.ink, p.surface, AA_NORMAL],
    ['muted/bg', p.muted, p.bg, AA_LARGE],
    ['muted/surface', p.muted, p.surface, AA_LARGE],
    ['primary/surface', p.primary, p.surface, AA_LARGE],
  ];
  for (const [name, a, b, min] of checks) {
    const r = contrastRatio(a, b);
    if (r < min) {
      paletFail++;
      errors.push(`Palet ${p.id}: ${name} = ${ratio2(r)} < ${min} (WCAG AA)`);
    }
  }
}

// --- Ringkasan --------------------------------------------------------------
console.log('── Sanity-check Rafayana ─────────────────────────────');
console.log(`Total tema      : ${REGISTRY.length}`);
console.log(`Total palet     : ${PALETTES.length}`);
console.log(`Slug unik       : ${seenSlug.size}`);
console.log(`Kombinasi unik  : ${seenCombo.size} / ${REGISTRY.length}`);
console.log('Per kategori    :');
for (const kat of SEMUA_KATEGORI) console.log(`   • ${kat.padEnd(22)} ${perKategori.get(kat) ?? 0}`);
console.log(`Cek kontras     : ${PALETTES.length * 5 - paletFail}/${PALETTES.length * 5} lolos`);

if (warnings.length) {
  console.log('\nPeringatan:');
  for (const w of warnings) console.log('  ! ' + w);
}
if (errors.length) {
  console.error(`\n✗ GAGAL — ${errors.length} masalah:`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log('\n✓ SEMUA LOLOS');
