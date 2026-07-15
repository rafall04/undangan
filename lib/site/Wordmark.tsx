import React from 'react';

// ============================================================================
// Wordmark Rafayana — dua baris: "Rafayana" (script elegan) + "BY RAF UNDANGAN"
// kecil ber-tracking lebar. Dipakai konsisten di header, footer, & landing.
// ============================================================================

export function Wordmark({
  size = 'md',
  tone = 'ink',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'ink' | 'light';
  className?: string;
}) {
  const scriptSize = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-6xl sm:text-7xl',
  }[size];
  const subSize = {
    sm: 'text-[8px]',
    md: 'text-[9px]',
    lg: 'text-[11px]',
    xl: 'text-xs',
  }[size];
  const main = tone === 'light' ? 'text-white' : 'text-brand-ink';
  const sub = tone === 'light' ? 'text-white/70' : 'text-brand-gold';

  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <span className={`font-brand-script ${scriptSize} ${main}`}>Rafayana</span>
      <span className={`mt-0.5 font-brand-sans ${subSize} uppercase tracking-brand ${sub}`}>
        by RAF Undangan
      </span>
    </span>
  );
}
