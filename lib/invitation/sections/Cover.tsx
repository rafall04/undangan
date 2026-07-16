'use client';

import React from 'react';
import type { TemaResolved } from '@/lib/engine';
import type { DataUndangan } from '../types';
import type { CoverVariant } from '../layout-styles';
import { pasanganPanggilan, monogramPasangan } from '../types';
import { tanggalPanjang } from '../format';
import { MotifCorner, MotifPattern } from '@/lib/engine/motifs';

// ============================================================================
// Cover / sampul — fullscreen, 19 varian komposisi berbeda. Backdrop dihitung
// gelap agar teks putih legibel di palet terang MAUPUN gelap.
// ============================================================================

interface Ctx {
  data: DataUndangan;
  tema: TemaResolved;
  a: string;
  b: string;
  deep: string;
  overline: string;
  guestName?: string;
  onOpen: () => void;
}

// --- Potongan bersama -------------------------------------------------------
function KepadaYth({ guestName, center = true }: { guestName?: string; center?: boolean }) {
  return (
    <div className={`mt-7 inline-block rounded-2xl bg-black/25 px-5 py-3 backdrop-blur-sm ${center ? 'mx-auto' : ''}`}>
      <p className="text-[11px] uppercase tracking-widest text-white/75">Kepada Yth. Bapak/Ibu/Saudara/i</p>
      <p className="mt-1 font-heading text-lg font-medium text-white">{guestName?.trim() || 'Tamu Undangan'}</p>
    </div>
  );
}

function BukaButton({ onOpen, color }: { onOpen: () => void; color: string }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/95 px-7 py-3 text-sm font-semibold shadow-lg transition-transform hover:scale-[1.03]"
      style={{ color }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 8l8 5 8-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="4" y="5.5" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
      </svg>
      Buka Undangan
    </button>
  );
}

function Names({ a, b, variant }: { a: string; b: string; variant: CoverVariant }) {
  if (variant === 'minimal') {
    return (
      <h1 className="shimmer-names mt-3 font-heading uppercase leading-tight text-white" style={{ fontSize: 'clamp(1.9rem, 8.5vw, 3rem)', letterSpacing: '0.14em' }}>
        {a} <span className="font-script lowercase tracking-normal text-white/80" style={{ letterSpacing: 0 }}>&amp;</span> {b}
      </h1>
    );
  }
  if (variant === 'timeless' || variant === 'letter') {
    return (
      <h1 className="shimmer-names mt-3 font-heading leading-tight text-white" style={{ fontSize: 'clamp(2.4rem, 12vw, 3.6rem)' }}>
        {a} <span className="font-script text-white/90">&amp;</span> {b}
      </h1>
    );
  }
  if (variant === 'magazine') {
    return (
      <h1 className="shimmer-names font-heading font-semibold leading-[0.92] text-white" style={{ fontSize: 'clamp(3rem, 16vw, 5.2rem)' }}>
        {a}<br /><span className="font-script text-4xl text-white/85 sm:text-5xl">&amp;</span> {b}
      </h1>
    );
  }
  if (variant === 'poster') {
    return (
      <h1 className="shimmer-names font-heading font-bold uppercase leading-[0.9] text-white" style={{ fontSize: 'clamp(2.8rem, 15vw, 5rem)', letterSpacing: '0.02em' }}>
        {a}<br />{b}
      </h1>
    );
  }
  return (
    <h1 className="shimmer-names mt-3 font-script leading-[0.95] text-white drop-shadow-sm" style={{ fontSize: 'clamp(3rem, 15vw, 5rem)' }}>
      {a} <span className="mx-1 opacity-90">&amp;</span> {b}
    </h1>
  );
}

function StampEmblem({ text }: { text: string }) {
  return (
    <span className="relative mb-4 inline-flex h-20 w-16 flex-col items-center justify-center border-2 border-dashed border-white/70 bg-white/10">
      <span className="font-heading text-xl font-semibold text-white">{text}</span>
      <span className="mt-0.5 text-[7px] uppercase tracking-[0.2em] text-white/70">Rafayana</span>
    </span>
  );
}

