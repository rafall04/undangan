import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { REGISTRY, getTemaBySlug } from '@/lib/engine';
import { KirimTool } from '@/lib/kirim/KirimTool';
import { defaultTemplate, type Tamu } from '@/lib/kirim/utils';
import { Wordmark } from '@/lib/site/Wordmark';

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
    <div className="min-h-screen bg-brand-cream">
      <header className="border-b border-brand-line bg-brand-cream/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/tema"><Wordmark size="sm" /></Link>
          <Link
            href={`/tema/${params.slug}`}
            className="rounded-full border border-brand-line px-4 py-1.5 text-sm text-brand-ink hover:border-brand-gold"
          >
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
