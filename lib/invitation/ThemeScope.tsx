import React from 'react';
import type { TemaResolved } from '@/lib/engine';
import { temaCssVars } from '@/lib/engine';

// ============================================================================
// ThemeScope — menempelkan variabel CSS tema pada sebuah wrapper. Semua
// komponen di dalamnya otomatis memakai warna & font tema lewat Tailwind
// (bg-page, text-ink, font-heading, dst).
// ============================================================================

export function ThemeScope({
  tema,
  children,
  className = '',
  style,
  as: Tag = 'div',
}: {
  tema: TemaResolved;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof JSX.IntrinsicElements;
}) {
  return (
    <Tag
      className={`font-body text-ink ${className}`}
      style={{ ...temaCssVars(tema), backgroundColor: 'var(--bg)', ...style }}
    >
      {children}
    </Tag>
  );
}
