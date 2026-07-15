import React from 'react';
import type { DataUndangan } from '../types';
import type { LayoutStyle } from '../layout-styles';
import { SectionShell } from '../SectionShell';
import { SectionHeading } from '../Ornaments';

// ============================================================================
// Peta — embed Google Maps + tombol buka navigasi. Satu peta per lokasi unik.
// ============================================================================

export function Peta({
  data,
  style,
  motifId,
}: {
  data: DataUndangan;
  style: LayoutStyle;
  motifId: string;
}) {
  // Ambil lokasi unik yang punya peta.
  const seen = new Set<string>();
  const lokasi = data.acara.filter((a) => {
    if (!a.mapsEmbed && !a.mapsUrl) return false;
    const key = a.tempat;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (lokasi.length === 0) return null;

  return (
    <SectionShell style={style}>
      <SectionHeading
        motifId={motifId}
        overline="Lokasi Acara"
        title="Denah Lokasi"
        align={style.headingAlign}
        variant={style.headingStyle}
        className="mb-8"
      />
      <div className="space-y-6">
        {lokasi.map((a, i) => (
          <div key={i}>
            <p className="mb-2 text-center font-heading text-lg text-primary">{a.tempat}</p>
            {a.mapsEmbed && (
              <div className="relative h-56 overflow-hidden rounded-2xl bg-page/60 ring-1 ring-black/10">
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-muted">
                  Memuat peta…
                </span>
                <iframe
                  src={a.mapsEmbed}
                  title={`Peta ${a.tempat}`}
                  className="relative h-56 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            )}
            {a.mapsUrl && (
              <div className="mt-3 text-center">
                <a
                  href={a.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" stroke="currentColor" strokeWidth="1.7" />
                    <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.7" />
                  </svg>
                  Buka Peta &amp; Navigasi
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
