/* eslint-disable no-console */
// ============================================================================
// #3 — Optimasi foto klien: konversi .jpg/.png/.jpeg → <base>.opt.webp
// (maks 1600px sisi terpanjang, quality ~80). Loader otomatis memilih varian
// .opt.webp bila ada, sehingga undangan jauh lebih ringan di HP.
//
// Jalankan:  npm run optimize -- <client>     (mis. budi-sari)
//            npm run optimize                  (semua klien)
// ============================================================================
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const CLIENTS_DIR = join(process.cwd(), 'content', 'clients');
const MAX = 1600;
const RASTER = new Set(['.jpg', '.jpeg', '.png']);

async function optimizeClient(slug: string) {
  const dir = join(CLIENTS_DIR, slug, 'photos');
  if (!existsSync(dir)) {
    console.log(`  – ${slug}: tak ada folder photos/`);
    return;
  }
  let done = 0;
  let skip = 0;
  for (const file of readdirSync(dir)) {
    const ext = extname(file).toLowerCase();
    if (!RASTER.has(ext)) continue; // lewati svg & lainnya
    if (file.includes('.opt.')) continue; // sudah hasil optimasi
    const base = basename(file, ext);
    const out = join(dir, `${base}.opt.webp`);
    // Lewati bila sudah ada & lebih baru dari sumber.
    const src = join(dir, file);
    if (existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs) {
      skip++;
      continue;
    }
    const info = await sharp(src)
      .rotate() // hormati EXIF orientation
      .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(out);
    const srcKb = Math.round(statSync(src).size / 1024);
    console.log(`  ✓ ${file} → ${base}.opt.webp  (${srcKb}KB → ${Math.round(info.size / 1024)}KB, ${info.width}×${info.height})`);
    done++;
  }
  console.log(`  ${slug}: ${done} dioptimasi, ${skip} dilewati.`);
}

async function main() {
  const arg = process.argv[2];
  const slugs = arg
    ? [arg]
    : existsSync(CLIENTS_DIR)
      ? readdirSync(CLIENTS_DIR).filter((n) => statSync(join(CLIENTS_DIR, n)).isDirectory())
      : [];
  if (slugs.length === 0) {
    console.log('Tak ada klien. Pemakaian: npm run optimize -- <client>');
    return;
  }
  for (const s of slugs) {
    console.log(`Optimasi ${s}…`);
    await optimizeClient(s);
  }
  console.log('Selesai.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
