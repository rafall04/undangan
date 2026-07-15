# Rafayana by RAF Undangan

Platform undangan pernikahan digital. **Setiap perjalanan cinta layak diabadikan.**

Dibangun dengan **Next.js 14 (App Router) + TypeScript + Tailwind CSS**. Tanpa database — data klien = file konfigurasi + folder foto.

- **250+ tema terkurasi** dari _theme engine_ kombinatorial (`layout × palet × pasangan font × motif`) — **24 layout** distinct.
- **Mobile-first** — 95% tamu membuka undangan dari HP lewat WhatsApp.
- **Alat kirim massal** — tautan personal per tamu, template pesan, QR code, pelacakan status.
- **Amplop digital** (rekening/e-wallet + kado) & **Studio** — client bisa isi data & pratinjau sendiri, lalu ekspor `config.json`.
- Domain produksi: **`undangan.raf.my.id`**

---

## Mulai cepat

```bash
npm install
npm run dev          # pengembangan (bila next dev bermasalah di mesin Anda, pakai build+start)
# atau
npm run build && npm run start   # server produksi di http://localhost:3000
```

Halaman penting:

| Rute | Keterangan |
| --- | --- |
| `/` | Landing page (hero, harga, cara pesan) |
| `/tema` | Katalog 250+ tema (filter + pencarian) |
| `/studio` | Studio: client isi data sendiri + pratinjau + ekspor `config.json` |
| `/tema/{slug}` | Demo undangan sebuah tema (mis. `/tema/kawung-ratri`) |
| `/tema/{slug}/kirim` | Demo alat kirim tamu (materi jualan) |
| `/u/{client}` | Undangan klien nyata (mis. `/u/budi-sari`) |
| `/u/{client}/kirim` | Alat kirim & manajemen tamu (butuh `accessKey`) |

Dukungan tamu personal: tambahkan `?to=Nama+Tamu`, mis. `/u/budi-sari?to=Bapak+Andi`.

---

## Perintah npm

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run start` | Menjalankan hasil build |
| `npm run lint` | ESLint |
| `npm run test` | Test otomatis (Vitest) — logika inti: parsing tamu, normalisasi WA, kontras palet, generator palet, schema, integritas registry |
| `npm run optimize -- <client>` | Optimasi foto klien → `.opt.webp` (maks 1600px). Tanpa argumen = semua klien |
| `npm run sanity` | Validasi registry tema (slug unik, referensi valid, kontras WCAG AA) |
| `npm run gen-registry` | Membuat ulang `lib/engine/registry.ts` dari pool kurasi |
| `npm run new-client -- <slug>` | Membuat klien baru |
| `npm run shots` | Screenshot verifikasi (butuh server berjalan) |

---

## Menambah klien baru

```bash
npm run new-client -- andi-nia
```

Perintah ini membuat:

```
content/clients/andi-nia/
  config.json        ← data undangan (edit ini)
  photos/            ← taruh foto di sini
    README.txt
