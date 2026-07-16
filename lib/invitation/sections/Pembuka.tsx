import React from 'react';
import type { DataUndangan } from '../types';
import type { LayoutStyle, Signature } from '../layout-styles';
import { SectionShell } from '../SectionShell';
import { Divider } from '../Ornaments';
import { PendhapaArch, SealMark, SignatureMark, Tategaki, NorenRule } from '../Signature';

// ============================================================================
// Pembuka — salam (Islami / netral) + ayat/kutipan opsional.
//
// LIMA varian struktur. Sebelumnya cuma satu (rata tengah) untuk 300 tema,
// sehingga tema Jawa dan tema China tampil identik di sini. Varian mengubah
// POSISI & TATANAN, bukan sekadar warna.
// ============================================================================

function Bismillah({ className = '' }: { className?: string }) {
  return (
    <p
      className={`text-2xl leading-relaxed text-ink sm:text-3xl ${className}`}
      style={{ fontFamily: '"Traditional Arabic", "Amiri", serif' }}
      dir="rtl"
      lang="ar"
    >
      بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
    </p>
  );
}

interface Isi {
  salam: string;
  intro: string;
  islami: boolean;
  kutipan?: { teks: string; sumber: string };
  motifId: string;
  signature: Signature;
}

// --- Varian: rata tengah (klasik) ------------------------------------------
// Dipakai layout paling umum (royal/frame/circular/…) yang dibagi lintas budaya.
// Karena itu penanda budaya WAJIB tampil di sini: tanpa ia, tema Jawa dan tema
// China yang sama-sama 'royal' akan tampil persis sama — bug yang kita perbaiki.
function VarCenter({ salam, intro, islami, kutipan, motifId, signature }: Isi) {
  return (
    <div className="text-center">
      {signature !== 'none' && (
        <div className="mb-5 flex justify-center">
          <SignatureMark signature={signature} motifId={motifId} />
        </div>
      )}
      <p className="font-heading text-lg font-medium tracking-wide text-primary sm:text-xl">{salam}</p>
      {islami && <Bismillah className="mt-4" />}
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">{intro}</p>
      {kutipan && (
        <>
          <Divider motifId={motifId} className="my-6" width={170} />
          <figure className="mx-auto max-w-md">
            <blockquote className="font-heading text-base italic leading-relaxed text-ink sm:text-lg">
              “{kutipan.teks}”
            </blockquote>
            <figcaption className="mt-2 text-xs font-medium uppercase tracking-widest text-accent">
              — {kutipan.sumber}
            </figcaption>
          </figure>
        </>
      )}
    </div>
  );
}

// --- Varian: rel kiri (editorial/minimalis) --------------------------------
// Teks rata kiri, digantung pada rel aksen vertikal. Kutipan menjorok masuk.
function VarRail({ salam, intro, islami, kutipan, signature, motifId }: Isi) {
  return (
    <div className="text-left">
      <div className="flex gap-4">
        <span
          aria-hidden
          className="mt-1 w-px shrink-0 self-stretch bg-[color-mix(in_srgb,var(--accent)_55%,transparent)]"
        />
        <div className="min-w-0">
          <p className="font-heading text-lg font-medium leading-snug text-primary sm:text-xl">{salam}</p>
          {islami && <Bismillah className="mt-3 text-right" />}
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">{intro}</p>
        </div>
      </div>
      {kutipan && (
        <figure className="ml-4 mt-7 border-l-2 border-accent/40 pl-5">
          <blockquote className="font-heading text-base italic leading-relaxed text-ink sm:text-lg">
            “{kutipan.teks}”
          </blockquote>
          <figcaption className="mt-2 text-xs font-medium uppercase tracking-widest text-accent">
            — {kutipan.sumber}
          </figcaption>
        </figure>
      )}
      {signature !== 'none' && (
        <div className="mt-7">
          <SignatureMark signature={signature} motifId={motifId} />
        </div>
      )}
    </div>
  );
}

