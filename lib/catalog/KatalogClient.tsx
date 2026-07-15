'use client';

import React, { useMemo, useState } from 'react';
import { getAllTema, SEMUA_KATEGORI } from '@/lib/engine';
import { ThemeMiniCard } from './ThemeMiniCard';

// ============================================================================
// Katalog 120 tema: filter kategori (tab) + pencarian nama + pagination
// (muat bertahap agar tak merender 120 preview sekaligus).
// ============================================================================

const PER_PAGE = 24;
const ALL = getAllTema();

export function KatalogClient() {
  const [kategori, setKategori] = useState<string>('Semua');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PER_PAGE);

  const tabs = useMemo(() => {
    const counts: Record<string, number> = { Semua: ALL.length };
    for (const k of SEMUA_KATEGORI) counts[k] = ALL.filter((t) => t.kategori === k).length;
    return counts;
  }, []);

  const hasil = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL.filter((t) => {
      if (kategori !== 'Semua' && t.kategori !== kategori) return false;
      if (q && !t.namaTampilan.toLowerCase().includes(q) && !t.tagline.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [kategori, query]);

  const tampil = hasil.slice(0, visible);

  function pilihKategori(k: string) {
    setKategori(k);
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

      {/* Tab kategori */}
      <div className="no-scrollbar mb-7 flex snap-x gap-2 overflow-x-auto pb-1">
        {['Semua', ...SEMUA_KATEGORI].map((k) => (
          <button
            key={k}
            onClick={() => pilihKategori(k)}
            className={`shrink-0 snap-start rounded-full border px-4 py-1.5 text-sm transition-colors ${
              kategori === k
                ? 'border-brand-ink bg-brand-ink text-brand-cream'
                : 'border-brand-line bg-brand-paper text-brand-ink hover:border-brand-gold'
            }`}
          >
            {k} <span className="opacity-60">({tabs[k]})</span>
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
