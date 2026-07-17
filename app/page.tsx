import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Header } from '@/lib/site/Header';
import { Footer } from '@/lib/site/Footer';
import { Wordmark } from '@/lib/site/Wordmark';
import { ThemeMiniCard } from '@/lib/catalog/ThemeMiniCard';
import { getTemaBySlug, statistikRegistry } from '@/lib/engine';
import { BRAND, waLink, CARA_PESAN, KEUNGGULAN, buildFaq } from '@/lib/brand';
import { getSettings, formatRupiah } from '@/lib/settings';
import { MotifPattern } from '@/lib/engine/motifs';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const stat = statistikRegistry();

const UNGGULAN_SLUG = [
  'kawung-ratri',
  'svarga',
  'serene',
  'taman-sekar',
  'barakah',
  'nostalgia',
  'aurora-emas',
  'sekar-jagad',
];
const temaUnggulan = UNGGULAN_SLUG.map((s) => getTemaBySlug(s)).filter(
  (t): t is NonNullable<typeof t> => Boolean(t),
);

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-brand-gold" aria-hidden>
      <path d="m5 12.5 4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LandingPage() {
  // Paket/harga & nomor WA dari Pengaturan (DB) → admin bisa mengubah kapan saja.
  const settings = getSettings();
  // FAQ ikut paket yang sama, jadi jawaban masa aktif tak bisa lagi bertentangan
  // dengan section harga di halaman yang sama.
  const faq = buildFaq(settings.paket);
  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink">
      <Header />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-100">
          <MotifPattern motifId="floral-line" color="#3a2c1e" opacity={0.05} scale={1.3} />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-14 text-center sm:pt-20">
          <p className="mb-4 inline-block rounded-full border border-brand-line bg-brand-paper px-4 py-1 text-xs uppercase tracking-widest text-brand-gold">
            Undangan Pernikahan Digital
          </p>
          <div className="flex justify-center">
            <Wordmark size="xl" />
          </div>
          <h1 className="mx-auto mt-8 max-w-2xl font-brand-serif text-3xl font-medium leading-snug text-brand-ink sm:text-4xl">
            {BRAND.tagline}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-brand-muted sm:text-base">
            Undangan digital yang elegan dan berkesan — {stat.totalTema} tema terkurasi, tertata rapi,
            dan siap Anda sebarkan ke ratusan tamu lewat WhatsApp.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/tema"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-ink px-7 py-3 text-sm font-medium text-brand-cream transition-transform hover:scale-[1.02] sm:w-auto"
            >
              Lihat Katalog Tema
            </Link>
            <a
              href={waLink('Halo Rafayana, saya ingin memesan undangan digital.', settings.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-gold px-7 py-3 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-gold hover:text-white sm:w-auto"
            >
              Pesan via WhatsApp
            </a>
          </div>
        </div>

        {/* Strip preview tema */}
        <div className="no-scrollbar relative mx-auto mb-4 flex max-w-6xl snap-x gap-4 overflow-x-auto px-6 pb-6">
          {temaUnggulan.slice(0, 6).map((t) => (
            <div key={t.slug} className="w-40 shrink-0 snap-start sm:w-48">
              <ThemeMiniCard tema={t} />
            </div>
          ))}
        </div>
      </section>

      {/* ================= TRUST STRIP ================= */}
      <section className="border-y border-brand-line bg-brand-ink text-brand-cream">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 py-9 text-center sm:grid-cols-4">
          {[
            { k: `${stat.totalTema}+`, v: 'Tema Terkurasi' },
            { k: '1–2 Hari', v: 'Pengerjaan Cepat' },
            { k: 'Per Tamu', v: 'Tautan Personal' },
            { k: 'WhatsApp', v: 'Dukungan Langsung' },
          ].map((s) => (
            <div key={s.v}>
              <p className="font-brand-serif text-2xl font-bold text-brand-gold sm:text-3xl">{s.k}</p>
              <p className="mt-1 text-xs text-brand-cream/70 sm:text-sm">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= TENTANG / MAKNA NAMA ================= */}
      <section id="tentang" className="border-y border-brand-line bg-brand-paper">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-16 sm:grid-cols-2">
          <div>
            <p className="font-brand-script text-4xl text-brand-gold">Rafayana</p>
            <h2 className="mt-2 font-brand-serif text-3xl font-semibold text-brand-ink">
              Makna di Balik Nama
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-brand-muted sm:text-base">
              <p>
                <span className="font-semibold text-brand-ink">Rafayana</span> lahir dari perpaduan{' '}
                <span className="font-semibold text-brand-ink">RAF</span> dan{' '}
                <span className="italic">ayana</span> — kata Sanskerta yang berarti{' '}
                <span className="font-semibold text-brand-ink">perjalanan</span>, seakar dengan{' '}
                <span className="italic">Ramayana</span>.
              </p>
              <p>
                Bagi kami, setiap kisah cinta adalah sebuah perjalanan panjang yang istimewa — dari
                pertemuan pertama hingga janji suci. Dan setiap perjalanan seindah itu{' '}
                <span className="font-semibold text-brand-ink">layak untuk diabadikan</span>.
              </p>
              <p>
                Itulah yang kami rawat di setiap undangan yang kami buat: bukan sekadar informasi acara,
                melainkan penanda babak baru dalam perjalanan cinta Anda.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="mx-auto max-w-xs overflow-hidden rounded-3xl">
              {temaUnggulan[0] && <ThemeMiniCard tema={temaUnggulan[0]} />}
            </div>
          </div>
        </div>
      </section>

      {/* ================= KEUNGGULAN ================= */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center">
          <p className="font-brand-script text-3xl text-brand-gold">Mengapa Rafayana</p>
          <h2 className="mt-1 font-brand-serif text-3xl font-semibold text-brand-ink">
            Dibuat dengan Rasa
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {KEUNGGULAN.map((k) => (
            <div key={k.judul} className="rounded-2xl border border-brand-line bg-brand-paper p-6">
              <h3 className="font-brand-serif text-lg font-semibold text-brand-ink">{k.judul}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">{k.teks}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= TEMA UNGGULAN ================= */}
      <section className="border-y border-brand-line bg-brand-paper">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="font-brand-script text-3xl text-brand-gold">Pilihan Tema</p>
              <h2 className="mt-1 font-brand-serif text-3xl font-semibold text-brand-ink">
                Sekilas Katalog
              </h2>
            </div>
            <Link href="/tema" className="shrink-0 text-sm font-medium text-brand-gold hover:underline">
              Lihat semua {stat.totalTema} →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {temaUnggulan.map((t) => (
              <ThemeMiniCard key={t.slug} tema={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= HARGA ================= */}
      <section id="harga" className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <p className="font-brand-script text-3xl text-brand-gold">Harga</p>
          <h2 className="mt-1 font-brand-serif text-3xl font-semibold text-brand-ink">
            Pilih Paket yang Pas
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-brand-muted">
            Harga sekali bayar, tanpa biaya tersembunyi. Semua paket sudah termasuk tautan personal
            per tamu.
          </p>
        </div>
        <div
          className={`mt-10 grid gap-6 ${
            settings.paket.length >= 3 ? 'lg:grid-cols-3' : 'mx-auto max-w-3xl sm:grid-cols-2'
          }`}
        >
          {settings.paket.map((p) => (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-3xl border p-7 ${
                p.populer
                  ? 'border-brand-gold bg-brand-paper shadow-lg ring-1 ring-brand-gold/40'
                  : 'border-brand-line bg-brand-paper'
              }`}
            >
              {p.populer && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-gold px-3 py-1 text-xs font-medium text-white">
                  Paling Populer
                </span>
              )}
              <h3 className="font-brand-serif text-2xl font-semibold text-brand-ink">{p.nama}</h3>
              <p className="mt-1 text-sm text-brand-muted">{p.ringkas}</p>
              <p className="mt-4 font-brand-serif text-4xl font-bold text-brand-ink">{formatRupiah(p.hargaAngka)}</p>
              <p className="mt-0.5 text-xs text-brand-muted">Aktif {p.durasiBulan} bulan</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {p.fitur.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-brand-ink">
                    <Check /> <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={waLink(`Halo Rafayana, saya tertarik dengan paket ${p.nama} (${formatRupiah(p.hargaAngka)}).`, settings.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-7 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors ${
                  p.populer
                    ? 'bg-brand-ink text-brand-cream hover:opacity-90'
                    : 'border border-brand-gold text-brand-ink hover:bg-brand-gold hover:text-white'
                }`}
              >
                Pilih {p.nama}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CARA PESAN ================= */}
      <section id="cara" className="border-t border-brand-line bg-brand-ink text-brand-cream">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="text-center">
            <p className="font-brand-script text-3xl text-brand-cream/80">Cara Pesan</p>
            <h2 className="mt-1 font-brand-serif text-3xl font-semibold text-white">
              Empat Langkah Sederhana
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CARA_PESAN.map((s) => (
              <div key={s.n} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-gold font-brand-serif text-lg text-brand-gold">
                  {s.n}
                </span>
                <h3 className="mt-4 font-brand-serif text-lg font-semibold text-white">{s.judul}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-cream/70">{s.teks}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a
              href={waLink('Halo Rafayana, saya ingin memesan undangan digital.', settings.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-8 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.3.4c-.1.1-.3.3-.1.5.1.3.7 1.1 1.5 1.8 1 .9 1.8 1.1 2 1.2.3.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.5.3 0 .1 0 .7-.1 1.1Z" />
              </svg>
              Mulai Pesan Sekarang
            </a>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="border-t border-brand-line bg-brand-paper">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="text-center">
            <p className="font-brand-script text-3xl text-brand-gold">FAQ</p>
            <h2 className="mt-1 font-brand-serif text-3xl font-semibold text-brand-ink">Pertanyaan Umum</h2>
          </div>
          <div className="mt-8 space-y-3">
            {faq.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-brand-line bg-brand-cream px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-brand-serif text-base font-medium text-brand-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="shrink-0 text-xl leading-none text-brand-gold transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-brand-muted">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a
              href={waLink('Halo Rafayana, saya ada pertanyaan tentang undangan digital.', settings.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-brand-gold hover:underline"
            >
              Masih ada pertanyaan? Chat kami di WhatsApp →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
