import React from 'react';
import type { DataUndangan } from '../types';
import type { LayoutStyle } from '../layout-styles';
import { SectionShell } from '../SectionShell';
import { SectionHeading } from '../Ornaments';
import { FotoSlot } from '../FotoSlot';
import { tanggalSedang } from '../format';

// ============================================================================
// Love story — timeline vertikal 2–4 momen, tiap momen boleh berfoto.
// ============================================================================

export function CeritaCinta({
  data,
  style,
  motifId,
}: {
  data: DataUndangan;
  style: LayoutStyle;
  motifId: string;
}) {
  const momen = data.ceritaCinta ?? [];
  if (momen.length === 0) return null;

  return (
    <SectionShell style={style}>
      <SectionHeading
        motifId={motifId}
        overline="Our Journey"
        title="Perjalanan Cinta"
        align={style.headingAlign}
        variant={style.headingStyle}
        className="mb-8"
      />
      <ol className="relative ml-3 space-y-8 border-l border-[color-mix(in_srgb,var(--accent)_40%,transparent)] pl-6">
        {momen.slice(0, 4).map((m, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent ring-4 ring-page" />
            {m.foto && (
              <div className="mb-3 w-40 rotate-[-1.5deg]">
                <FotoSlot src={m.foto} alt={m.judul} ratio="4/3" rounded="rounded-lg" monogram="❦" />
              </div>
            )}
            <h3 className="font-heading text-lg font-semibold text-primary">{m.judul}</h3>
            {m.tanggal && (
              <p className="text-xs font-medium uppercase tracking-widest text-accent">
                {tanggalSedang(m.tanggal)}
              </p>
            )}
            <p className="mt-1 text-sm leading-relaxed text-ink">{m.deskripsi}</p>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
