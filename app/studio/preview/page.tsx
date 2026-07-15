'use client';

import React, { useEffect, useState } from 'react';
import { getTemaBySlug, type TemaResolved } from '@/lib/engine';
import { Invitation } from '@/lib/invitation';
import type { DataUndangan } from '@/lib/invitation/types';
import { loadDraft, draftToData } from '@/lib/studio/draft';

// Target iframe pratinjau studio — membaca draft dari localStorage & merender
// undangan. (Halaman internal; noindex via metadata studio.)

export default function StudioPreview() {
  const [state, setState] = useState<{ data: DataUndangan; tema: TemaResolved } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const d = loadDraft();
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