```

Langkah:

1. **Edit `config.json`** — isi data mempelai, acara, tanggal, dsb. Ganti `temaSlug` sesuai katalog (lihat `/tema`).
2. **Ganti `accessKey`** — kode akses untuk halaman `/u/andi-nia/kirim`.
3. **Taruh foto** di `content/clients/andi-nia/photos/` dengan nama yang cocok di `config.json`.
4. Pratinjau di `/u/andi-nia`.

Foto yang **tidak ada otomatis memakai placeholder monogram** bergradasi warna tema — jadi undangan tetap cantik walau foto belum lengkap.

### Skema `config.json`

Divalidasi runtime dengan **zod** (`lib/clients/schema.ts`). Ringkasnya:

```jsonc
{
  "temaSlug": "sakinah",          // wajib — slug tema dari katalog
  "islami": true,                  // salam Islami + basmalah + ayat
  "accessKey": "rahasia-123",      // wajib — untuk halaman /kirim
  "urutanNama": "pria-dulu",       // atau "wanita-dulu"
  "tanggalUtama": "2026-10-10T08:00:00",
  "mempelai": {
    "pria":  { "panggilan": "...", "namaLengkap": "...", "ayah": "...", "ibu": "...", "foto": "groom.jpg" },
    "wanita":{ "panggilan": "...", "namaLengkap": "...", "ayah": "...", "ibu": "...", "foto": "bride.jpg" }
  },
  "acara": [
    { "nama": "Akad Nikah", "tanggal": "2026-10-10", "waktuMulai": "08:00", "tempat": "...", "mapsEmbed": "..." }
  ],
  "galeri": ["gallery-01.jpg", "gallery-02.jpg"],
  "fotoCover": "cover.jpg",
  "musik": { "judul": "...", "src": "/media/lagu.mp3" },
  "tamu": [ { "nama": "Bapak Andi", "telepon": "081234567890", "grup": "Keluarga" } ]
}
```

Contoh lengkap: [`content/clients/budi-sari/config.json`](content/clients/budi-sari/config.json).

### Kustomisasi lanjutan (opsional) — override di atas tema

Tema terkurasi tetap default. Bila ingin lebih bebas, tambahkan di `config.json` (atau atur di **Studio** dengan picker + pratinjau langsung):

```jsonc
{
  // Ganti font per-peran (dari pustaka self-hosted, ~29 family)
  "fontOverride": { "heading": "\"Fraunces\"", "script": "\"Tangerine\"", "body": "\"Inter\"" },
  // Timpa warna tema (hex). Studio menampilkan peringatan bila kontras < 4.5:1
  "paletteOverride": { "primary": "#7c1f4e", "accent": "#c98a1f", "bg": "#1a1020", "ink": "#f2e8f0" },
  // Ganti motif ornamen terlepas dari tema
  "motifOverride": "moroccan-tile",
  // Font milik sendiri (self-hosted): taruh file di folder photos/ klien
  "customFonts": [{ "family": "FontKami", "file": "fontkami.woff2" }]
}
```

Semua diterapkan lewat CSS variable (menimpa nilai tema). Font milik sendiri disajikan via route yang sama dengan foto (tetap self-hosted, tanpa CDN eksternal). Di **Studio**, client bahkan bisa mengunggah file font untuk pratinjau langsung, lalu file-nya diserahkan terpisah ke admin.

Di **Studio** juga tersedia:
- **Preset Gaya** — kombinasi font+warna+motif siap pakai (Emas Klasik, Monokrom Modern, Botani Lembut, Mawar Anggun, Malam Mewah) yang bisa diterapkan satu ketuk; client juga bisa **menyimpan gaya** buatannya sendiri.
- **Generator palet otomatis** — masukkan satu warna → sistem menyusun palet harmonis (bg/surface/primary/accent/ink/muted) yang **dijamin lolos kontras WCAG AA**, mode terang atau gelap.

### Aturan ukuran foto (disarankan)

| Slot | Ukuran | Rasio |
| --- | --- | --- |
| `cover.jpg` | 1200×1500 (potret) atau 1600×1000 (lanskap) | bebas (crop `object-cover`) |
| `groom.jpg` / `bride.jpg` | 800×1000 | 4:5 |
| `gallery-XX.jpg` | min. 1000px sisi terpanjang | bebas |
| `story-XX.jpg` | 900×700 | bebas |

Format didukung: **`.jpg` `.png` `.webp` `.svg`**. Semua foto dipotong rapi dengan `object-cover` (tidak gepeng), rasio slot dikunci.

**Optimasi (disarankan sebelum deploy):** jalankan `npm run optimize -- <client>` untuk mengubah foto besar jadi `.opt.webp` (maks 1600px, ~80% kualitas). Loader otomatis memilih varian teroptimasi bila ada → undangan jauh lebih ringan di HP. SVG dilewati (sudah ringan).

### Preview WhatsApp (OG image)

Tiap `/tema/{slug}` & `/u/{client}` otomatis punya **gambar preview** bertema (nama pasangan + tanggal + warna tema) yang muncul saat link dibagikan di WhatsApp/media sosial — di-generate on-demand via `next/og` (`app/**/opengraph-image.tsx`), font `.woff` self-hosted.

### Analytics (opsional)

Lapisan event siap-backend ada di `lib/analytics/` — `track('invitation_open' | 'rsvp_submit' | ...)` sudah terpasang di undangan. Default hanya log di dev (tanpa localStorage di halaman tamu). Untuk agregat "berapa yang buka":
- **Backend sendiri:** `setAnalyticsProvider(beaconProvider('/api/track'))` lalu simpan (nyatu dengan RSVP tersimpan).
- **Vercel Web Analytics:** `npm i @vercel/analytics` + `<Analytics/>` di layout (nol backend, lihat dashboard Vercel).

---

## Alat kirim massal & manajemen tamu

Halaman `/u/{client}/kirim` (diproteksi `accessKey` dari `config.json`) untuk KLIEN menyebar undangan:

- **Impor tamu** — tempel dari Excel/Notes (format `Nama` atau `Nama, 08xxx`) atau isi di `config.json` (`tamu`).
- **Template pesan** dengan variabel `{nama}` & `{link}` + preview.
- **Tabel tamu** — tautan personal otomatis, Salin Link, Salin Pesan, dan **Kirim via WA** (`wa.me`, `08xx`→`628xx`).
- **Pelacakan status** terkirim/belum (disimpan di `localStorage`), progres "87/200 terkirim".
- **Ekspor CSV** & **QR code** per tamu / undangan umum (unduh PNG).

> Pengiriman tetap lewat WhatsApp pribadi klien **satu per satu** (satu klik per tamu) — disengaja agar akun WhatsApp aman dari pemblokiran. Tidak ada otomasi kirim massal.

---

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Di Vercel: **New Project** → pilih repo → framework **Next.js** (deteksi otomatis).
3. Set domain kustom `undangan.raf.my.id`.
4. Deploy.

Folder `content/` (config & foto klien) ikut ter-deploy (sudah diatur di `next.config.mjs` via `outputFileTracingIncludes`).

**Menambah/mengubah klien di produksi:** commit perubahan di `content/clients/...` lalu deploy ulang (push ke branch produksi). Klien baru akan otomatis dirender.

---

## Ubah identitas bisnis

Semua konstanta ada di **[`lib/brand.ts`](lib/brand.ts)** — nomor WhatsApp, Instagram, harga paket, langkah cara pesan, dsb. Ubah di satu tempat.

```ts
export const BRAND = {
  whatsapp: '6281234567890',   // GANTI dengan nomor Anda
  // ...
};
```

---

## Arsitektur singkat

```
lib/engine/       Theme engine: palettes, fonts, motifs (SVG), layouts, registry (120 tema)
lib/invitation/   Komponen bagian undangan + FotoSlot + orchestrator (Invitation)
lib/catalog/      Kartu preview tema & katalog
lib/clients/      Skema zod + loader klien (file-based)
lib/studio/       Panel edit mandiri (draft + builder config.json)
lib/site/         Header, Footer, Wordmark brand
lib/brand.ts      Konstanta bisnis (WA, harga, dst)
lib/demo/         6 pasangan fiktif untuk demo tema
content/clients/  Data klien (config.json + photos/)
scripts/          gen-registry, sanity-check, new-client, screenshots, gen-placeholder-photos
```

**Prinsip:** tema bukan 120 file terpisah, melainkan kombinasi terkurasi dari `layout × palet × font × motif`. Satu perbaikan di engine memperbaiki semua tema sekaligus.

---

© Rafayana by RAF Undangan.
