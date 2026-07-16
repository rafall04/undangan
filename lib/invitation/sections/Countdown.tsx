'use client';

import React, { useEffect, useState } from 'react';
import type { LayoutStyle } from '../layout-styles';
import { SectionShell } from '../SectionShell';
import { SectionHeading } from '../Ornaments';
import { hitungMundur } from '../format';

// ============================================================================
// Hitung mundur real-time ke tanggal acara. Aman-hidrasi (mulai dari mounted).
//
// LIMA varian struktur — dulu semua tema memakai empat kotak yang sama persis.
// ============================================================================

interface Unit {
  nilai: number;
  label: string;
  /** Pembagi alami untuk cincin progres. `null` = tak punya batas (hari). */
  maks: number | null;
}

function unitsOf(s: { hari: number; jam: number; menit: number; detik: number }): Unit[] {
  return [
    { nilai: s.hari, label: 'Hari', maks: null },
    { nilai: s.jam, label: 'Jam', maks: 24 },
    { nilai: s.menit, label: 'Menit', maks: 60 },
    { nilai: s.detik, label: 'Detik', maks: 60 },
  ];
}

const dua = (n: number) => String(n).padStart(2, '0');

// --- Varian: kotak (lama) ---------------------------------------------------
function VarBoxes({ units }: { units: Unit[] }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex min-w-[3.75rem] flex-col items-center rounded-xl bg-page/50 px-2 py-3 ring-1 ring-[color-mix(in_srgb,var(--accent)_30%,transparent)] sm:min-w-[4.25rem]"
        >
          <span className="font-heading text-2xl font-semibold tabular-nums text-primary sm:text-3xl">
            {dua(u.nilai)}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-widest text-muted">{u.label}</span>
        </div>
      ))}
    </div>
  );
}

// --- Varian: cincin ---------------------------------------------------------
// Busur menunjukkan posisi unit dalam siklusnya sendiri (jam/24, menit/60,
// detik/60). "Hari" tak punya batas alami, jadi cincinnya utuh.
function Cincin({ u }: { u: Unit }) {
  const r = 26;
  const keliling = 2 * Math.PI * r;
  const isi = u.maks == null ? 1 : u.nilai / u.maks;
  return (
    <div className="flex flex-col items-center">
      <span className="relative inline-flex h-[68px] w-[68px] items-center justify-center">
        <svg viewBox="0 0 68 68" width={68} height={68} aria-hidden role="presentation">
          <circle
            cx="34"
            cy="34"
            r={r}
            fill="none"
            stroke="color-mix(in srgb, var(--accent) 22%, transparent)"
            strokeWidth={2}
          />
          <circle
            cx="34"
            cy="34"
            r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={keliling}
            strokeDashoffset={keliling * (1 - isi)}
            transform="rotate(-90 34 34)"
          />
        </svg>
        <span className="absolute font-heading text-xl font-semibold tabular-nums text-primary">
          {dua(u.nilai)}
        </span>
      </span>
      <span className="mt-1.5 text-[10px] uppercase tracking-widest text-muted">{u.label}</span>
    </div>
  );
}

function VarRing({ units }: { units: Unit[] }) {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-3">
      {units.map((u) => (
        <Cincin key={u.label} u={u} />
      ))}
    </div>
  );
}

// --- Varian: sebaris ramping ------------------------------------------------
function VarInline({ units, align }: { units: Unit[]; align: 'center' | 'left' }) {
  return (
    <div className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${align === 'center' ? 'justify-center' : ''}`}>
      {units.map((u, i) => (
        <React.Fragment key={u.label}>
          <span className="whitespace-nowrap">
            <span className="font-heading text-2xl font-semibold tabular-nums text-primary sm:text-3xl">
              {dua(u.nilai)}
            </span>
            <span className="ml-1 text-[11px] uppercase tracking-widest text-muted">{u.label}</span>
          </span>
          {i < units.length - 1 && (
            <span aria-hidden className="text-accent/50">
              ·
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// --- Varian: garis rambut ---------------------------------------------------
// Angka besar tanpa kotak, dipisah garis vertikal tipis. Paling "tenang".
function VarRule({ units }: { units: Unit[] }) {
  return (
    <div className="flex items-stretch justify-center">
      {units.map((u, i) => (
        <React.Fragment key={u.label}>
          {i > 0 && (
            <span
              aria-hidden
              className="mx-3 w-px self-stretch bg-[color-mix(in_srgb,var(--accent)_35%,transparent)] sm:mx-5"
            />
          )}
          <div className="flex min-w-[3rem] flex-col items-center sm:min-w-[3.5rem]">
            <span className="font-heading text-3xl font-light tabular-nums leading-none text-primary sm:text-4xl">
              {dua(u.nilai)}
            </span>
            <span className="mt-2 text-[10px] uppercase tracking-[0.3em] text-muted">{u.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// --- Varian: bertumpuk ------------------------------------------------------
// Daftar vertikal — angka kiri, label kanan, dipisah garis. Cocok untuk layout
// bergaya album/scrapbook yang kolomnya sempit.
function VarStack({ units }: { units: Unit[] }) {
  return (
    <ul className="mx-auto max-w-[15rem] divide-y divide-[color-mix(in_srgb,var(--accent)_22%,transparent)]">
      {units.map((u) => (
        <li key={u.label} className="flex items-baseline justify-between py-2.5">
          <span className="font-heading text-2xl font-semibold tabular-nums text-primary">
            {dua(u.nilai)}
          </span>
          <span className="text-[11px] uppercase tracking-[0.3em] text-muted">{u.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function Countdown({
  target,
  style,
  motifId,
}: {
  target: string;
  style: LayoutStyle;
  motifId: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const s =
    now == null ? { hari: 0, jam: 0, menit: 0, detik: 0, lewat: false } : hitungMundur(target, now);
  const units = unitsOf(s);

  let angka: React.ReactNode;
  switch (style.countdown) {
    case 'ring':
      angka = <VarRing units={units} />;
      break;
    case 'inline':
      angka = <VarInline units={units} align={style.headingAlign} />;
      break;
    case 'rule':
      angka = <VarRule units={units} />;
      break;
    case 'stack':
      angka = <VarStack units={units} />;
      break;
    default:
      angka = <VarBoxes units={units} />;
  }

  return (
    <SectionShell style={style}>
      <SectionHeading
        motifId={motifId}
        overline="Counting Down"
        title="Menuju Hari Bahagia"
        align={style.headingAlign}
        variant={style.headingStyle}
        className="mb-7"
      />
      {s.lewat ? (
        <p className={`font-heading text-lg text-primary ${style.headingAlign === 'center' ? 'text-center' : ''}`}>
          Alhamdulillah, hari bahagia telah tiba. Terima kasih atas doa restunya.
        </p>
      ) : (
        angka
      )}
    </SectionShell>
  );
}
