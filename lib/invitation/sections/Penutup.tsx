import React from 'react';
import type { DataUndangan } from '../types';
import type { LayoutStyle } from '../layout-styles';
import { pasanganPanggilan } from '../types';
import { SectionShell } from '../SectionShell';
import { MotifDivider } from '@/lib/engine/motifs';

// ============================================================================
// Penutup — terima kasih, nama pasangan, dan KREDIT wajib:
// "Rafayana by RAF Undangan · Tema {nama}".
// ============================================================================

export function Penutup({
  data,
  style,
  motifId,
  namaTema,
}: {
  data: DataUndangan;
  style: LayoutStyle;
  motifId: string;
  namaTema: string;
}) {
  const [a, b] = pasanganPanggilan(data);
  const teks =
    data.penutup ??
    (data.islami
      ? 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Atas kehadiran serta doanya, kami ucapkan terima kasih.'
      : 'Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu. Atas kehadiran dan doanya, kami ucapkan terima kasih.');

  return (
    <SectionShell style={style} contentClassName="text-center">
      <p className="mx-auto max-w-md text-sm leading-relaxed text-ink sm:text-base">{teks}</p>

      {data.islami && (
        <p className="mt-5 font-heading text-base font-medium text-primary">
          Wassalamu’alaikum Warahmatullahi Wabarakatuh
        </p>
      )}

      <p className="mt-6 text-xs uppercase tracking-widest text-muted">Kami yang berbahagia,</p>
      <p className="mt-2 font-script text-5xl leading-tight text-primary sm:text-6xl">
        {a} &amp; {b}
      </p>

      {data.hashtag && (
        <p className="mt-3 text-sm font-medium tracking-wide text-accent">#{data.hashtag}</p>
      )}

      <div className="mt-8 flex justify-center">
        <MotifDivider motifId={motifId} color="var(--accent)" width={160} />
      </div>

      {/* Kredit wajib di setiap undangan */}
      <footer className="mt-6 text-[11px] leading-relaxed text-muted">
        <span className="font-heading text-sm text-primary">Rafayana</span>
        <span className="mx-1">by RAF Undangan</span>
        <span className="mx-1 opacity-60">·</span>
        <span>Tema {namaTema}</span>
      </footer>
    </SectionShell>
  );
}
