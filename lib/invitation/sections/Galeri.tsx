'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { LayoutStyle } from '../layout-styles';
import { SectionShell } from '../SectionShell';
import { SectionHeading } from '../Ornaments';

// ============================================================================
// Galeri — 4 varian tatanan otomatis sesuai jumlah foto:
//   1–2  : full-width stack
//   3–5  : hero + grid 2 kolom
//   6–9  : mosaic 3 kolom (tile besar pertama)
//   10+  : mosaic + "lihat semua"
// Rasio dikunci / object-cover → tak ada foto gepeng. Klik foto → lightbox.
// ============================================================================

function TilePlaceholder() {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        backgroundImage:
          'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--accent) 70%, var(--primary)))',
      }}
      aria-hidden
    >
      <span className="font-script text-3xl text-white/80">❦</span>
    </div>
  );
}

function Tile({
  src,
  index,
  onOpen,
  className = '',
  polaroid = false,
  blur,
}: {
  src?: string;
  index: number;
  onOpen: (i: number) => void;
  className?: string;
  polaroid?: boolean;
  /** Placeholder blur-up (data-URI) — tampil instan sebelum foto termuat. */
  blur?: string;
}) {
  const clickable = Boolean(src);
  const rot = polaroid ? (index % 2 === 0 ? 'rotate-[-2deg]' : 'rotate-[1.5deg]') : '';
  return (
    <button
      type="button"
      onClick={() => clickable && onOpen(index)}
      className={`group relative block overflow-hidden ${polaroid ? 'bg-white p-1.5 pb-5 shadow-md rounded-sm' : 'rounded-xl'} ${rot} ${className}`}
      style={{ cursor: clickable ? 'zoom-in' : 'default' }}
      aria-label={clickable ? `Buka foto ${index + 1}` : `Foto ${index + 1}`}
    >
      {/* Blur-up: dipasang sebagai BACKGROUND wrapper → <img> otomatis menimpanya
          saat termuat, tanpa perlu elemen absolut (menghindari urutan paint). */}
      <span
        className="relative block h-full w-full overflow-hidden rounded-[inherit] bg-cover bg-center"
        style={src && blur ? { backgroundImage: `url(${blur})` } : undefined}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`Galeri ${index + 1}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <TilePlaceholder />
        )}
      </span>
    </button>
  );
}

function Lightbox({
  foto,
  index,
  onClose,
  onNav,
}: {
  foto: string[];
  index: number;
  onClose: () => void;
  onNav: (i: number) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNav((index + 1) % foto.length);
      if (e.key === 'ArrowLeft') onNav((index - 1 + foto.length) % foto.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, foto.length, onClose, onNav]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 no-print"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
        onClick={onClose}
        aria-label="Tutup"
      >
        ✕
      </button>
      {foto.length > 1 && (
        <>
          <button
            className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25"
            onClick={(e) => {
              e.stopPropagation();
              onNav((index - 1 + foto.length) % foto.length);
            }}
            aria-label="Sebelumnya"
          >
            ‹
          </button>
          <button
            className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25"
            onClick={(e) => {
              e.stopPropagation();
              onNav((index + 1) % foto.length);
            }}
            aria-label="Berikutnya"
          >
            ›
          </button>
        </>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={foto[index]}
        alt={`Foto ${index + 1}`}
        className="max-h-[85vh] max-w-full rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export function Galeri({
  foto,
  style,
  motifId,
  blur,
}: {
  foto: string[];
  style: LayoutStyle;
  motifId: string;
  /** Placeholder blur-up per foto — indeks sejajar dengan `foto`. */
  blur?: string[];
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const onOpen = useCallback((i: number) => setOpen(i), []);

  if (!foto || foto.length === 0) return null;

  const n = foto.length;
  const polaroid = style.galeriPolaroid;
  // Hanya foto asli (bukan placeholder kosong) yang bisa dibuka lightbox.
  const realFotos = foto.filter(Boolean);

  let grid: React.ReactNode;

  if (n <= 2) {
    grid = (
      <div className="space-y-4">
        {foto.map((s, i) => (
          <Tile key={i} src={s || undefined} index={i} onOpen={onOpen} polaroid={polaroid} blur={blur?.[i]} className="aspect-[4/3] w-full" />
        ))}
      </div>
    );
  } else if (n <= 5) {
    grid = (
      <div className="space-y-3">
        <Tile src={foto[0] || undefined} index={0} onOpen={onOpen} polaroid={polaroid} blur={blur?.[0]} className="aspect-[16/10] w-full" />
        <div className="grid grid-cols-2 gap-3">
          {foto.slice(1).map((s, i) => (
            <Tile key={i + 1} src={s || undefined} index={i + 1} onOpen={onOpen} polaroid={polaroid} blur={blur?.[i + 1]} className="aspect-square w-full" />
          ))}
        </div>
      </div>
    );
  } else {
    const visible = n > 9 && !showAll ? foto.slice(0, 9) : foto;
    grid = (
      <>
        <div className="grid grid-cols-3 gap-2 [grid-auto-rows:6.5rem] sm:[grid-auto-rows:7.5rem]">
          {visible.map((s, i) => (
            <Tile
              key={i}
              src={s || undefined}
              index={i}
              onOpen={onOpen}
              polaroid={polaroid}
              blur={blur?.[i]}
              className={`h-full w-full ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
            />
          ))}
        </div>
        {n > 9 && !showAll && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAll(true)}
              className="rounded-full border border-accent px-5 py-2 text-xs font-medium text-primary hover:bg-accent hover:text-white"
            >
              Lihat semua {n} foto
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <SectionShell style={style}>
      <SectionHeading
        motifId={motifId}
        overline="Gallery"
        title="Galeri Kami"
        align={style.headingAlign}
        variant={style.headingStyle}
        className="mb-8"
      />
      {grid}
      {open != null && realFotos.length > 0 && (
        <Lightbox
          foto={realFotos}
          index={Math.min(open, realFotos.length - 1)}
          onClose={() => setOpen(null)}
          onNav={setOpen}
        />
      )}
    </SectionShell>
  );
}