function CornerSet({ motifId }: { motifId: string }) {
  return (
    <>
      <MotifCorner motifId={motifId} color="rgba(255,255,255,0.55)" size={84} className="absolute left-4 top-4 z-10" />
      <MotifCorner motifId={motifId} color="rgba(255,255,255,0.55)" size={84} className="absolute right-4 top-4 z-10 -scale-x-100" />
      <MotifCorner motifId={motifId} color="rgba(255,255,255,0.55)" size={84} className="absolute bottom-4 left-4 z-10 -scale-y-100" />
      <MotifCorner motifId={motifId} color="rgba(255,255,255,0.55)" size={84} className="absolute bottom-4 right-4 z-10 -scale-100" />
    </>
  );
}

const SHELL = 'invite-cover relative flex h-[100svh] min-h-[600px] w-full flex-col overflow-hidden text-white';

function PhotoOrGradient({ ctx, gradient }: { ctx: Ctx; gradient: string }) {
  return ctx.data.fotoCover ? (
    <>
      {/* Blur-up: latar mungil tampil instan sementara foto sampul dimuat */}
      {ctx.data.fotoCoverBlur && (
        <div
          aria-hidden
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: `url(${ctx.data.fotoCoverBlur})`, backgroundPosition: ctx.data.fotoCoverFokus ?? 'center' }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ctx.data.fotoCover} alt="Foto sampul" className="absolute inset-0 h-full w-full object-cover" style={ctx.data.fotoCoverFokus ? { objectPosition: ctx.data.fotoCoverFokus } : undefined} />
      <div className="absolute inset-0" style={{ background: 'var(--cover-gradient)' }} />
    </>
  ) : (
    <div className="absolute inset-0" style={{ background: gradient }} />
  );
}

// --- Varian standar (classic/editorial/frame/royal/polaroid/minimal/timeless/stamp)
function StandardCover({ ctx, variant }: { ctx: Ctx; variant: CoverVariant }) {
  const { tema, a, b, deep, overline, guestName, onOpen, data } = ctx;
  const left = variant === 'editorial';
  const showCorners = ['classic', 'frame', 'royal', 'polaroid', 'stamp'].includes(variant);
  const patternOpacity = variant === 'timeless' ? 0 : variant === 'minimal' ? 0.04 : 0.06;
  const backdrop = data.fotoCover ? undefined : `linear-gradient(160deg, ${deep}, color-mix(in srgb, ${deep} 55%, #000))`;

  return (
    <section className={`${SHELL} px-7 ${left ? 'items-start justify-end pb-16 text-left' : 'items-center justify-center text-center'}`} style={{ background: backdrop }}>
      <PhotoOrGradient ctx={ctx} gradient={backdrop ?? ''} />
      {patternOpacity > 0 && <MotifPattern motifId={tema.motifId} color="#ffffff" opacity={patternOpacity} className="z-0" />}
      {!data.fotoCover && <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent 55%)' }} />}
      {showCorners && <CornerSet motifId={tema.motifId} />}
      {variant === 'frame' && <span aria-hidden className="pointer-events-none absolute inset-5 z-10 rounded-lg border border-white/35" />}
      {variant === 'timeless' && (
        <>
          <span aria-hidden className="pointer-events-none absolute inset-5 z-10 border border-white/45" />
          <span aria-hidden className="pointer-events-none absolute inset-7 z-10 border border-white/25" />
        </>
      )}
      {variant === 'stamp' && <span aria-hidden className="pointer-events-none absolute inset-4 z-10 rounded-md border-2 border-dashed border-white/45" />}

      <div className={`relative z-20 flex flex-col ${left ? 'items-start' : 'items-center'} animate-fade-up`}>
        {variant === 'royal' && (
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/60 font-heading text-lg tracking-wide">
            {monogramPasangan(data).replace(/\s/g, '')}
          </span>
        )}
        {variant === 'stamp' && <StampEmblem text={monogramPasangan(data).replace(/\s/g, '')} />}
        <p className={`uppercase text-white/85 ${variant === 'minimal' ? 'text-[11px] tracking-[0.4em]' : 'text-xs tracking-[0.35em] sm:text-sm'}`}>{overline}</p>
        <Names a={a} b={b} variant={variant} />
        {variant === 'minimal' && <span className="mt-4 block h-px w-14 bg-white/50" />}
        <p className="mt-4 text-sm font-medium tracking-wide text-white/90 sm:text-base">{tanggalPanjang(data.tanggalUtama)}</p>
        <KepadaYth guestName={guestName} center={!left} />
        <BukaButton onOpen={onOpen} color={deep} />
      </div>
      <div className={`absolute bottom-6 z-20 ${left ? 'left-7' : 'left-1/2 -translate-x-1/2'} text-white/70`}>
        <span className="text-[10px] uppercase tracking-widest">Rafayana</span>
      </div>
    </section>
  );
}

