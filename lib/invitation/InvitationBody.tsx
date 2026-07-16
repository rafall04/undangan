import React from 'react';
import type { TemaResolved } from '@/lib/engine';
import type { DataUndangan } from './types';
import type { LayoutStyle } from './layout-styles';
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
// Komposer isi undangan — merangkai semua bagian sesuai gaya layout.
// Satu komposer untuk kelima layout (Prinsip Utama #1).
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
  return (
    <div className={`relative z-10 mx-auto w-full ${style.containerClass} pb-16 pt-10`}>
      <Pembuka data={data} style={style} motifId={motifId} />
      <Countdown target={data.tanggalUtama} style={style} motifId={motifId} />
      <Mempelai data={data} style={style} motifId={motifId} />
      <CeritaCinta data={data} style={style} motifId={motifId} />
      <Acara data={data} style={style} motifId={motifId} />
      <Peta data={data} style={style} motifId={motifId} />
      <Galeri foto={data.galeri ?? []} blur={data.galeriBlur} style={style} motifId={motifId} />
      <LiveStreaming data={data} style={style} motifId={motifId} />
      <RSVP
        seed={data.ucapanContoh ?? []}
        defaultNama={guestName}
        style={style}
        motifId={motifId}
        clientSlug={clientSlug}
      />
      <AmplopDigital data={data} style={style} motifId={motifId} />
      <Penutup data={data} style={style} motifId={motifId} namaTema={tema.namaTampilan} />
    </div>
  );
}
