'use client';

import React, { useMemo, useState } from 'react';
import { getAllTema, SEMUA_KATEGORI } from '@/lib/engine';
import { SEMUA_BUDAYA, LABEL_BUDAYA, type Budaya } from '@/lib/engine/types';
import { ThemeMiniCard } from './ThemeMiniCard';

// ============================================================================
// Katalog tema — DUA SUMBU:
//   • BUDAYA (Jawa/Jepang/China/…) — dari motif tema, bukan dari namanya.
//   • GAYA   (Elegan/Minimalis/…)
// Keduanya bisa digabung ("Jepang + Minimalis"). Plus pencarian & muat
// bertahap agar tak merender ratusan preview sekaligus.
// ============================================================================

const PER_PAGE = 24;
const ALL = getAllTema();

export function KatalogClient() {
  const [kategori, setKategori] = useState<string>('Semua');
  const [budaya, setBudaya] = useState<string>('Semua');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PER_PAGE);

  // Hitungan tiap tab dihitung terhadap sumbu LAIN yang sedang aktif, supaya
  // angkanya jujur: memilih "Jepang" membuat tab gaya menampilkan sisa yang ada.
  const tabsGaya = useMemo(() => {
    const pool = budaya === 'Semua' ? ALL : ALL.filter((t) => t.budaya === budaya);
    const counts: Record<string, number> = { Semua: pool.length };
    for (const k of SEMUA_KATEGORI) counts[k] = pool.filter((t) => t.kategori === k).length;
    return counts;
  }, [budaya]);

  const tabsBudaya = useMemo(() => {
    const pool = kategori === 'Semua' ? ALL : ALL.filter((t) => t.kategori === kategori);
    const counts: Record<string, number> = { Semua: pool.length };
    for (const b of SEMUA_BUDAYA) counts[b] = pool.filter((t) => t.budaya === b).length;
    return counts;
  }, [kategori]);

  const hasil = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL.filter((t) => {
      if (kategori !== 'Semua' && t.kategori !== kategori) return false;
      if (budaya !== 'Semua' && t.budaya !== budaya) return false;
      if (q && !t.namaTampilan.toLowerCase().includes(q) && !t.tagline.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [kategori, budaya, query]);

  const tampil = hasil.slice(0, visible);

  function pilihKategori(k: string) {
    setKategori(k);
    setVisible(PER_PAGE);
  }

  function pilihBudaya(b: string) {
    setBudaya(b);
    setVisible(PER_PAGE);
  }

  return (
    <div>
      {/* Pencarian */}
      <div className="mx-auto mb-5 max-w-md">
        <div className="relative">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
            <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(PER_PAGE);
            }}
            placeholder="Cari nama tema, mis. Kawung, Svarga…"
            className="w-full rounded-full border border-brand-line bg-brand-paper py-2.5 pl-11 pr-4 text-sm text-brand-ink outline-none placeholder:text-brand-muted/70 focus:border-brand-gold"
          />
        </div>
      </div>

      {/* Sumbu 1 — BUDAYA */}
      <p className="mb-1.5 text-center text-xs uppercase tracking-widest text-brand-gold">Budaya</p>
      <div className="no-scrollbar mb-4 flex snap-x justify-start gap-2 overflow-x-auto pb-1 sm:justify-center">
        {['Semua', ...SEMUA_BUDAYA].map((b) => (
          <button
            key={b}
            onClick={() => pilihBudaya(b)}
            disabled={b !== 'Semua' && tabsBudaya[b] === 0}
            className={`shrink-0 snap-start rounded-full border px-4 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              budaya === b
                ? 'border-brand-gold bg-brand-gold text-white'
                : 'border-brand-line bg-brand-paper text-brand-ink hover:border-brand-gold'
            }`}
          >
            {b === 'Semua' ? 'Semua' : LABEL_BUDAYA[b as Budaya]}{' '}
            <span className="opacity-60">({tabsBudaya[b]})</span>
          </button>
        ))}
      </div>

      {/* Sumbu 2 — GAYA */}
      <p className="mb-1.5 text-center text-xs uppercase tracking-widest text-brand-gold">Gaya</p>
      <div className="no-scrollbar mb-7 flex snap-x gap-2 overflow-x-auto pb-1">
        {['Semua', ...SEMUA_KATEGORI].map((k) => (
          <button
            key={k}
            onClick={() => pilihKategori(k)}
            disabled={k !== 'Semua' && tabsGaya[k] === 0}
            className={`shrink-0 snap-start rounded-full border px-4 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              kategori === k
                ? 'border-brand-ink bg-brand-ink text-brand-cream'
                : 'border-brand-line bg-brand-paper text-brand-ink hover:border-brand-gold'
            }`}
          >
            {k} <span className="opacity-60">({tabsGaya[k]})</span>
          </button>
        ))}
      </div>

      {/* Hasil */}
      {tampil.length === 0 ? (
        <p className="py-16 text-center text-brand-muted">
          Tidak ada tema yang cocok. Coba kata kunci lain.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {tampil.map((t) => (
              <ThemeMiniCard key={t.slug} tema={t} />
            ))}
          </div>

          {visible < hasil.length && (
            <div className="mt-10 text-center">
              <p className="mb-3 text-sm text-brand-muted">
                Menampilkan {tampil.length} dari {hasil.length} tema
              </p>
              <button
                onClick={() => setVisible((v) => v + PER_PAGE)}
                className="rounded-full border border-brand-gold px-6 py-2.5 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-gold hover:text-white"
              >
                Muat lebih banyak
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