// --- Split (dua pita horizontal) -------------------------------------------
function SplitCover({ ctx }: { ctx: Ctx }) {
  const { data, tema, deep, a, b, overline, guestName, onOpen } = ctx;
  return (
    <section className={`${SHELL}`}>
      <div className="relative h-[50%] w-full overflow-hidden">
        <PhotoOrGradient ctx={ctx} gradient={`linear-gradient(140deg, ${tema.palet.accent}, ${deep})`} />
        <MotifPattern motifId={tema.motifId} color="#ffffff" opacity={0.08} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.28))' }} />
      </div>
      <div className="relative flex h-[50%] flex-col items-center justify-center px-7 text-center" style={{ background: deep }}>
        <MotifPattern motifId={tema.motifId} color="#ffffff" opacity={0.05} />
        <div className="relative z-10 -mt-2 flex flex-col items-center">
          <p className="text-xs uppercase tracking-[0.35em] text-white/85">{overline}</p>
          <Names a={a} b={b} variant="classic" />
          <p className="mt-3 text-sm font-medium tracking-wide text-white/90">{tanggalPanjang(data.tanggalUtama)}</p>
          <KepadaYth guestName={guestName} />
          <BukaButton onOpen={onOpen} color={deep} />
        </div>
      </div>
    </section>
  );
}

// --- Duotone (belah diagonal tegas) ----------------------------------------
function DuotoneCover({ ctx }: { ctx: Ctx }) {
  const { data, tema, a, b, deep, overline, guestName, onOpen } = ctx;
  const accentDeep = `color-mix(in srgb, ${tema.palet.accent} 78%, #000)`;
  return (
    <section className={`${SHELL} items-center justify-center px-7 text-center`} style={{ background: `linear-gradient(118deg, ${deep} 0 46%, ${accentDeep} 46% 100%)` }}>
      <MotifPattern motifId={tema.motifId} color="#ffffff" opacity={0.05} />
      <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(118deg, transparent 44%, rgba(255,255,255,0.35) 46%, transparent 48%)' }} />
      <div className="relative z-20 flex flex-col items-center animate-fade-up">
        <p className="text-xs uppercase tracking-[0.4em] text-white/85">{overline}</p>
        <Names a={a} b={b} variant="poster" />
        <p className="mt-4 text-sm font-medium tracking-wide text-white/90">{tanggalPanjang(data.tanggalUtama)}</p>
        <KepadaYth guestName={guestName} />
        <BukaButton onOpen={onOpen} color={deep} />
      </div>
    </section>
  );
}

// --- Arch (jendela melengkung) ---------------------------------------------
function ArchCover({ ctx }: { ctx: Ctx }) {
  const { data, tema, a, b, deep, overline, guestName, onOpen } = ctx;
  const backdrop = data.fotoCover ? undefined : `linear-gradient(160deg, ${deep}, color-mix(in srgb, ${deep} 55%, #000))`;
  return (
    <section className={`${SHELL} items-center justify-center px-7 text-center`} style={{ background: backdrop }}>
      <PhotoOrGradient ctx={ctx} gradient={backdrop ?? ''} />
      <MotifPattern motifId={tema.motifId} color="#ffffff" opacity={0.06} />
      {!data.fotoCover && <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent 60%)' }} />}
      <div className="relative z-20 flex w-[78%] max-w-xs flex-col items-center rounded-t-[999px] border-2 border-white/45 px-6 pb-10 pt-16 animate-fade-up">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/50 font-heading text-base">{monogramPasangan(data).replace(/\s/g, '')}</span>
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/85">{overline}</p>
        <Names a={a} b={b} variant="classic" />
        <p className="mt-3 text-sm text-white/90">{tanggalPanjang(data.tanggalUtama)}</p>
      </div>
      <div className="relative z-20 flex flex-col items-center">
        <KepadaYth guestName={guestName} />
        <BukaButton onOpen={onOpen} color={deep} />
      </div>
    </section>
  );
}

