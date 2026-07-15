'use client';

import React from 'react';

// ============================================================================
// Tombol musik mengambang (presentational/controlled). Elemen <audio> dimiliki
// oleh Invitation agar play() dipanggil di dalam gesture "Buka Undangan"
// sehingga autoplay tidak diblokir. Bila diblokir, tombol tetap bisa diklik.
// ============================================================================

export function MusikButton({
  playing,
  onToggle,
  judul,
}: {
  playing: boolean;
  onToggle: () => void;
  judul?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? 'Jeda musik' : 'Putar musik'}
      title={judul ? `Musik: ${judul}` : 'Musik latar'}
      className="no-print fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-2 ring-white/40 transition-transform hover:scale-105"
    >
      <span className={playing ? 'animate-spin-slow' : ''}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M9 18V6l10-2v12"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6.5" cy="18" r="2.6" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="16.5" cy="16" r="2.6" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      </span>
      {!playing && (
        <span
          className="absolute inset-0 rounded-full ring-2 ring-accent motion-safe:animate-ping"
          style={{ animationDuration: '2.5s' }}
        />
      )}
    </button>
  );
}
