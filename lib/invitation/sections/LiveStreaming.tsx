import React from 'react';
import type { DataUndangan } from '../types';
import type { LayoutStyle } from '../layout-styles';
import { SectionShell } from '../SectionShell';
import { SectionHeading } from '../Ornaments';

// ============================================================================
// Siaran langsung (live streaming) — tautan YouTube/Instagram/Facebook/umum
// untuk tamu yang berhalangan hadir. Hanya tampil bila ada minimal 1 tautan.
// ============================================================================

const PLAY = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8 5v14l11-7z" />
  </svg>
);

export function LiveStreaming({
  data,
  style,
  motifId,
}: {
  data: DataUndangan;
  style: LayoutStyle;
  motifId: string;
}) {
  const ls = data.liveStreaming;
  const links = [
    ls?.youtube && { label: 'YouTube', href: ls.youtube, bg: '#FF0000' },
    ls?.instagram && { label: 'Instagram', href: ls.instagram, bg: '#E1306C' },
    ls?.facebook && { label: 'Facebook', href: ls.facebook, bg: '#1877F2' },
    ls?.link && { label: 'Tonton Live', href: ls.link, bg: 'var(--primary)' },
  ].filter(Boolean) as Array<{ label: string; href: string; bg: string }>;

  if (!ls || links.length === 0) return null;

  return (
    <SectionShell style={style}>
      <SectionHeading
        motifId={motifId}
        overline="Live Streaming"
        title={ls.judul || 'Siaran Langsung'}
        align={style.headingAlign}
        variant={style.headingStyle}
        className="mb-6"
      />

      <p className="mx-auto max-w-md text-center text-sm leading-relaxed text-muted">
        {ls.deskripsi ||
          'Bagi Bapak/Ibu/Saudara/i yang berhalangan hadir, acara kami dapat disaksikan secara langsung melalui tautan berikut.'}
      </p>

      {(ls.tanggal || ls.waktu) && (
        <p className="mt-3 text-center text-sm font-medium text-primary">
          {ls.tanggal}
          {ls.tanggal && ls.waktu ? ' · ' : ''}
          {ls.waktu}
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ background: l.bg }}
          >
            {PLAY}
            {l.label}
          </a>
        ))}
      </div>
    </SectionShell>
  );
}
