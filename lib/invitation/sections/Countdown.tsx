'use client';

import React, { useEffect, useState } from 'react';
import type { LayoutStyle } from '../layout-styles';
import { SectionShell } from '../SectionShell';
import { SectionHeading } from '../Ornaments';
import { hitungMundur } from '../format';

// ============================================================================
// Hitung mundur real-time ke tanggal acara. Aman-hidrasi (mulai dari mounted).
// ============================================================================

function Kotak({ nilai, label }: { nilai: number; label: string }) {
  return (
    <div className="flex min-w-[3.75rem] flex-col items-center rounded-xl bg-page/50 px-2 py-3 ring-1 ring-[color-mix(in_srgb,var(--accent)_30%,transparent)] sm:min-w-[4.25rem]">
      <span className="font-heading text-2xl font-semibold tabular-nums text-primary sm:text-3xl">
        {String(nilai).padStart(2, '0')}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-widest text-muted">{label}</span>
    </div>
  );
}

export function Countdown({
  target,
  style,
  motifId,
}: {
  target: string;
  style: LayoutStyle;
  motifId: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const s = now == null ? { hari: 0, jam: 0, menit: 0, detik: 0, lewat: false } : hitungMundur(target, now);

  return (
    <SectionShell style={style}>
      <SectionHeading
        motifId={motifId}
        overline="Counting Down"
        title="Menuju Hari Bahagia"
        align={style.headingAlign}
        variant={style.headingStyle}
        className="mb-7"
      />
      {s.lewat ? (
        <p className="text-center font-heading text-lg text-primary">
          Alhamdulillah, hari bahagia telah tiba. Terima kasih atas doa restunya.
        </p>
      ) : (
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <Kotak nilai={s.hari} label="Hari" />
          <Kotak nilai={s.jam} label="Jam" />
          <Kotak nilai={s.menit} label="Menit" />
          <Kotak nilai={s.detik} label="Detik" />
        </div>
      )}
    </SectionShell>
  );
}
