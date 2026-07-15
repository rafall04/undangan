import React from 'react';
import { MotifDivider } from '@/lib/engine/motifs';
import type { HeadingStyle } from './layout-styles';

// ============================================================================
// Ornamen bersama: judul bagian (3 gaya) + pembungkus divider.
//   script-serif  → overline script + judul serif + divider motif (default)
//   uppercase-thin→ judul kapital tipis ber-tracking + garis rambut (minimalis)
//   double-rule   → judul serif diapit garis ganda (kartu cetak/timeless)
// ============================================================================

export function SectionHeading({
  motifId,
  overline,
  title,
  align = 'center',
  variant = 'script-serif',
  className = '',
}: {
  motifId: string;
  overline?: string;
  title: string;
  align?: 'center' | 'left';
  variant?: HeadingStyle;
  className?: string;
}) {
  const alignCls = align === 'center' ? 'text-center' : 'text-left';

  if (variant === 'uppercase-thin') {
    return (
      <header className={`${alignCls} ${className}`}>
        {overline && (
          <p className="text-[11px] uppercase tracking-[0.35em] text-accent">{overline}</p>
        )}
        <h2 className="mt-2 font-heading text-lg font-light uppercase tracking-[0.28em] text-primary sm:text-xl">
          {title}
        </h2>
        <div className={`mt-3 ${align === 'center' ? 'flex justify-center' : ''}`}>
          <span className="block h-px w-12 bg-accent" />
        </div>
      </header>
    );
  }

  if (variant === 'double-rule') {
    return (
      <header className={`${alignCls} ${className}`}>
        {overline && (
          <p className="text-[11px] uppercase tracking-[0.3em] text-accent">{overline}</p>
        )}
        <div className={`mt-2 flex items-center gap-3 ${align === 'center' ? 'justify-center' : ''}`}>
          <span className="h-px w-8 bg-[color-mix(in_srgb,var(--accent)_60%,transparent)] sm:w-12" />
          <h2 className="font-heading text-2xl font-semibold tracking-wide text-primary sm:text-3xl">
            {title}
          </h2>
          <span className="h-px w-8 bg-[color-mix(in_srgb,var(--accent)_60%,transparent)] sm:w-12" />
        </div>
        <div className={`mt-2 ${align === 'center' ? 'flex justify-center' : ''}`}>
          <span className="block h-px w-24 bg-[color-mix(in_srgb,var(--accent)_35%,transparent)]" />
        </div>
      </header>
    );
  }

  if (variant === 'ornate') {
    return (
      <header className={`${alignCls} ${className}`}>
        <div className={align === 'center' ? 'mb-1 flex justify-center' : 'mb-1'}>
          <MotifDivider motifId={motifId} color="var(--accent)" width={130} />
        </div>
        {overline && <p className="font-script text-2xl leading-none text-accent sm:text-3xl">{overline}</p>}
        <h2 className="mt-1 font-heading text-2xl font-semibold tracking-wide text-primary sm:text-3xl">{title}</h2>
        <div className={align === 'center' ? 'mt-2 flex justify-center' : 'mt-2'}>
          <MotifDivider motifId={motifId} color="var(--accent)" width={200} />
        </div>
      </header>
    );
  }

  // default: script-serif
  return (
    <header className={`${alignCls} ${className}`}>
      {overline && (
        <p className="font-script text-2xl leading-none text-accent sm:text-3xl">{overline}</p>
      )}
      <h2 className="mt-2 font-heading text-2xl font-semibold tracking-wide text-primary sm:text-3xl">
        {title}
      </h2>
      <div className={align === 'center' ? 'mt-3 flex justify-center' : 'mt-3'}>
        <MotifDivider motifId={motifId} color="var(--accent)" width={220} />
      </div>
    </header>
  );
}

export function Divider({
  motifId,
  className = '',
  width = 200,
}: {
  motifId: string;
  className?: string;
  width?: number;
}) {
  return (
    <div className={`flex justify-center ${className}`}>
      <MotifDivider motifId={motifId} color="var(--accent)" width={width} />
    </div>
  );
}
