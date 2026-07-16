import React from 'react';
import type { DataUndangan, Acara as AcaraData } from '../types';
import type { LayoutStyle } from '../layout-styles';
import { SectionShell } from '../SectionShell';
import { SectionHeading } from '../Ornaments';
import { MotifDivider } from '@/lib/engine/motifs';
import { tanggalPanjang, rentangWaktu, googleCalendarUrl } from '../format';

// ============================================================================
// Rangkaian acara — akad & resepsi (atau custom), + tombol Google Calendar.
//
// EMPAT varian struktur. Tombol kalender & seluruh detail (tanggal/waktu/
// tempat/alamat) wajib ada di SEMUA varian — ini bagian paling fungsional dari
// undangan; varian hanya boleh mengubah tata letaknya, bukan menguranginya.
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

function calUrlOf(a: AcaraData) {
  return googleCalendarUrl({
    judul: a.nama,
    tanggal: a.tanggal,
    waktuMulai: a.waktuMulai,
    waktuSelesai: a.waktuSelesai,
    lokasi: [a.tempat, a.alamat].filter(Boolean).join(', '),
    detail: `Acara ${a.nama}`,
  });
}

function TombolKalender({ a, className = '' }: { a: AcaraData; className?: string }) {
  return (
    <a
      href={calUrlOf(a)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 rounded-full border border-accent px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-accent hover:text-white ${className}`}
    >
      <IconCal /> Simpan ke Google Calendar
    </a>
  );
}

/** Baris detail dipakai ulang oleh semua varian agar isinya tak pernah beda. */
function Detail({ a, align }: { a: AcaraData; align: 'center' | 'left' }) {
  const tz = a.zonaWaktu ?? 'WIB';
  const j = align === 'center' ? 'justify-center' : 'justify-start';
  return (
    <div className={`space-y-2 text-sm text-ink ${align === 'center' ? 'mx-auto max-w-xs' : ''}`}>
      <p className={`flex items-center gap-2 ${j}`}>
        <span className="text-accent">
          <IconCal />
        </span>
        {tanggalPanjang(a.tanggal)}
      </p>
      {(a.waktuMulai || a.waktuSelesai) && (
        <p className={`flex items-center gap-2 ${j}`}>
          <span className="text-accent">
            <IconClock />
          </span>
          {rentangWaktu(a.waktuMulai, a.waktuSelesai, tz)}
        </p>
      )}
      <p className={`flex items-start gap-2 ${j}`}>
        <span className="mt-0.5 shrink-0 text-accent">
          <IconPin />
        </span>
        <span className={align === 'center' ? '' : 'min-w-0'}>
          <span className="font-medium">{a.tempat}</span>
          {a.alamat && <span className="block text-xs text-muted">{a.alamat}</span>}
        </span>
      </p>
    </div>
  );
}

// --- Varian: kartu (lama) ---------------------------------------------------
function VarCard({ acara, motifId }: { acara: AcaraData[]; motifId: string }) {
  return (
    <div className="space-y-5">
      {acara.map((a, i) => (
        <React.Fragment key={i}>
          <div className="rounded-2xl border border-[color-mix(in_srgb,var(--accent)_28%,transparent)] bg-page/40 px-5 py-6 text-center">
            <h3 className="font-heading text-xl font-semibold text-primary sm:text-2xl">{a.nama}</h3>
            <div className="mt-3">
              <Detail a={a} align="center" />
            </div>
            <TombolKalender a={a} className="mt-4" />
          </div>
          {i < acara.length - 1 && (
            <div className="flex justify-center">
              <MotifDivider motifId={motifId} color="var(--accent)" width={120} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// --- Varian: garis waktu ----------------------------------------------------
// Acara digantung pada satu garis vertikal dengan simpul — urutan waktu jadi
// terbaca sebagai alur, bukan tumpukan kartu terpisah.
function VarTimeline({ acara }: { acara: AcaraData[] }) {
  return (
    <ol className="relative ml-1.5 space-y-8">
      <span
        aria-hidden
        className="absolute bottom-2 left-0 top-2 w-px bg-[color-mix(in_srgb,var(--accent)_35%,transparent)]"
      />
      {acara.map((a, i) => (
        <li key={i} className="relative pl-6">
          <span
            aria-hidden
            className="absolute -left-[4.5px] top-1.5 h-[9px] w-[9px] rounded-full bg-accent ring-4 ring-[var(--surface)]"
          />
          <h3 className="font-heading text-xl font-semibold leading-tight text-primary sm:text-2xl">
            {a.nama}
          </h3>
          <div className="mt-2.5">
            <Detail a={a} align="left" />
          </div>
          <TombolKalender a={a} className="mt-3.5" />
        </li>
      ))}
    </ol>
  );
}

// --- Varian: sobekan tiket --------------------------------------------------
// Judul acara di "batang" tiket kiri (vertikal), detail di badan kanan,
// dipisah garis perforasi bulat.
function VarStub({ acara }: { acara: AcaraData[] }) {
  return (
    <div className="space-y-5">
      {acara.map((a, i) => (
        <div
          key={i}
          className="flex overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-page/40"
        >
          <div className="flex shrink-0 items-center justify-center bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] px-2.5 py-5">
            <span
              className="font-heading text-sm font-semibold uppercase tracking-[0.25em] text-primary"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
            >
              {a.nama}
            </span>
          </div>
          <span
            aria-hidden
            className="my-2 w-px shrink-0 self-stretch border-l border-dashed border-[color-mix(in_srgb,var(--accent)_55%,transparent)]"
          />
          <div className="min-w-0 flex-1 px-4 py-5">
            <Detail a={a} align="left" />
            <TombolKalender a={a} className="mt-3.5" />
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Varian: dua kolom ------------------------------------------------------
// Akad & resepsi berdampingan (menumpuk di layar sempit). Cocok untuk layout
// simetris/minimalis. Bila acaranya cuma satu, ia melebar penuh dengan sendirinya.
function VarDuo({ acara }: { acara: AcaraData[] }) {
  return (
    <div className={`grid gap-4 ${acara.length > 1 ? 'sm:grid-cols-2' : ''}`}>
      {acara.map((a, i) => (
        <div
          key={i}
          className="border-t-2 border-accent/60 px-1 pt-4 text-center"
        >
          <h3 className="font-heading text-lg font-semibold text-primary sm:text-xl">{a.nama}</h3>
          <div className="mt-3">
            <Detail a={a} align="center" />
          </div>
          <TombolKalender a={a} className="mt-4" />
        </div>
      ))}
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
  let inner: React.ReactNode;
  switch (style.acara) {
    case 'timeline':
      inner = <VarTimeline acara={data.acara} />;
      break;
    case 'stub':
      inner = <VarStub acara={data.acara} />;
      break;
    case 'duo':
      inner = <VarDuo acara={data.acara} />;
      break;
    default:
      inner = <VarCard acara={data.acara} motifId={motifId} />;
  }

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
      {inner}
    </SectionShell>
  );
}
