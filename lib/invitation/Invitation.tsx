'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { TemaResolved } from '@/lib/engine';
import type { DataUndangan } from './types';
import { getLayoutStyle } from './layout-styles';
import { temaCssVars, MOTIFS_META } from '@/lib/engine';
import { MotifPattern, MotifCorner } from '@/lib/engine/motifs';
import { overrideCssVars, customFontFaceCss } from './overrides';
import { track } from '@/lib/analytics';
import { Cover } from './sections/Cover';
import { MusikButton } from './sections/Musik';
import { InvitationBody } from './InvitationBody';
import { Petals } from './Petals';

// ============================================================================
// Orkestrator undangan (client): gerbang cover → buka → tampil isi + musik.
// Memiliki elemen <audio> agar play() dipanggil di dalam gesture buka.
// Menempelkan variabel CSS tema, latar motif, dan bingkai (layout framed).
// ============================================================================

export function Invitation({
  data,
  tema,
  guestName,
  analyticsContext,
  clientSlug,
}: {
  data: DataUndangan;
  tema: TemaResolved;
  guestName?: string;
  analyticsContext?: string;
  /** Slug undangan klien nyata → RSVP persisten. Kosong pada demo tema. */
  clientSlug?: string;
}) {
  const style = getLayoutStyle(tema.layoutId);

  // Motif efektif (override client bila ada) → tema turunan.
  const temaEff = useMemo(() => {
    if (!data.motifOverride || data.motifOverride === tema.motifId) return tema;
    const m = MOTIFS_META.find((x) => x.id === data.motifOverride);
    return m ? { ...tema, motifId: m.id, motif: m } : tema;
  }, [tema, data.motifOverride]);

  const rootStyle = useMemo(
    () => ({ ...temaCssVars(temaEff), ...overrideCssVars(data), backgroundColor: 'var(--bg)' }),
    [temaEff, data],
  );
  const fontFaceCss = useMemo(() => customFontFaceCss(data), [data]);

  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [petals, setPetals] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Kelopak hanya hidup sebentar sesudah dibuka, lalu di-unmount (nol biaya).
  useEffect(() => {
    if (!petals) return;
    const t = setTimeout(() => setPetals(false), 9000);
    return () => clearTimeout(t);
  }, [petals]);

  // Nama tamu (?to=) dibaca di CLIENT, bukan server — agar halaman undangan bisa
  // di-cache/ISR (server tak lagi bergantung pada searchParams). Prop guestName
  // (dipakai demo/studio) tetap diprioritaskan bila ada.
  const [urlGuest, setUrlGuest] = useState<string | undefined>(undefined);
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('to');
    if (t) setUrlGuest(t);
  }, []);
  const guest = guestName ?? urlGuest;

  // Kunci scroll sebelum undangan dibuka.
  useEffect(() => {
    document.body.style.overflow = opened ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [opened]);

  function handleOpen() {
    setOpened(true);
    setPetals(true);
    track('invitation_open', { context: analyticsContext, theme: tema.slug });
    // Mulai musik di dalam gesture agar tidak diblokir autoplay.
    const a = audioRef.current;
    if (a) {
      a.volume = 0.7;
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
    // Scroll ke atas isi.
    requestAnimationFrame(() => window.scrollTo({ top: 0 }));
  }

  function toggleMusik() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else {
      a.pause();
      setPlaying(false);
    }
  }

  return (
    <div className="invite-root relative min-h-screen font-body text-ink" style={rootStyle}>
      {fontFaceCss && <style dangerouslySetInnerHTML={{ __html: fontFaceCss }} />}

      {/* Latar motif tetap (di belakang konten) */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <MotifPattern
          motifId={temaEff.motifId}
          color="var(--primary)"
          opacity={style.patternOpacity}
          scale={style.patternScale}
        />
      </div>

      {/* Isi undangan (selalu ada; cover menutupinya sampai dibuka) */}
      <InvitationBody data={data} tema={temaEff} style={style} guestName={guest} clientSlug={clientSlug} />

      {/* Bingkai ornamen untuk layout framed */}
      {style.framed && (
        <div className="pointer-events-none fixed inset-0 z-30 hidden sm:block">
          <span className="absolute inset-3 rounded-xl border border-[color-mix(in_srgb,var(--accent)_45%,transparent)]" />
          <MotifCorner motifId={temaEff.motifId} color="var(--accent)" size={70} className="absolute left-2 top-2" />
          <MotifCorner motifId={temaEff.motifId} color="var(--accent)" size={70} className="absolute right-2 top-2 -scale-x-100" />
          <MotifCorner motifId={temaEff.motifId} color="var(--accent)" size={70} className="absolute bottom-2 left-2 -scale-y-100" />
          <MotifCorner motifId={temaEff.motifId} color="var(--accent)" size={70} className="absolute bottom-2 right-2 -scale-100" />
        </div>
      )}

      {/* Musik */}
      {data.musik?.src && (
        <>
          <audio ref={audioRef} src={data.musik.src} loop preload="none" />
          {opened && <MusikButton playing={playing} onToggle={toggleMusik} judul={data.musik.judul} />}
        </>
      )}

      {/* Kelopak jatuh sesaat setelah dibuka (CSS murni, auto-unmount) */}
      {petals && <Petals />}

      {/* Cover overlay — dibuka dengan gerak "tirai naik" (transform+opacity, GPU) */}
      <div
        className={`fixed inset-0 z-40 transition-[transform,opacity] duration-[900ms] ${
          opened ? 'pointer-events-none -translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.7, 0, 0.25, 1)' }}
        aria-hidden={opened}
      >
        <Cover data={data} tema={temaEff} guestName={guest} variant={style.cover} onOpen={handleOpen} />
      </div>
    </div>
  );
}