// --- Circular (segel lingkaran) --------------------------------------------
function CircularCover({ ctx }: { ctx: Ctx }) {
  const { data, tema, a, b, deep, overline, guestName, onOpen } = ctx;
  const backdrop = data.fotoCover ? undefined : `linear-gradient(160deg, ${deep}, color-mix(in srgb, ${deep} 55%, #000))`;
  return (
    <section className={`${SHELL} items-center justify-center px-7 text-center`} style={{ background: backdrop }}>
      <PhotoOrGradient ctx={ctx} gradient={backdrop ?? ''} />
      <MotifPattern motifId={tema.motifId} color="#ffffff" opacity={0.06} />
      {!data.fotoCover && <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent 55%)' }} />}
      <div className="relative z-20 flex flex-col items-center animate-fade-up">
        <span className="mb-6 flex h-44 w-44 flex-col items-center justify-center rounded-full border-2 border-white/45 bg-black/20 sm:h-52 sm:w-52">
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/80">{overline}</span>
          <span className="my-1 font-script text-5xl leading-none text-white">{monogramPasangan(data).replace(/\s/g, '')}</span>
          <span className="text-[10px] tracking-widest text-white/80">{tanggalPanjang(data.tanggalUtama)}</span>
        </span>
        <Names a={a} b={b} variant="classic" />
        <KepadaYth guestName={guestName} />
        <BukaButton onOpen={onOpen} color={deep} />
      </div>
    </section>
  );
}

// --- Ticket (tiket berperforasi) -------------------------------------------
function TicketCover({ ctx }: { ctx: Ctx }) {
  const { data, tema, a, b, deep, overline, guestName, onOpen } = ctx;
  const backdrop = data.fotoCover ? undefined : `linear-gradient(160deg, ${deep}, color-mix(in srgb, ${deep} 55%, #000))`;
  return (
    <section className={`${SHELL} items-center justify-center px-6 text-center`} style={{ background: backdrop }}>
      <PhotoOrGradient ctx={ctx} gradient={backdrop ?? ''} />
      <MotifPattern motifId={tema.motifId} color="#ffffff" opacity={0.05} />
      <div className="relative z-20 w-full max-w-xs animate-fade-up">
        <div className="relative rounded-2xl border border-white/25 bg-black/35 px-6 py-8 backdrop-blur-sm">
          {/* takik samping */}
          <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full" style={{ background: deep }} />
          <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full" style={{ background: deep }} />
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/70">{overline}</p>
          <Names a={a} b={b} variant="classic" />
          <div className="my-4 border-t border-dashed border-white/35" />
          <p className="text-xs uppercase tracking-widest text-white/70">Admit — {guestName?.trim() || 'Tamu Undangan'}</p>
          <p className="mt-1 text-sm font-medium text-white/90">{tanggalPanjang(data.tanggalUtama)}</p>
          <BukaButton onOpen={onOpen} color={deep} />
        </div>
      </div>
    </section>
  );
}

// --- Band (pita warna) ------------------------------------------------------
function BandCover({ ctx }: { ctx: Ctx }) {
  const { data, tema, a, b, deep, overline, guestName, onOpen } = ctx;
  const backdrop = data.fotoCover ? undefined : `linear-gradient(160deg, color-mix(in srgb, ${deep} 78%, #000), ${deep})`;
  return (
    <section className={`${SHELL} items-center justify-center text-center`} style={{ background: backdrop }}>
      <PhotoOrGradient ctx={ctx} gradient={backdrop ?? ''} />
      <MotifPattern motifId={tema.motifId} color="#ffffff" opacity={0.05} />
      <div className="relative z-20 w-full animate-fade-up">
        <div className="w-full border-y border-white/25 bg-black/30 py-10 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-white/85">{overline}</p>
          <Names a={a} b={b} variant="classic" />
          <p className="mt-3 text-sm font-medium tracking-wide text-white/90">{tanggalPanjang(data.tanggalUtama)}</p>
        </div>
        <div className="mt-6 flex flex-col items-center px-7">
          <KepadaYth guestName={guestName} />
          <BukaButton onOpen={onOpen} color={deep} />
        </div>
      </div>
    </section>
  );
}

