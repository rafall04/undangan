import React from 'react';
import Link from 'next/link';
import type { TemaResolved } from '@/lib/engine';
import { temaCssVars } from '@/lib/engine';
import { MotifPattern, MotifDivider } from '@/lib/engine/motifs';

// ============================================================================
// Kartu preview mini tema — DIRENDER dari warna/font/motif tema asli (bukan
// gambar statis). Menampilkan mini-cover + metadata + swatch palet.
// ============================================================================

function Swatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
      style={{ backgroundColor: color }}
    />
  );
}

export function ThemeMiniCard({ tema }: { tema: TemaResolved }) {
  const deep = tema.palet.gelap ? tema.palet.surface : tema.palet.primary;
  const backdrop = `linear-gradient(160deg, ${deep}, color-mix(in srgb, ${deep} 52%, #000))`;

  return (
    <Link
      href={`/tema/${tema.slug}`}
      className="cv-card group block overflow-hidden rounded-2xl bg-brand-paper ring-1 ring-brand-line transition-all hover:-translate-y-0.5 hover:shadow-lg"
      prefetch={false}
    >
      {/* Mini-cover: menunjukkan font + warna + motif tema (ringan: 1 pola + 1 divider) */}
      <div
        className="relative aspect-[4/5] overflow-hidden text-white"
        style={{ ...temaCssVars(tema), background: backdrop }}
      >
        <MotifPattern motifId={tema.motifId} color="#ffffff" opacity={0.09} scale={0.9} />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <p className="font-script text-xl leading-none text-white/85">The Wedding of</p>
          <h3 className="mt-1.5 font-heading text-2xl font-semibold leading-tight tracking-wide text-white">
            {tema.namaTampilan}
          </h3>
          <div className="mt-2 opacity-80">
            <MotifDivider motifId={tema.motifId} color="rgba(255,255,255,0.75)" width={110} />
          </div>
          <p className="mt-2 max-w-[85%] font-body text-[11px] leading-snug text-white/80">
            {tema.tagline}
          </p>
        </div>
      </div>

      {/* Caption metadata (warna brand) */}
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-brand-serif text-base font-semibold text-brand-ink">
            {tema.namaTampilan}
          </p>
          <div className="flex shrink-0 gap-1">
            <Swatch color={tema.palet.primary} />
            <Swatch color={tema.palet.accent} />
            <Swatch color={tema.palet.bg} />
          </div>
        </div>
        <p className="mt-0.5 text-xs text-brand-muted">
          {tema.kategori} · {tema.layout.nama}
        </p>
      </div>
    </Link>
  );
}
