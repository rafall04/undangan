# THEME_AUDIT — FASE 0 (read-only)

Tanggal: 17 Juli 2026 · Commit: `e492f94` · Metode: baca kode + probe DOM & screenshot
Playwright terhadap **produksi** (`undangan.raf.my.id`), viewport 390×844.

Tak ada kode yang diubah dalam fase ini.

---

## 0. Temuan terpenting: kita akhirnya bisa MELIHAT

**Playwright sudah ada di `package.json` (`^1.61.1`) dan terpasang di `node_modules`.**
Ia berhasil meluncurkan Chromium, memuat halaman, mengklik "Buka Undangan", memotret,
dan menjalankan `getComputedStyle` — semuanya bekerja.

Ini mengubah segalanya. Panel pratinjau bawaan environment ini rusak (`innerHeight = 0`,
tak pernah paint), dan **itulah akar dari tiga regresi berturut-turut** yang lolos ke
produksi: nama mempelai lenyap (`background-clip:text`), bagian bawah beku separuh
transparan (`animation-range`), dan sekarang tategaki di paragraf Indonesia. Ketiganya
"terverifikasi" lewat HTML/tsc — dan HTML tak bisa memberi tahu bahwa sesuatu **jelek**.

Bagian 8 (Loop Verifikasi Visual) karena itu bukan tambahan; ia yang paling mendesak.

---

## (a) `writing-mode` — DUA tempat, keduanya pada teks Indonesia

Grep seluruh repo (`writing-mode|writingMode`) → hanya 2 hasil. Keduanya melanggar R2.

### a1. `lib/invitation/Signature.tsx:244` — `<Tategaki>` · **PELANGGARAN BERAT**

Dipakai oleh `Pembuka.tsx:120` (`VarTategaki`), membungkus `salam` **dan** `intro` —
dua paragraf Bahasa Indonesia. Terpakai di layout `washi` & `noren` → **48 tema Jepang**.

Probe DOM pada `/tema/sakura-fubuki` (setelah dibuka):

| Tag | `lang` | Jumlah karakter | Cuplikan |
|---|---|--:|---|
| DIV | `id` | 150 | "Dengan memohon rahmat dan ridha Tuhan Yang Maha Esa…" |
| P | `id` | 51 | "Dengan memohon rahmat dan ridha Tuhan Yang Maha Esa" |
| P | `id` | 99 | "Merupakan suatu kebahagiaan dan kehormatan bagi kami…" |

Aturan 6.1 mengizinkan vertikal hanya untuk `lang="ja"`, ≤±12 karakter, dekoratif.
Yang ada: `lang="id"`, 51 & 99 karakter, teks utama. Bukan pelanggaran teknis di pinggir —
ini kalimat pembuka undangan, dan ia nyaris tak terbaca.

Catatan jujur: di file yang sama saya menulis komentar bahwa teks panjang vertikal
melelahkan dibaca di ponsel, lalu **mengembalikan kutipan ke horizontal** tapi
membiarkan paragraf pembukanya vertikal. Masalahnya terlihat, diperbaiki setengah,
lalu dianggap selesai. Akibatnya kutipan horizontal tepat di bawah paragraf vertikal —
inkonsistensi itu justru membuat kerusakannya makin kentara.

### a2. `lib/invitation/sections/Acara.tsx:166` — batang tiket · **perlu keputusan**

`writingMode: vertical-rl` + `rotate(180deg)` pada `{a.nama}` = "Akad Nikah" / "Resepsi".
Terpakai di layout `stamp` & `ticket` (18 tema). Tidak tertangkap di screenshot Anda
karena tak ada tema Jepang yang memakai layout itu.

