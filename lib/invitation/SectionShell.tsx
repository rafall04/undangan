import React from 'react';
import type { LayoutStyle } from './layout-styles';
import { Reveal } from './Reveal';

// ============================================================================
// Pembungkus bagian sesuai chrome layout:
//   card        → kartu surface (classic/frame/polaroid/royal/circular/tropis)
//   open        → terbuka di latar halaman (editorial/minimalis/timeless/…)
//   dashed      → kartu bergaris putus-putus (stamp/ticket)
//   accent-left → kartu dengan aksen garis tepi kiri (split/duotone)
//   arch        → kartu berpuncak melengkung (arch/lantern)
//   band        → pita warna penuh selebar kolom (band/gazette)
//   ornate      → kartu dengan ornamen sudut (botanical/ornate/lantern)
//   tape        → kartu "kertas" berselotip washi (scrapbook)
// ============================================================================

function OrnateCorners() {
  const base = 'pointer-events-none absolute h-5 w-5 border-accent';
  return (
    <>
      <span className={`${base} left-2 top-2 border-l-2 border-t-2`} />
      <span className={`${base} right-2 top-2 border-r-2 border-t-2`} />
      <span className={`${base} bottom-2 left-2 border-b-2 border-l-2`} />
      <span className={`${base} bottom-2 right-2 border-b-2 border-r-2`} />
    </>
  );
}

export function SectionShell({
  style,
  children,
  id,
  className = '',
  contentClassName = '',
  reveal = true,
}: {
  style: LayoutStyle;
  children: React.ReactNode;
  id?: string;
  className?: string;
  contentClassName?: string;
  reveal?: boolean;
}) {
  const pad = 'px-5 py-9 sm:px-7';
  let inner: React.ReactNode;

  switch (style.chrome) {
    case 'open':
      inner = <div className={`px-6 py-9 sm:px-4 ${className} ${contentClassName}`}>{children}</div>;
      break;
    case 'dashed':
      inner = (
        <div className={`px-4 pb-6 ${className}`}>
          <div className={`relative rounded-xl border-2 border-dashed bg-surface ${pad} ${contentClassName}`} style={{ borderColor: 'color-mix(in srgb, var(--accent) 45%, transparent)' }}>
            {children}
          </div>
        </div>
      );
      break;
    case 'accent-left':
      inner = (
        <div className={`px-4 pb-6 ${className}`}>
          <div className={`rounded-r-2xl border-l-[3px] bg-surface pl-6 pr-5 py-9 shadow-sm ${contentClassName}`} style={{ borderColor: 'var(--primary)' }}>
            {children}
          </div>
        </div>
      );
      break;
    case 'arch':
      inner = (
        <div className={`px-4 pb-6 ${className}`}>
          <div className={`rounded-b-2xl rounded-t-[2.75rem] bg-surface ${pad} shadow-sm ring-1 ring-[color-mix(in_srgb,var(--accent)_30%,transparent)] ${contentClassName}`}>
            {children}
          </div>
        </div>
      );
      break;
    case 'band':
      inner = (
        <div className={`mb-1.5 border-y bg-surface px-6 py-10 ${className} ${contentClassName}`} style={{ borderColor: 'color-mix(in srgb, var(--accent) 45%, transparent)' }}>
          {children}
        </div>
      );
      break;
    case 'ornate':
      inner = (
        <div className={`px-4 pb-6 ${className}`}>
          <div className={`relative rounded-lg bg-surface ${pad} ring-1 ring-[color-mix(in_srgb,var(--accent)_35%,transparent)] ${contentClassName}`}>
            <OrnateCorners />
            {children}
          </div>
        </div>
      );
      break;
    case 'tape':
      inner = (
        <div className={`px-5 pb-7 ${className}`}>
          <div className={`relative bg-white ${pad} shadow-md ${contentClassName}`}>
            <span className="pointer-events-none absolute -left-3 -top-2 h-5 w-16 rotate-[-18deg] bg-[color-mix(in_srgb,var(--accent)_35%,transparent)]" />
            <span className="pointer-events-none absolute -right-3 -top-2 h-5 w-16 rotate-[16deg] bg-[color-mix(in_srgb,var(--accent)_35%,transparent)]" />
            {children}
          </div>
        </div>
      );
      break;
    case 'card':
    default:
      inner = (
        <div className={`px-4 pb-6 ${className}`}>
          <div className={`bg-surface ${pad} ${style.cardClass} ${contentClassName}`}>{children}</div>
        </div>
      );
  }

  return <section id={id}>{reveal ? <Reveal as="div">{inner}</Reveal> : inner}</section>;
}