// --- Magazine (masthead + nama besar menimpa) ------------------------------
function MagazineCover({ ctx }: { ctx: Ctx }) {
  const { data, tema, a, b, deep, overline, guestName, onOpen } = ctx;
  const backdrop = data.fotoCover ? undefined : `linear-gradient(150deg, ${deep}, color-mix(in srgb, ${tema.palet.accent} 40%, #000))`;
  return (
    <section className={`${SHELL} justify-between`} style={{ background: backdrop }}>
      <PhotoOrGradient ctx={ctx} gradient={backdrop ?? ''} />
      <MotifPattern motifId={tema.motifId} color="#ffffff" opacity={0.05} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 45%)' }} />
      {/* masthead */}
      <div className="relative z-20 flex items-center justify-between border-b border-white/25 px-6 py-4 text-[10px] uppercase tracking-[0.3em] text-white/80">
        <span>Rafayana</span>
        <span>{tanggalPanjang(data.tanggalUtama)}</span>
      </div>
      <div className="relative z-20 px-6 pb-14 text-left animate-fade-up">
        <p className="text-xs uppercase tracking-[0.3em] text-white/85">{overline}</p>
        <Names a={a} b={b} variant="magazine" />
        <div className="mt-4">
          <KepadaYth guestName={guestName} center={false} />
        </div>
        <BukaButton onOpen={onOpen} color={deep} />
      </div>
    </section>
  );
}

// --- Poster (nama raksasa) --------------------------------------------------
function PosterCover({ ctx }: { ctx: Ctx }) {
  const { data, tema, a, b, deep, overline, guestName, onOpen } = ctx;
  const backdrop = data.fotoCover ? undefined : `linear-gradient(165deg, ${deep}, color-mix(in srgb, ${deep} 50%, #000))`;
  return (
    <section className={`${SHELL} justify-between px-7 py-14 text-left`} style={{ background: backdrop }}>
      <PhotoOrGradient ctx={ctx} gradient={backdrop ?? ''} />
      <MotifPattern motifId={tema.motifId} color="#ffffff" opacity={0.05} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), transparent 40%, rgba(0,0,0,0.45))' }} />
      <div className="relative z-20">
        <p className="text-xs uppercase tracking-[0.4em] text-white/85">{overline}</p>
        <Names a={a} b={b} variant="poster" />
      </div>
      <div className="relative z-20">
        <p className="text-sm font-medium tracking-wide text-white/90">{tanggalPanjang(data.tanggalUtama)}</p>
        <KepadaYth guestName={guestName} center={false} />
        <BukaButton onOpen={onOpen} color={deep} />
      </div>
    </section>
  );
}

// --- Letter (surat/manuskrip) ----------------------------------------------
function LetterCover({ ctx }: { ctx: Ctx }) {
  const { data, a, b, deep, overline, guestName, onOpen } = ctx;
  const backdrop = data.fotoCover ? undefined : `linear-gradient(170deg, ${deep}, color-mix(in srgb, ${deep} 62%, #000))`;
  return (
    <section className={`${SHELL} items-center justify-center px-8 text-center`} style={{ background: backdrop }}>
      <PhotoOrGradient ctx={ctx} gradient={backdrop ?? ''} />
      <span aria-hidden className="pointer-events-none absolute inset-6 z-10 border border-white/25" />
      <div className="relative z-20 flex flex-col items-center animate-fade-up">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/80">{overline}</p>
        <span className="my-4 block h-px w-16 bg-white/40" />
        <p className="max-w-[16rem] text-sm italic leading-relaxed text-white/85">Dengan penuh sukacita, kami mengundang Anda dalam pernikahan</p>
        <Names a={a} b={b} variant="letter" />
        <span className="mt-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/50 text-[10px] tracking-widest text-white/80">{monogramPasangan(data).replace(/\s/g, '')}</span>
        <p className="mt-3 text-sm text-white/90">{tanggalPanjang(data.tanggalUtama)}</p>
        <KepadaYth guestName={guestName} />
        <BukaButton onOpen={onOpen} color={deep} />
      </div>
    </section>
  );
}

