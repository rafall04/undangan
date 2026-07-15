'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { LayoutStyle } from '../layout-styles';
import type { Ucapan, StatusKehadiran } from '../types';
import { SectionShell } from '../SectionShell';
import { SectionHeading } from '../Ornaments';
import { createInMemoryWishesProvider, createHttpWishesProvider } from '../wishes';
import { track } from '@/lib/analytics';

// ============================================================================
// RSVP & ucapan — form nama/kehadiran/ucapan, tampil di daftar.
// Memakai WishesProvider (in-memory + contoh) agar kelak mudah diganti backend.
// ============================================================================

const LABEL: Record<StatusKehadiran, string> = {
  hadir: 'Hadir',
  tidak: 'Tidak Hadir',
  ragu: 'Masih Ragu',
};
const BADGE: Record<StatusKehadiran, string> = {
  hadir: 'bg-green-600/12 text-green-800',
  tidak: 'bg-red-600/12 text-red-800',
  ragu: 'bg-amber-600/14 text-amber-800',
};

export function RSVP({
  seed,
  defaultNama = '',
  style,
  motifId,
  clientSlug,
}: {
  seed: Ucapan[];
  defaultNama?: string;
  style: LayoutStyle;
  motifId: string;
  /** Slug undangan klien nyata → RSVP disimpan ke server (/api/rsvp).
   *  Kosong (demo tema / pratinjau studio) → in-memory, tidak persisten. */
  clientSlug?: string;
}) {
  const provider = useMemo(
    () => (clientSlug ? createHttpWishesProvider(clientSlug, seed) : createInMemoryWishesProvider(seed)),
    [clientSlug, seed],
  );
  const [list, setList] = useState<Ucapan[]>(seed);
  const [nama, setNama] = useState(defaultNama);
  const [pesan, setPesan] = useState('');
  const [kehadiran, setKehadiran] = useState<StatusKehadiran>('hadir');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  // Muat ucapan nyata dari server (hanya undangan klien). Bila belum ada,
  // tetap tampilkan contoh (seed) sebagai baseline.
  useEffect(() => {
    if (!clientSlug) return;
    let alive = true;
    provider
      .list()
      .then((real) => {
        if (alive && real.length) setList(real);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [clientSlug, provider]);

  const hadirCount = list.filter((u) => u.kehadiran === 'hadir').length;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim() || !pesan.trim() || busy) return;
    setBusy(true);
    setErr(false);
    try {
      const next = await provider.submit({ nama: nama.trim(), pesan: pesan.trim(), kehadiran });
      track('rsvp_submit', { kehadiran });
      setList(next);
      setPesan('');
      setSent(true);
    } catch {
      setErr(true);
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    'w-full rounded-xl border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-page/50 px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-accent focus:ring-1 focus:ring-accent';

  return (
    <SectionShell style={style}>
      <SectionHeading
        motifId={motifId}
        overline="RSVP"
        title="Ucapan &amp; Doa"
        align={style.headingAlign}
        variant={style.headingStyle}
        className="mb-8"
      />

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className={inputCls}
          placeholder="Nama Anda"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          maxLength={60}
          required
        />
        <div className="flex flex-wrap gap-2">
          {(['hadir', 'tidak', 'ragu'] as StatusKehadiran[]).map((k) => (
            <button
              type="button"
              key={k}
              onClick={() => setKehadiran(k)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                kehadiran === k
                  ? 'border-primary bg-primary text-white'
                  : 'border-[color-mix(in_srgb,var(--accent)_30%,transparent)] text-ink hover:border-accent'
              }`}
            >
              {LABEL[k]}
            </button>
          ))}
        </div>
        <textarea
          className={`${inputCls} min-h-[90px] resize-y`}
          placeholder="Tulis ucapan & doa untuk kedua mempelai…"
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          maxLength={400}
          required
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-primary py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? 'Mengirim…' : 'Kirim Ucapan'}
        </button>
        {sent && !err && (
          <p className="text-center text-xs text-accent">
            Terima kasih, ucapan Anda telah ditambahkan. 🤍
          </p>
        )}
        {err && (
          <p className="text-center text-xs text-red-700">
            Maaf, ucapan gagal terkirim. Coba lagi sebentar.
          </p>
        )}
      </form>

      <div className="mt-6">
        <p className="mb-3 text-center text-xs uppercase tracking-widest text-muted">
          {list.length} ucapan · {hadirCount} menyatakan hadir
        </p>
        <ul className="max-h-80 space-y-3 overflow-y-auto pr-1 no-scrollbar">
          {list.map((u, i) => (
            <li
              key={i}
              className="rounded-xl border border-[color-mix(in_srgb,var(--accent)_22%,transparent)] bg-page/40 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-heading text-sm font-semibold text-primary">{u.nama}</span>
                {u.kehadiran && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${BADGE[u.kehadiran]}`}>
                    {LABEL[u.kehadiran]}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-ink">{u.pesan}</p>
              {u.waktu && <p className="mt-1 text-[10px] text-muted">{u.waktu}</p>}
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}
