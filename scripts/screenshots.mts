/* eslint-disable no-console */
// ============================================================================
// FASE 6 — Screenshot verifikasi via Playwright (server produksi harus jalan
// di http://localhost:3000). Menangkap: landing, katalog, beberapa tema demo
// (cover + isi), halaman klien, dan halaman kirim.
// Jalankan:  npm run start   (terminal lain)  lalu  npm run shots
// Output PNG: folder $SHOTS_DIR (default ./.shots).
// ============================================================================
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT = resolve(process.env.SHOTS_DIR ?? './.shots');
const VP = { width: 400, height: 850 };

// Tema lintas kategori & layout (termasuk palet gelap).
const THEMES = [
  'kawung-ratri', // Adat · royal · sogan
  'adiwangsa', // Adat · classic-scroll · parang-emas (gelap)
  'sekar-jagad', // Adat · frame · mega-mendung
  'noble-navy', // Elegan · editorial · black-tie (gelap)
  'serene', // Modern · editorial · ivory
  'taman-sekar', // Rustic · polaroid · sage
  'barakah', // Islami · frame · emerald
  'nostalgia', // Vintage · polaroid · champagne
];

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: VP,
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  const shot = async (name: string, opts: { full?: boolean } = {}) => {
    await page.screenshot({
      path: resolve(OUT, `${name}.png`),
      fullPage: opts.full ?? false,
      animations: 'disabled',
    });
    console.log('  ✓', name);
  };

  // --- Landing & katalog ---
  console.log('Landing & katalog…');
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(400);
  await shot('01-landing', { full: true });

  await page.goto(`${BASE}/tema`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(400);
  await shot('02-katalog', { full: true });

  // --- Tema demo: cover + isi ---
  let n = 3;
  for (const slug of THEMES) {
    console.log(`Tema ${slug}…`);
    await page.goto(`${BASE}/tema/${slug}?to=Bapak+%26+Ibu+Andi`, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(500);
    await shot(`${String(n).padStart(2, '0')}-${slug}-cover`);
    // Buka undangan → tangkap isi.
    const btn = page.getByRole('button', { name: /Buka Undangan/i });
    if (await btn.count()) {
      await btn.first().click().catch(() => {});
      await page.waitForTimeout(900);
      await shot(`${String(n).padStart(2, '0')}-${slug}-isi`, { full: true });
    }
    n++;
  }

  // --- Klien & kirim (bila ada) ---
  for (const [name, url] of [
    ['90-klien-budi-sari', `${BASE}/u/budi-sari`],
    ['91-kirim', `${BASE}/u/budi-sari/kirim`],
  ] as const) {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => null);
    if (resp && resp.ok()) {
      await page.waitForTimeout(500);
      const btn = page.getByRole('button', { name: /Buka Undangan/i });
      if (await btn.count()) {
        await btn.first().click().catch(() => {});
        await page.waitForTimeout(900);
      }
      await shot(name, { full: true });
    } else {
      console.log('  – lewati', url);
    }
  }

  await browser.close();
  console.log(`\nSelesai. PNG di: ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
