import React from 'react';
import type { DataUndangan, Mempelai as MempelaiData } from '../types';
import type { LayoutStyle } from '../layout-styles';
import { SectionShell } from '../SectionShell';
import { SectionHeading } from '../Ornaments';
import { FotoSlot } from '../FotoSlot';

// ============================================================================
// Mempelai — foto masing-masing (rasio 4:5, bingkai ornamen), nama+gelar,
// orang tua, IG opsional. Tampilan mengikuti varian layout:
//   card · polaroid · royal · editorial · side (2 kolom) · stamp (perangko)
// ============================================================================

function IgLink({ handle }: { handle: string }) {
  return (
    <a
      href={`https://instagram.com/${handle.replace(/^@/, '')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
      </svg>
      @{handle.replace(/^@/, '')}
    </a>
  );
}

function OrangCard({
  m,
  variant,
  align = 'center',
}: {
  m: MempelaiData;
  variant: LayoutStyle['mempelai'];
  align?: 'center' | 'left';
}) {
  const initial = (m.panggilan[0] ?? '❦').toUpperCase();
  const polaroid = variant === 'polaroid';
  const editorial = variant === 'editorial';
  const royal = variant === 'royal';
  const side = variant === 'side';
  const stamp = variant === 'stamp';
  const arch = variant === 'arch';
  const circular = variant === 'circular';
  const tape = variant === 'tape';
  const compact = side || stamp;

  const photoWrap = polaroid
    ? 'mx-auto w-48 rotate-[-2deg] bg-white p-2 pb-8 shadow-md sm:w-52'
    : royal || circular
      ? 'mx-auto w-40 sm:w-44'
      : editorial
        ? 'mx-auto w-full max-w-xs'
        : side
          ? 'mx-auto w-full'
          : stamp
            ? 'mx-auto w-44 rotate-[-1.5deg] border-2 border-dashed bg-white p-1.5 shadow-sm'
            : tape
              ? 'relative mx-auto w-48 rotate-[-2deg] bg-white p-2 pb-7 shadow-md'
              : arch
                ? 'mx-auto w-44 sm:w-48'
                : 'mx-auto w-48 sm:w-52';

  const rounded = polaroid
    ? 'rounded-sm'
    : royal || circular
      ? 'rounded-full'
      : stamp
        ? 'rounded-none'
        : tape
          ? 'rounded-sm'
          : arch
            ? 'rounded-b-md rounded-t-[5rem]'
            : 'rounded-2xl';

  return (
    <div className={align === 'left' ? 'text-left' : 'text-center'}>
      <div
        className={photoWrap}
        style={stamp ? { borderColor: 'color-mix(in srgb, var(--accent) 55%, transparent)' } : undefined}
      >
        {tape && (
          <>
            <span className="pointer-events-none absolute -left-3 -top-2 h-4 w-14 rotate-[-20deg] bg-[color-mix(in_srgb,var(--accent)_35%,transparent)]" />
            <span className="pointer-events-none absolute -right-3 -top-2 h-4 w-14 rotate-[18deg] bg-[color-mix(in_srgb,var(--accent)_35%,transparent)]" />
          </>
        )}
        <FotoSlot
          src={m.foto}
          alt={m.namaLengkap}
          ratio="4/5"
          frame={!polaroid && !stamp && !tape && !arch}
          monogram={initial}
          rounded={rounded}
          objectPosition={m.fotoFokus}
          blurDataUrl={m.fotoBlur}
        />
      </div>
      <h3
        className={`mt-4 font-heading font-semibold text-primary ${
          editorial ? 'text-2xl sm:text-3xl' : compact ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'
        }`}
      >
        {m.namaLengkap}
      </h3>
      {m.urutan && <p className="mt-1 text-xs text-muted sm:text-sm">{m.urutan}</p>}
      <p className={`mt-1 leading-relaxed text-ink ${compact ? 'text-xs' : 'text-sm'}`}>
        Bapak {m.ayah}
        <br />
        &amp; Ibu {m.ibu}
      </p>
      {m.instagram && <IgLink handle={m.instagram} />}
    </div>
  );
}

function Ampersand() {
  return (
    <div className="flex items-center justify-center py-1" aria-hidden>
      <span className="font-script text-5xl leading-none text-accent sm:text-6xl">&amp;</span>
    </div>
  );
}

export function Mempelai({
  data,
  style,
  motifId,
}: {
  data: DataUndangan;
  style: LayoutStyle;
  motifId: string;
}) {
  const { pria, wanita } = data.mempelai;
  const first = data.urutanNama === 'wanita-dulu' ? wanita : pria;
  const second = data.urutanNama === 'wanita-dulu' ? pria : wanita;
  const v = style.mempelai;

  const heading = (
    <SectionHeading
      motifId={motifId}
      // Dulu "Bismillah" TANPA kondisi → label Islami terpampang di ke-304 tema,
      // termasuk seluruh tema China, Jepang, dan Barat. Sekarang ia hanya tampil
      // bila pasangan memang memilih konten Islami.
      // TODO(R7): seluruh overline masih hardcoded & campur bahasa ("Counting
      // Down", "Our Journey", "Lokasi Acara"). Jadikan configurable dari content
      // layer agar bisa sadar-tema.
      overline={data.islami ? 'Bismillah' : undefined}
      title="Mempelai"
      align={style.headingAlign}
      variant={style.headingStyle}
      className="mb-8"
    />
  );

  // Varian 2 kolom (side) — untuk layout minimalis/split.
  if (v === 'side') {
    return (
      <SectionShell style={style}>
        {heading}
        <div className="grid grid-cols-2 gap-4">
          <OrangCard m={first} variant="side" />
          <OrangCard m={second} variant="side" />
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell style={style}>
      {heading}

      {v === 'royal' && (
        <div className="mb-6 text-center">
          <span className="inline-flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent font-heading text-2xl font-semibold text-primary">
            {(first.panggilan[0] ?? '').toUpperCase()}
            {(second.panggilan[0] ?? '').toUpperCase()}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <OrangCard m={first} variant={v} />
        <Ampersand />
        <OrangCard m={second} variant={v} />
      </div>
    </SectionShell>
  );
}