Ini **label pendek** (≤12 karakter), dan teks vertikal di batang tiket adalah idiom
Latin yang sah (tiket konser, boarding pass) — bukan tategaki yang salah tempat.
Tapi R2 ditulis absolut: vertikal hanya untuk `lang="ja"`. **Butuh putusan Anda**
(lihat FASE 1, Keputusan #1). Saya tak mengarang pengecualian sendiri.

---

## (b) Tinggi cover & scroll-lock — E7 terkonfirmasi, mekanismenya bukan `100vh`

```
Invitation.tsx:145  <div className="fixed inset-0 z-40 …">   ← setinggi viewport NYATA
Cover.tsx:110       SHELL = "… h-[100svh] min-h-[600px] …"   ← setinggi viewport TERKECIL
```

`svh` = *small viewport height* = tinggi saat URL bar **terbuka**. Ketika URL bar
menyusut, viewport **tumbuh** melewati `svh`. Pembungkus `fixed inset-0` ikut tumbuh;
SHELL di dalamnya tidak. Muncul pita kosong di bawah cover, dan `InvitationBody`
(z-0/z-10) mengintip lewat situ → **countdown terlihat sebelum undangan dibuka**.

Jadi ini bukan bug `100vh` klasik; ini bug `100svh`. Perbaikannya bukan mengganti
`vh`→`dvh` di SHELL, melainkan menyadari bahwa **SHELL tak perlu tinggi sama sekali** —
pembungkus `fixed inset-0` sudah mendefinisikan tingginya. `min-h-[600px]` juga
berbahaya arah sebaliknya: pada viewport pendek, SHELL jadi lebih tinggi dari
pembungkus → isi cover terpotong.

**Dua cacat tambahan yang tidak ada di daftar E Anda:**

- **Tidak ada scroll-lock.** Tak ada `overflow: hidden` pada `body`/`html` saat gate
  tertutup. Halaman di belakang bebas di-scroll — gate hanyalah lapisan visual.
- **Konten di belakang tak pernah `inert`/`aria-hidden`.** `aria-hidden={opened}`
  di baris 150 menyembunyikan **cover** setelah dibuka (benar), tapi `InvitationBody`
  tak pernah disembunyikan **selagi** gate menutup. Pembaca layar & Tab membacakan
  seluruh undangan menembus gate.

---

## (c) Sumber copy demo global — `lib/demo/couples.ts`

- **6 pasangan** berotasi deterministik: `REGISTRY.findIndex(slug) % 6`. Ini satu-satunya
  yang bervariasi antar tema.
- **Global untuk 304 tema, identik:** `QUOTE` (Sam Keen) untuk semua tema non-Islami,
  `AYAT` (QS. Ar-Rum: 21) untuk kategori Islami, `UCAPAN_CONTOH` (4 komentar),
  teks amplop, teks live streaming, `musik` ("Gamelan Asmara" — **di tema Jepang juga**).
- `islami` **diturunkan dari kategori**: `tema.kategori === 'Islami'`. Bukan dari data
  pasangan. Untuk pelanggan nyata, `configKlienSchema` yang menentukan — jadi content
  layer sudah benar; yang salah hanya register demo.

### E4 — akarnya jauh lebih buruk dari yang dilaporkan

```
lib/invitation/sections/Mempelai.tsx:146   overline="Bismillah"
```

**Tanpa kondisi apa pun.** Tidak di balik flag `islami`. Label Islami ini tampil di
**semua 304 tema** — termasuk seluruh tema China, Jepang, dan Barat. Ini bukan sekadar
"copy demo tak sadar-tema"; ini kekeliruan yang bisa menyinggung, dan ia live sekarang.
Ini pelanggaran paling murah diperbaiki di seluruh daftar (satu baris) dan seharusnya
tak pernah menunggu sistem archetype.

Kesembilan overline hardcoded, campur bahasa, tak bisa dikonfigurasi:
`Bismillah`, `Counting Down`, `Gallery`, `Live Streaming`, `Lokasi Acara`,
`Our Journey`, `RSVP`, `Save the Date`, `Wedding Gift`.

---

## (d) Definisi 304 tema & token

- **Registry**: `lib/engine/registry.ts` — DIBUAT oleh `scripts/gen-registry.mts`
  dari 9 POOLS. Tema = `layoutId × paletId × fontId × motifId` + `kategori` + `budaya`.
- **Token**: `lib/engine/palettes.ts` (22 palet: `bg/surface/primary/accent/ink/muted/coverGradient`),
  `fonts.ts` (pasangan heading/script/body), `motifs-meta.ts` + `motifs.tsx`
  (17 motif: TILES + GLYPHS).
- **Struktur** (dibangun 16–17 Juli): `lib/invitation/layout-styles.ts` — 29 layout ×
  {`urutan[]`, `pembuka`, `countdown`, `acara`, `galeri`, `cover`, `mempelai`, `chrome`,
  `headingStyle`}; `signature` diturunkan dari `budaya`. 8 tatanan, 32 kombinasi unik.
- **Guard yang sudah ada**: kontras WCAG AA (`sanity-check.mts`, 110/110 lolos),
  budaya motif vs pool, layout eksklusif per budaya, kelengkapan `urutan`.

**Status Masalah A**: sebagian sudah tertangani 17 Juli — urutan bagian kini berbeda
per layout (terbukti di HTML produksi: 4 tema, 4 urutan). Klaim review bahwa tag layout
"hanya label" **sudah tidak akurat**. Yang **masih benar**: struktur **cover** memang
identik elemen-per-elemen (E10) dan atmosfer budaya memang nihil (E8/Masalah B).

### E5 — palet tidak koheren, terbukti visual

`sakura-fubuki` → palet `sakura-sumi`: `bg #f6eef0` (pink pucat), `primary #6f2f45` (wine),
`coverGradient rgba(30,18,24,…)` (nyaris hitam).

Tanpa foto sampul, cover jatuh ke `primary` → **sampul wine solid**. Halaman dalam `bg`
→ pink pucat. Kartu mempelai → gradien wine lagi. **Tiga keluarga warna dalam satu tema.**
Screenshot: `qa/evidence/` (terlampir di percakapan).

Ini cacat **sistemik**, bukan khusus sakura: `coverGradient` dirancang agar teks terbaca
di atas **foto**. Semua 304 demo tak berfoto, jadi tiap cover jatuh ke `primary` gelap
sementara badan halaman memakai `bg` terang. **Setiap tema berpalet terang punya cacat
koherensi ini di demo.** Belum saya ukur untuk 304 tema — perlu sapuan Playwright.

### E6 — motifnya BENAR; partikelnya yang salah

- `motifs.tsx:243` GLYPH sakura: `[0, 72, 144, 216, 288]` → **5 kelopak, jarak 72°. Benar.**
  Yang belum: kelopak berupa elips polos, **tanpa lekukan (notch)** di ujung.
- Yang berkelopak banyak adalah **partikel jatuh**, bukan motif: `.petal` di
  `globals.css:150` → `border-radius: 60% 0 60% 0` = satu bentuk daun generik,
  **sama untuk semua 304 tema**, cuma diwarnai `--accent`. Jadi "Sakura Fubuki"
  menjatuhkan daun, bukan sakura.

### E3 — partikel di atas SEGALANYA

`Petals.tsx:22` → `fixed inset-0 z-50`. Cover z-40, isi z-0/z-10. Kelopak berada di
lapisan **paling atas**, `background: color-mix(in srgb, var(--accent) 78%, white)`
plus `box-shadow` glow → efektif opak, jauh di atas ambang 0.35 (R5). Tak ada scrim,
tak ada exclusion zone. Terlihat jelas melintasi paragraf di screenshot.
(Sisi baiknya: `prefers-reduced-motion` sudah `display: none` — R5 separuh terpenuhi.)

### E9 — identitas ganda

`Cover.tsx` merender `monogramPasangan()` **dan** `<Names>` bersamaan pada tiga varian
(baris 158+163, 229+231, 254+257) → monogram lingkaran + nama lengkap bertumpuk.

### E2 — dead space

`VarTategaki` menaruh kolom teks di `justify-end` dengan kamon `flex-1 justify-start`.
Hasil: crest mungil di kiri atas, ~60% layar kiri kosong. Itu sisa ruang, bukan *ma*.

---

## (e) Loader font — `lib/engine/fonts-load.ts`

Self-hosted `@fontsource` (bukan Google CDN), diimpor sekali di `app/layout.tsx`;
woff2 baru diunduh saat family dipakai.

- **Nol font CJK.** Terkonfirmasi ulang.
- **Nol font faux-Japanese/"wonton".** Tema Jepang memakai Tenor Sans, Josefin Sans,
  Playfair Display, Marcellus — font Latin biasa.
- **Nol karakter kana/kanji** di seluruh repo (grep rentang Unicode
  `\x{3040}-\x{309F}\x{30A0}-\x{30FF}\x{4E00}-\x{9FFF}` → 0 hasil).

**Konsekuensi penting untuk Bagian 6.3/6.5:** jalur 6.5b (menambah aksen `lang="ja"`)
**mengharuskan** subset Mincho lebih dulu. Menambah 祝結婚 tanpa font = menciptakan bug
tofu yang dulu hanya berupa hipotesis. Jalur 6.5a (hapus semua tategaki, atmosfer visual
saja) tidak butuh font baru sama sekali dan menyelesaikan E1 secara tuntas.

---

## Ringkasan status

| Item | Status | Bukti |
|---|---|---|
| **E1** tategaki di teks Indonesia | **Terkonfirmasi** — 3 elemen `lang="id"`, 51 & 99 char | Probe DOM + screenshot |
| **E2** dead space | Terkonfirmasi | Screenshot |
| **E3** partikel melintasi teks | Terkonfirmasi — z-50, opak | Kode + screenshot |
| **E4** label tema | **Lebih buruk** — `overline="Bismillah"` tanpa kondisi, 304 tema | `Mempelai.tsx:146` |
| **E5** palet tak koheren | Terkonfirmasi — dan **sistemik**, bukan cuma sakura | Screenshot + `palettes.ts` |
| **E6** sakura ≥6 kelopak | **Sebagian meleset** — motif sudah 5 kelopak; **partikelnya** yang generik | `motifs.tsx:243` vs `globals.css:150` |
| **E7** countdown mengintip | Terkonfirmasi — sebabnya `100svh`, **bukan** `100vh` | `Cover.tsx:110` |
| **E8/B** nol elemen keraton | Terkonfirmasi | — |
| **E9** identitas ganda | Terkonfirmasi | `Cover.tsx` ×3 varian |
| **E10/A** struktur cover identik | Terkonfirmasi untuk **cover**; **tidak lagi** untuk isi | `layout-styles.ts` + HTML prod |
| **D** ampersand "Raka Ayu" | **Bukan bug** — varian `poster` sengaja `{a}<br/>{b}` | `Cover.tsx:76-81` |
| **D** 250+ vs 304, paket FAQ | **Sudah beres** (commit `e492f94`) | Live: "300+", "aktif 10 bulan" |
| Scroll-lock | **Tak ada** (temuan baru) | `Invitation.tsx` |
| `inert` konten di balik gate | **Tak ada** (temuan baru) | `Invitation.tsx:150` |

Belum diaudit: budget performa Bagian 11 (butuh throttling Playwright), 302 tema selain
dua yang difoto, dan `text-wrap`/skala tipe (R8).
