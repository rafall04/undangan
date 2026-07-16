import React from 'react';
import { MotifGlyph } from '@/lib/engine/motifs';
import type { Signature } from './layout-styles';

// ============================================================================
// CIRI KHAS BUDAYA — elemen struktural yang membuat sebuah budaya langsung
// dikenali, bukan sekadar beda warna/motif latar.
//
// Ditentukan oleh `budaya` tema (lihat SIGNATURE_BY_BUDAYA), sehingga dua tema
// yang kebetulan memakai layout sama tetap berbeda karakter.
//
// ATURAN GAMBAR (sama seperti motifs.tsx):
//   • Semua digambar sendiri dari primitif geometris — tanpa aset/font eksternal.
//     Penting: banyak ponsel di Indonesia tak punya font CJK, jadi karakter
//     Tionghoa akan jadi kotak tofu. Karena itu "seal" memakai geometri + glyph
//     motif kita sendiri, bukan huruf.
//   • Ambil bentuk DEKORATIF (arsitektur, tekstil, kriya) — bukan lambang
//     sakral/ritual.
//   • Semua aria-hidden: ini hiasan, bukan informasi.
// ============================================================================

/** Jawa — siluet atap pendhapa bertingkat. Arsitektural, bukan gunungan sakral. */
export function PendhapaArch({
  color = 'var(--accent)',
  className = '',
  width = 260,
}: {
  color?: string;
  className?: string;
  width?: number;
}) {
  return (
    <svg
      aria-hidden
      role="presentation"
      className={className}
      viewBox="0 0 260 64"
      width={width}
      style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
    >
      <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
        {/* tiga tingkat atap joglo, makin ke atas makin sempit */}
        <path d="M18,62 L130,20 L242,62" strokeWidth={1.4} />
        <path d="M44,62 L130,34 L216,62" strokeWidth={0.9} opacity={0.6} />
        <path d="M70,62 L130,46 L190,62" strokeWidth={0.7} opacity={0.4} />
        {/* mustaka (puncak) */}
        <line x1="130" y1="20" x2="130" y2="8" strokeWidth={1.2} />
        <circle cx="130" cy="6" r="2.4" fill={color} stroke="none" />
        {/* umpak (dasar tiang) */}
        <line x1="10" y1="62" x2="250" y2="62" strokeWidth={1} opacity={0.7} />
      </g>
    </svg>
  );
}

/**
 * Nusantara — pita tenun: benang lungsin rapat + inlay belah ketupat.
 * Sengaja tenun generik, bukan songket: motif nusantara kita masih dedaunan
 * tropis yang tak terikat satu suku, jadi mengklaim songket (Melayu/Minang/
 * Palembang) akan keliru. Menenun & belah ketupat lazim di seluruh Nusantara.
 */
export function TenunBand({
  color = 'var(--accent)',
  className = '',
  width = 260,
}: {
  color?: string;
  className?: string;
  width?: number;
}) {
  const ketupat = (cx: number) =>
    `M${cx},8 L${cx + 7},18 L${cx},28 L${cx - 7},18 Z`;
  return (
    <svg
      aria-hidden
      role="presentation"
      className={className}
      viewBox="0 0 260 36"
      width={width}
      style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
    >
      <g stroke={color} strokeLinecap="round">
        {/* benang lungsin */}
        <line x1="6" y1="4" x2="254" y2="4" strokeWidth={1.2} />
        <line x1="6" y1="32" x2="254" y2="32" strokeWidth={1.2} />
        <line x1="6" y1="7.5" x2="254" y2="7.5" strokeWidth={0.5} opacity={0.45} />
        <line x1="6" y1="28.5" x2="254" y2="28.5" strokeWidth={0.5} opacity={0.45} />
      </g>
      <g fill="none" stroke={color} strokeWidth={0.9}>
        {[50, 90, 130, 170, 210].map((cx) => (
          <path key={cx} d={ketupat(cx)} />
        ))}
      </g>
      <g fill={color} stroke="none">
        {[70, 110, 150, 190].map((cx) => (
          <circle key={cx} cx={cx} cy={18} r={1.5} opacity={0.7} />
        ))}
      </g>
    </svg>
  );
}

/**
 * China — cap/stempel persegi. Bingkai ganda khas seal, isinya glyph motif tema
 * (awan ruyi / kisi jendela / peoni) supaya tetap benar secara budaya tanpa
 * bergantung pada font CJK yang sering absen di perangkat pengguna.
 */
