import React from 'react';
import type { DataUndangan, Acara as AcaraData } from '../types';
import type { LayoutStyle } from '../layout-styles';
import { SectionShell } from '../SectionShell';
import { SectionHeading } from '../Ornaments';
import { MotifDivider } from '@/lib/engine/motifs';
import {
  tanggalPanjang,
  rentangWaktu,
  googleCalendarUrl,
} from '../format';

// ============================================================================
// Rangkaian acara — akad & resepsi (atau custom), + tombol Google Calendar.
// ============================================================================

function IconCal() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function AcaraCard({ a }: { a: AcaraData }) {
  const tz = a.zonaWaktu ?? 'WIB';
  const calUrl = googleCalendarUrl({
    judul: a.nama,
    tanggal: a.tanggal,
    waktuMulai: a.waktuMulai,
    waktuSelesai: a.waktuSelesai,
    lokasi: [a.tempat, a.alamat].filter(Boolean).join(', '),
    detail: `Acara ${a.nama}`,
  });

  return (
    <div className="rounded-2xl border border-[color-mix(in_srgb,var(--accent)_28%,transparent)] bg-page/40 px-5 py-6 text-center">
      <h3 className="font-heading text-xl font-semibold text-primary sm:text-2xl">{a.nama}</h3>
      <div className="mx-auto mt-3 max-w-xs space-y-2 text-sm text-ink">
        <p className="flex items-center justify-center gap-2">
          <span className="text-accent"><IconCal /></span>
          {tanggalPanjang(a.tanggal)}
        </p>
        {(a.waktuMulai || a.waktuSelesai) && (
          <p className="flex items-center justify-center gap-2">
            <span className="text-accent"><IconClock /></span>
            {rentangWaktu(a.waktuMulai, a.waktuSelesai, tz)}
          </p>
        )}
        <p className="flex items-start justify-center gap-2">
          <span className="mt-0.5 text-accent"><IconPin /></span>
          <span>
            <span className="font-medium">{a.tempat}</span>
            {a.alamat && <span className="block text-xs text-muted">{a.alamat}</span>}
          </span>
        </p>
      </div>
      <a
        href={calUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-accent px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-accent hover:text-white"
      >
        <IconCal /> Simpan ke Google Calendar
      </a>
    </div>
  );
}

export function Acara({
  data,
  style,
  motifId,
}: {
  data: DataUndangan;
  style: LayoutStyle;
  motifId: string;
}) {
  return (
    <SectionShell style={style}>
      <SectionHeading
        motifId={motifId}
        overline="Save the Date"
        title="Rangkaian Acara"
        align={style.headingAlign}
        variant={style.headingStyle}
        className="mb-8"
      />
      <div className="space-y-5">
        {data.acara.map((a, i) => (
          <React.Fragment key={i}>
            <AcaraCard a={a} />
            {i < data.acara.length - 1 && (
              <div className="flex justify-center">
                <MotifDivider motifId={motifId} color="var(--accent)" width={120} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </SectionShell>
  );
}