// --- Botanical (bingkai dedaunan) ------------------------------------------
function BotanicalCover({ ctx }: { ctx: Ctx }) {
  const { data, tema, a, b, deep, overline, guestName, onOpen } = ctx;
  const backdrop = data.fotoCover ? undefined : `linear-gradient(160deg, ${deep}, color-mix(in srgb, ${deep} 55%, #000))`;
  const leaf = tema.motif.nuansa === 'nusantara' ? 'floral-line' : tema.motifId;
  return (
    <section className={`${SHELL} items-center justify-center px-8 text-center`} style={{ background: backdrop }}>
      <PhotoOrGradient ctx={ctx} gradient={backdrop ?? ''} />
      <MotifPattern motifId={tema.motifId} color="#ffffff" opacity={0.05} />
      <MotifCorner motifId={leaf} color="rgba(255,255,255,0.65)" size={150} className="absolute -left-2 -top-2 z-10" />
      <MotifCorner motifId={leaf} color="rgba(255,255,255,0.65)" size={150} className="absolute -bottom-2 -right-2 z-10 -scale-100" />
      <div className="relative z-20 flex flex-col items-center animate-fade-up">
        <p className="font-script text-3xl text-white/85">{overline}</p>
        <Names a={a} b={b} variant="classic" />
        <p className="mt-3 text-sm font-medium tracking-wide text-white/90">{tanggalPanjang(data.tanggalUtama)}</p>
        <KepadaYth guestName={guestName} />
        <BukaButton onOpen={onOpen} color={deep} />
      </div>
    </section>
  );
}

// --- Scrapbook (foto berselotip) -------------------------------------------
function ScrapbookCover({ ctx }: { ctx: Ctx }) {
  const { data, tema, a, b, deep, overline, guestName, onOpen } = ctx;
  const backdrop = `linear-gradient(160deg, ${deep}, color-mix(in srgb, ${deep} 60%, #000))`;
  return (
    <section className={`${SHELL} items-center justify-center px-7 text-center`} style={{ background: backdrop }}>
      <MotifPattern motifId={tema.motifId} color="#ffffff" opacity={0.05} />
      <div className="relative z-20 flex flex-col items-center animate-fade-up">
        {/* foto/monogram berselotip */}
        <div className="relative mb-6 w-48 rotate-[-3deg] bg-white p-2 pb-6 shadow-lg">
          <span className="absolute -left-3 -top-2 h-5 w-14 rotate-[-24deg] bg-white/40" />
          <span className="absolute -right-3 -top-2 h-5 w-14 rotate-[22deg] bg-white/40" />
          <div className="flex aspect-[4/5] items-center justify-center" style={{ background: `linear-gradient(135deg, ${tema.palet.primary}, ${tema.palet.accent})` }}>
            {data.fotoCover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.fotoCover} alt="Foto" className="h-full w-full object-cover" style={data.fotoCoverFokus ? { objectPosition: data.fotoCoverFokus } : undefined} />
            ) : (
              <span className="font-script text-4xl text-white/85">{monogramPasangan(data).replace(/\s/g, '')}</span>
            )}
          </div>
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/85">{overline}</p>
        <Names a={a} b={b} variant="classic" />
        <p className="mt-3 text-sm text-white/90">{tanggalPanjang(data.tanggalUtama)}</p>
        <KepadaYth guestName={guestName} />
        <BukaButton onOpen={onOpen} color={deep} />
      </div>
    </section>
  );
}

export function Cover({
  data, tema, guestName, variant, onOpen,
}: {
  data: DataUndangan; tema: TemaResolved; guestName?: string; variant: CoverVariant; onOpen: () => void;
}) {
  const [a, b] = pasanganPanggilan(data);
  const gelap = tema.palet.gelap;
  const deep = gelap ? tema.palet.surface : tema.palet.primary;
  const overline = data.islami ? 'Walimatul ‘Urs' : 'The Wedding Of';
  const ctx: Ctx = { data, tema, a, b, deep, overline, guestName, onOpen };

  switch (variant) {
    case 'split': return <SplitCover ctx={ctx} />;
    case 'duotone': return <DuotoneCover ctx={ctx} />;
    case 'arch': return <ArchCover ctx={ctx} />;
    case 'circular': return <CircularCover ctx={ctx} />;
    case 'ticket': return <TicketCover ctx={ctx} />;
    case 'band': return <BandCover ctx={ctx} />;
    case 'magazine': return <MagazineCover ctx={ctx} />;
    case 'poster': return <PosterCover ctx={ctx} />;
    case 'letter': return <LetterCover ctx={ctx} />;
    case 'botanical': return <BotanicalCover ctx={ctx} />;
    case 'scrapbook': return <ScrapbookCover ctx={ctx} />;
    default: return <StandardCover ctx={ctx} variant={variant} />;
  }
}
