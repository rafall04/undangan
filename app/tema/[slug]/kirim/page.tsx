import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { REGISTRY, getTemaBySlug } from '@/lib/engine';
import { KirimTool } from '@/lib/kirim/KirimTool';
import { defaultTemplate, type Tamu } from '@/lib/kirim/utils';

export const metadata: Metadata = {
  title: 'Demo Alat Kirim Tamu',
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return REGISTRY.map((t) => ({ slug: t.slug }));
}

const TAMU_DEMO: Tamu[] = [
  { nama: 'Bapak Andi Wijaya', telepon: '081234567890', grup: 'Keluarga' },
  { nama: 'Ibu Siti Rahayu', telepon: '082198765432', grup: 'Keluarga' },
  { nama: 'Rudi Hartanto', telepon: '0856-1112-2233', grup: 'Teman Kantor' },
  { nama: 'Dewi Lestari', grup: 'Teman Kuliah' },
  { nama: 'Bapak/Ibu Hendra', telepon: '6281377788899', grup: 'Tetangga' },
];

export default function DemoKirimPage({ params }: { params: { slug: string } }) {
  const tema = getTemaBySlug(params.slug);
  if (!tema) notFound();

  return (
    <div className="ui-page">
      <header className="ui-topbar">
        <div className="ui-container flex max-w-3xl flex-wrap items-center justify-between gap-2 py-3">
          <Link href="/tema" className="flex shrink-0 items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">R</span>
            <span className="text-sm font-semibold text-slate-900">Rafayana</span>
          </Link>
          <Link href={`/tema/${params.slug}`} className="ui-btn ui-btn-secondary whitespace-nowrap">
            ← Kembali ke demo tema
          </Link>
        </div>
      </header>
      <KirimTool
        basePath={`/tema/${params.slug}`}
        judul={`Demo · ${tema.namaTampilan}`}
        defaultTemplate={defaultTemplate()}
        initialTamu={TAMU_DEMO}
        isDemo
      />
    </div>
  );
}