export function SealMark({
  motifId,
  color = 'var(--primary)',
  className = '',
  size = 72,
}: {
  motifId: string;
  color?: string;
  className?: string;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 72 72"
        width={size}
        height={size}
        role="presentation"
        style={{ display: 'block' }}
      >
        <rect
          x="3"
          y="3"
          width="66"
          height="66"
          rx="4"
          fill="none"
          stroke={color}
          strokeWidth={2.4}
        />
        <rect
          x="9"
          y="9"
          width="54"
          height="54"
          rx="2"
          fill="none"
          stroke={color}
          strokeWidth={0.8}
          opacity={0.55}
        />
        <g transform="translate(36,36)" opacity={0.95}>
          <MotifGlyph motifId={motifId} color={color} size={34} />
        </g>
      </svg>
    </span>
  );
}

/**
 * Jepang — medali bundar berisi lambang motif, meniru cara mon (lambang
 * keluarga) selalu dilingkupi lingkaran. Dipakai di tema Jepang mana pun,
 * termasuk yang layoutnya bukan washi/noren.
 */
export function KamonMark({
  motifId,
  color = 'var(--primary)',
  className = '',
  size = 56,
}: {
  motifId: string;
  color?: string;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      aria-hidden
      role="presentation"
      className={className}
      viewBox="0 0 56 56"
      width={size}
      height={size}
      style={{ display: 'block' }}
    >
      <circle cx="28" cy="28" r="26" fill="none" stroke={color} strokeWidth={1.6} />
      <circle cx="28" cy="28" r="22" fill="none" stroke={color} strokeWidth={0.6} opacity={0.5} />
      <g transform="translate(28,28)">
        <MotifGlyph motifId={motifId} color={color} size={26} />
      </g>
    </svg>
  );
}

/** Barat — garis art-deco bertingkat, simetris. */
export function DecoRule({
  color = 'var(--accent)',
  className = '',
  width = 220,
}: {
  color?: string;
  className?: string;
  width?: number;
}) {
  return (
    <svg
      aria-hidden
      role="presentation"
      className={className}
      viewBox="0 0 220 24"
      width={width}
      style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
    >
      <g fill="none" stroke={color} strokeLinecap="square">
        <path d="M6,12 L78,12" strokeWidth={1.2} />
        <path d="M142,12 L214,12" strokeWidth={1.2} />
        {/* tangga deco di tengah */}
        <path d="M86,16 L94,16 L94,10 L102,10 L102,5 L110,5 L118,5 L118,10 L126,10 L126,16 L134,16" strokeWidth={1.3} />
        <path d="M86,20 L134,20" strokeWidth={0.6} opacity={0.5} />
      </g>
    </svg>
  );
}

/**
 * Jepang — tategaki (tulis vertikal, kanan ke kiri). Ini tradisi tipografi
 * nyata, bukan sekadar hiasan: teksnya benar-benar mengalir dari atas ke bawah.
 * `text-orientation: upright` dihindari agar aksara Latin tetap terbaca wajar.
 */
export function Tategaki({
  children,
  className = '',
  maxHeight = '18rem',
}: {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}) {
  return (
    <div
      className={className}
      style={{
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        maxHeight,
        letterSpacing: '0.12em',
      }}
    >
      {children}
    </div>
  );
}

/** Garis vertikal tipis pendamping tategaki — meniru batas kolom washi. */
export function NorenRule({
  color = 'var(--accent)',
  className = '',
  height = 120,
}: {
  color?: string;
  className?: string;
  height?: number;
}) {
  return (
    <svg
      aria-hidden
      role="presentation"
      className={className}
      viewBox="0 0 8 120"
      width={8}
      height={height}
      preserveAspectRatio="none"
      style={{ display: 'block' }}
    >
      <line x1="4" y1="0" x2="4" y2="120" stroke={color} strokeWidth={0.8} opacity={0.6} />
      <circle cx="4" cy="2" r="1.6" fill={color} stroke="none" />
      <circle cx="4" cy="118" r="1.6" fill={color} stroke="none" />
    </svg>
  );
}

/**
 * Penanda ciri budaya, dipakai di SEMUA varian Pembuka. Ini yang menjamin dua
 * tema berlayout sama tetap berbeda: jawa dapat atap joglo, china dapat cap,
 * jepang dapat medali, barat dapat garis deco.
 *
 * Hanya 'universal' yang null — ia memang tak mengklaim budaya apa pun.
 */
export function SignatureMark({
  signature,
  motifId,
  className = '',
}: {
  signature: Signature;
  motifId: string;
  className?: string;
}) {
  switch (signature) {
    case 'gunungan':
      return <PendhapaArch className={className} width={200} />;
    case 'tenun':
      return <TenunBand className={className} width={220} />;
    case 'seal':
      return <SealMark motifId={motifId} className={className} size={56} />;
    case 'kamon':
      return <KamonMark motifId={motifId} className={className} size={52} />;
    case 'deco':
      return <DecoRule className={className} width={200} />;
    default:
      return null;
  }
}
