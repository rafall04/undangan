import React from 'react';

// ============================================================================
// Kelopak bunga jatuh saat undangan dibuka. CSS murni (lihat .petal di
// globals.css) — 14 elemen, transform/opacity saja (GPU), warna ikut aksen
// tema. Dirender sebentar lalu di-unmount oleh <Invitation> → nol biaya
// berjalan. Otomatis nonaktif pada prefers-reduced-motion.
// ============================================================================

// Nilai deterministik (bukan random) agar konsisten & tak memicu re-render.
const PETALS = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 7.3 + 3) % 96,
  size: 8 + (i % 3) * 3,
  dx: `${(i % 5) * 3 - 6}vw`,
  dur: `${6 + (i % 4)}s`,
  delay: `${(i % 7) * 0.45}s`,
  rot: `${300 + (i % 3) * 120}deg`,
}));

export function Petals() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 1.4,
              '--dx': p.dx,
              '--dur': p.dur,
              '--delay': p.delay,
              '--rot': p.rot,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
