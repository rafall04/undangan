import React from 'react';

// ============================================================================
// FASE 2 — <FotoSlot> : komponen foto terpusat.
// Menangani: rasio terkunci, crop object-cover, bingkai ornamen, placeholder
// monogram bergradasi warna tema, dan lazy loading. Semua foto klien lewat
// komponen ini agar tak ada foto gepeng/kepotong sembarangan.
// ============================================================================

export interface FotoSlotProps {
  src?: string | null;
  alt: string;
  /** Rasio terkunci, mis. "4/5", "1/1", "3/4", "16/9". Default "4/5". */
  ratio?: string;
  /** Teks placeholder saat tak ada foto (mis. "B" atau "B & S"). */
  monogram?: string;
  /** Bingkai ornamen tipis mengikuti warna aksen tema. */
  frame?: boolean;
  /** Muat segera (untuk cover/atas layar). Default lazy. */
  priority?: boolean;
  rounded?: string;
  className?: string;
  imgClassName?: string;
  /** object-position crop, mis. "50% 30%". Kosong → center (default browser). */
  objectPosition?: string;
  /** Placeholder blur-up (data-URI mungil) — tampil instan sementara foto dimuat. */
  blurDataUrl?: string;
}

export function FotoSlot({
  src,
  alt,
  ratio = '4/5',
  monogram = '❦',
  frame = false,
  priority = false,
  rounded = 'rounded-2xl',
  className = '',
  imgClassName = '',
  objectPosition,
  blurDataUrl,
}: FotoSlotProps) {
  const [w, h] = ratio.split('/');
  const aspectRatio = `${w.trim()} / ${(h ?? '1').trim()}`;

  return (
    <div
      className={`relative overflow-hidden bg-surface ${rounded} ${className}`}
      style={{ aspectRatio }}
    >
      {src ? (
        <>
          {/* Blur-up: latar mungil tampil instan, tertutup foto asli saat termuat */}
          {blurDataUrl && (
            <span
              aria-hidden
              className="absolute inset-0 bg-cover"
              style={{ backgroundImage: `url(${blurDataUrl})`, backgroundPosition: objectPosition ?? 'center' }}
            />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
            style={objectPosition ? { objectPosition } : undefined}
          />
        </>
      ) : (
        <Placeholder monogram={monogram} />
      )}

      {frame && (
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-[6px] ${rounded} border border-white/35`}
          style={{ boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--accent) 45%, transparent)' }}
        />
      )}
    </div>
  );
}

function Placeholder({ monogram }: { monogram: string }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        backgroundImage:
          'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--accent) 70%, var(--primary)))',
      }}
      aria-hidden
    >
      {/* Ornamen sudut halus */}
      <span className="absolute inset-3 rounded-[inherit] border border-white/20" />
      <span
        className="select-none font-script leading-none text-white/85"
        style={{ fontSize: 'clamp(2.5rem, 12vw, 4.5rem)' }}
      >
        {monogram}
      </span>
    </div>
  );
}
