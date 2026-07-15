'use client';

import React, { useEffect, useState } from 'react';
import { getTemaBySlug, type TemaResolved } from '@/lib/engine';
import { Invitation } from '@/lib/invitation';
import type { DataUndangan } from '@/lib/invitation/types';
import { draftToData, DEFAULT_DRAFT, STUDIO_KEY, type Draft } from '@/lib/studio/draft';

// Target iframe pratinjau studio — membaca draft dari localStorage & merender
// undangan. Key draft via ?k= (default STUDIO_KEY) agar studio & admin bisa
// pakai slot draft berbeda. (Halaman internal; noindex via metadata studio.)

export default function StudioPreview() {
  const [state, setState] = useState<{ data: DataUndangan; tema: TemaResolved } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get('k') || STUDIO_KEY;
    let d: Draft = DEFAULT_DRAFT;
    try {
      const raw = localStorage.getItem(key);
      if (raw) d = { ...DEFAULT_DRAFT, ...JSON.parse(raw) };
    } catch {
      /* pakai default */
    }
    const tema = getTemaBySlug(d.temaSlug);
    if (!tema) {
      setError(`Tema "${d.temaSlug}" tidak ditemukan.`);
      return;
    }
    setState({ data: draftToData(d), tema });
  }, []);

  if (error) {
    return <div className="flex min-h-screen items-center justify-center p-6 text-center text-sm text-brand-muted">{error}</div>;
  }
  if (!state) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-brand-muted">Memuat pratinjau…</div>;
  }
  return <Invitation data={state.data} tema={state.tema} guestName="Tamu Undangan" />;
}
