import React from 'react';
import type { TemaResolved } from '@/lib/engine';
import type { DataUndangan } from './types';
import type { LayoutStyle, SectionId } from './layout-styles';
import { getSignature } from './layout-styles';
import { Pembuka } from './sections/Pembuka';
import { Countdown } from './sections/Countdown';
import { Mempelai } from './sections/Mempelai';
import { CeritaCinta } from './sections/CeritaCinta';
import { Acara } from './sections/Acara';
import { Peta } from './sections/Peta';
import { Galeri } from './sections/Galeri';
import { LiveStreaming } from './sections/LiveStreaming';
import { RSVP } from './sections/RSVP';
import { AmplopDigital } from './sections/AmplopDigital';
import { Penutup } from './sections/Penutup';

// ============================================================================
// Komposer isi undangan — satu komposer untuk SEMUA layout (Prinsip Utama #1).
//
// Urutannya TIDAK lagi hardcoded. Dulu kesebelas bagian dirangkai dalam satu
// urutan tetap untuk 300 tema, sehingga setelah sampul dibuka semua tema tampil
// nyaris sama. Sekarang tatanan datang dari `style.urutan`, dan ciri khas budaya
// (`signature`) diturunkan dari tema — bukan dari layout — supaya dua tema
// berbudaya beda yang kebetulan memakai layout sama tetap punya karakter beda.
// ============================================================================

export function InvitationBody({
  data,
  tema,
  style,
  guestName,
  clientSlug,
}: {
  data: DataUndangan;
  tema: TemaResolved;
  style: LayoutStyle;
  guestName?: string;
  clientSlug?: string;
}) {
  const motifId = tema.motifId;
  const signature = getSignature(tema.budaya);

  // Record<SectionId, …> yang lengkap: menambah SectionId tanpa merendernya di
  // sini akan gagal saat tsc, bukan diam-diam hilang dari halaman tamu.
  const bagian: Record<SectionId, React.ReactNode> = {
    pembuka: <Pembuka data={data} style={style} motifId={motifId} signature={signature} />,
    countdown: <Countdown target={data.tanggalUtama} style={style} motifId={motifId} />,
    mempelai: <Mempelai data={data} style={style} motifId={motifId} />,
    cerita: <CeritaCinta data={data} style={style} motifId={motifId} />,
    acara: <Acara data={data} style={style} motifId={motifId} />,
    peta: <Peta data={data} style={style} motifId={motifId} />,
    galeri: <Galeri foto={data.galeri ?? []} blur={data.galeriBlur} style={style} motifId={motifId} />,
    live: <LiveStreaming data={data} style={style} motifId={motifId} />,
    rsvp: (
      <RSVP
        seed={data.ucapanContoh ?? []}
        defaultNama={guestName}
        style={style}
        motifId={motifId}
        clientSlug={clientSlug}
      />
    ),
    amplop: <AmplopDigital data={data} style={style} motifId={motifId} />,
    penutup: <Penutup data={data} style={style} motifId={motifId} namaTema={tema.namaTampilan} />,
  };

  return (
    <div className={`relative z-10 mx-auto w-full ${style.containerClass} pb-16 pt-10`}>
      {style.urutan.map((id) => (
        <React.Fragment key={id}>{bagian[id]}</React.Fragment>
      ))}
    </div>
  );
}