// --- Varian: tategaki (Jepang) ---------------------------------------------
// Teks mengalir vertikal kanan→kiri, dengan ruang kosong (ma) yang lapang di
// sisi kiri. Inilah pembeda struktural tema Jepang: aliran teksnya beda arah.
function VarTategaki({ salam, intro, islami, kutipan, motifId, signature }: Isi) {
  return (
    <div>
      <div className="flex justify-end gap-4 sm:gap-6">
        {/* Medali kamon menempati sisi kiri yang lapang — mengisi `ma` tanpa
            memenuhinya, sekaligus menandai budaya seperti varian lain. */}
        {signature !== 'none' && (
          <div className="mt-1 flex flex-1 justify-start">
            <SignatureMark signature={signature} motifId={motifId} />
          </div>
        )}
        <NorenRule className="mt-1 shrink-0" height={200} />
        <Tategaki className="text-left" maxHeight="19rem">
          <p className="font-heading text-lg font-medium text-primary sm:text-xl">{salam}</p>
          <p className="mt-5 text-sm leading-relaxed text-muted sm:text-base">{intro}</p>
        </Tategaki>
      </div>
      {islami && <Bismillah className="mt-6 text-center" />}
      {kutipan && (
        // Kutipan kembali horizontal: teks panjang vertikal melelahkan dibaca
        // di ponsel, dan `ma` justru hilang kalau semua dipaksa vertikal.
        <figure className="mt-8 max-w-sm">
          <blockquote className="font-heading text-base italic leading-relaxed text-ink sm:text-lg">
            “{kutipan.teks}”
          </blockquote>
          <figcaption className="mt-2 text-xs font-medium uppercase tracking-widest text-accent">
            — {kutipan.sumber}
          </figcaption>
        </figure>
      )}
    </div>
  );
}

// --- Varian: couplet (China) -----------------------------------------------
// Dua bait berpasangan mengapit stempel di tengah — meniru tata letak duilian
// (bait gantung) yang selalu simetris kiri-kanan.
function VarCouplet({ salam, intro, islami, kutipan, motifId }: Isi) {
  return (
    <div className="text-center">
      <p className="font-heading text-lg font-medium tracking-wide text-primary sm:text-xl">{salam}</p>

      <div className="mt-5 flex items-center justify-center gap-4 sm:gap-6">
        <span aria-hidden className="h-px flex-1 bg-[color-mix(in_srgb,var(--accent)_45%,transparent)]" />
        <SealMark motifId={motifId} size={60} />
        <span aria-hidden className="h-px flex-1 bg-[color-mix(in_srgb,var(--accent)_45%,transparent)]" />
      </div>

      {islami && <Bismillah className="mt-5" />}
      <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted sm:text-base">{intro}</p>

      {kutipan && (
        <figure className="mx-auto mt-6 max-w-md border-y border-accent/25 py-5">
          <blockquote className="font-heading text-base italic leading-relaxed text-ink sm:text-lg">
            “{kutipan.teks}”
          </blockquote>
          <figcaption className="mt-2 text-xs font-medium uppercase tracking-widest text-accent">
            — {kutipan.sumber}
          </figcaption>
        </figure>
      )}
    </div>
  );
}

// --- Varian: gunungan/pendhapa (Jawa) --------------------------------------
// Salam bernaung di bawah siluet atap joglo bertingkat, seperti tamu yang
// diterima di pendhapa sebelum masuk. Kutipan duduk di "lantai" beralas garis.
function VarGunungan({ salam, intro, islami, kutipan, motifId }: Isi) {
  return (
    <div className="text-center">
      <div className="flex justify-center">
        <PendhapaArch width={230} />
      </div>
      <p className="mt-5 font-heading text-lg font-medium tracking-wide text-primary sm:text-xl">
        {salam}
      </p>
      {islami && <Bismillah className="mt-4" />}
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">{intro}</p>
      {kutipan && (
        <>
          <Divider motifId={motifId} className="my-6" width={170} />
          <figure className="mx-auto max-w-md">
            <blockquote className="font-heading text-base italic leading-relaxed text-ink sm:text-lg">
              “{kutipan.teks}”
            </blockquote>
            <figcaption className="mt-2 text-xs font-medium uppercase tracking-widest text-accent">
              — {kutipan.sumber}
            </figcaption>
          </figure>
        </>
      )}
    </div>
  );
}

export function Pembuka({
  data,
  style,
  motifId,
  signature,
}: {
  data: DataUndangan;
  style: LayoutStyle;
  motifId: string;
  signature: Signature;
}) {
  const salam = data.islami
    ? 'Assalamu’alaikum Warahmatullahi Wabarakatuh'
    : data.salamPembuka ?? 'Dengan penuh syukur dan kebahagiaan';

  const intro = data.islami
    ? 'Dengan memohon rahmat dan ridha Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.'
    : 'Merupakan suatu kebahagiaan dan kehormatan bagi kami untuk berbagi kabar sukacita ini bersama Anda.';

  const isi: Isi = {
    salam,
    intro,
    islami: !!data.islami,
    kutipan: data.ayat ?? data.quote,
    motifId,
    signature,
  };

  let inner: React.ReactNode;
  switch (style.pembuka) {
    case 'rail':
      inner = <VarRail {...isi} />;
      break;
    case 'tategaki':
      inner = <VarTategaki {...isi} />;
      break;
    case 'couplet':
      inner = <VarCouplet {...isi} />;
      break;
    case 'gunungan':
      inner = <VarGunungan {...isi} />;
      break;
    default:
      inner = <VarCenter {...isi} />;
  }

  return <SectionShell style={style}>{inner}</SectionShell>;
}
