import React from 'react';
import type { DataUndangan } from '../types';
import type { LayoutStyle } from '../layout-styles';
import { SectionShell } from '../SectionShell';
import { Divider } from '../Ornaments';

// ============================================================================
// Pembuka — salam (Islami / netral, dikontrol flag) + ayat/kutipan opsional.
// ============================================================================

export function Pembuka({
  data,
  style,
  motifId,
}: {
  data: DataUndangan;
  style: LayoutStyle;
  motifId: string;
}) {
  const salam = data.islami
    ? 'Assalamu’alaikum Warahmatullahi Wabarakatuh'
    : data.salamPembuka ?? 'Dengan penuh syukur dan kebahagiaan';

  const intro = data.islami
    ? 'Dengan memohon rahmat dan ridha Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.'
    : 'Merupakan suatu kebahagiaan dan kehormatan bagi kami untuk berbagi kabar sukacita ini bersama Anda.';

  const kutipan = data.ayat ?? data.quote;

  return (
    <SectionShell style={style}>
      <div className={style.headingAlign === 'center' ? 'text-center' : 'text-left'}>
        <p className="font-heading text-lg font-medium tracking-wide text-primary sm:text-xl">
          {salam}
        </p>

        {data.islami && (
          <p
            className="mt-4 text-2xl leading-relaxed text-ink sm:text-3xl"
            style={{ fontFamily: '"Traditional Arabic", "Amiri", serif' }}
            dir="rtl"
            lang="ar"
          >
            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>
        )}

        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
          {intro}
        </p>

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
    </SectionShell>
  );
}
