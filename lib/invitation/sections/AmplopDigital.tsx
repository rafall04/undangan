'use client';

import React, { useState } from 'react';
import type { DataUndangan } from '../types';
import type { LayoutStyle } from '../layout-styles';
import { SectionShell } from '../SectionShell';
import { SectionHeading } from '../Ornaments';

// ============================================================================
// Amplop digital / kado — nomor rekening bank & e-wallet dengan tombol salin,
// plus alamat kirim kado opsional.
// ============================================================================

export function AmplopDigital({
  data,
  style,
  motifId,
}: {
  data: DataUndangan;
  style: LayoutStyle;
  motifId: string;
}) {
  const amplop = data.amplop;
  const [copied, setCopied] = useState('');
  const [buka, setBuka] = useState(false);

  if (!amplop || !amplop.rekening || amplop.rekening.length === 0) return null;

  function salin(id: string, teks: string) {
    navigator.clipboard?.writeText(teks.replace(/\s/g, '')).then(() => {
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? '' : c)), 1500);
    });
  }

  return (
    <SectionShell style={style}>
      <SectionHeading
        motifId={motifId}
        overline="Wedding Gift"
        title="Amplop Digital"
        align={style.headingAlign}
        variant={style.headingStyle}
        className="mb-6"
      />

      <p className="mx-auto max-w-md text-center text-sm leading-relaxed text-muted">
        {amplop.catatan ??
          'Doa restu Anda adalah hadiah terindah. Namun bila berkenan memberi tanda kasih, dapat melalui:'}
      </p>

      {!buka ? (
        <div className="mt-5 text-center">
          <button
            onClick={() => setBuka(true)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Kirim Hadiah
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {amplop.rekening.map((r, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[color-mix(in_srgb,var(--accent)_28%,transparent)] bg-page/40 px-5 py-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-lg font-semibold text-primary">{r.bank}</span>
                <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted">
                  {r.jenis === 'ewallet' ? 'E-Wallet' : 'Bank'}
                </span>
              </div>
              <p className="mt-1 font-mono text-lg tracking-wide text-ink">{r.nomor}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-muted">a.n. {r.atasNama}</span>
                <button
                  onClick={() => salin(`rek-${i}`, r.nomor)}
                  className="rounded-full border border-accent px-3 py-1 text-xs font-medium text-primary hover:bg-accent hover:text-white"
                >
                  {copied === `rek-${i}` ? 'Tersalin ✓' : 'Salin'}
                </button>
              </div>
            </div>
          ))}

          {amplop.alamatKado && (
            <div className="rounded-2xl border border-[color-mix(in_srgb,var(--accent)_28%,transparent)] bg-page/40 px-5 py-4">
              <p className="text-xs uppercase tracking-widest text-accent">Kirim Kado</p>
              <p className="mt-1 text-sm text-ink">{amplop.alamatKado}</p>
              <button
                onClick={() => salin('alamat', amplop.alamatKado!)}
                className="mt-2 rounded-full border border-accent px-3 py-1 text-xs font-medium text-primary hover:bg-accent hover:text-white"
              >
                {copied === 'alamat' ? 'Tersalin ✓' : 'Salin Alamat'}
              </button>
            </div>
          )}
        </div>
      )}
    </SectionShell>
  );
}
