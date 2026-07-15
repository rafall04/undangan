import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { REGISTRY, getTemaBySlug } from '@/lib/engine';
import { Invitation } from '@/lib/invitation';
import { buildDemoData } from '@/lib/demo/couples';

// Demo undangan tiap tema dengan data pasangan fiktif. Dukungan ?to=.

export function generateStaticParams() {
  return REGISTRY.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tema = getTemaBySlug(params.slug);
  if (!tema) return { title: 'Tema tidak ditemukan' };
  const judul = `Tema ${tema.namaTampilan} — ${tema.kategori}`;
  const desk = `${tema.tagline} Undangan pernikahan digital tema ${tema.namaTampilan} dari Rafayana by RAF Undangan.`;
  return {
    title: judul,
    description: desk,
    openGraph: {
      title: `${tema.namaTampilan} · Rafayana`,
      description: desk,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: judul, description: desk },
  };
}

export default function DemoTemaPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { to?: string };
}) {
  const tema = getTemaBySlug(params.slug);
  if (!tema) notFound();

  const data = buildDemoData(tema);
  const guest = typeof searchParams.to === 'string' ? searchParams.to : undefined;

  return (
    <>
      {/* Bilah demo (tidak tampil saat cetak) */}
      <div className="no-print fixed left-1/2 top-3 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-xs text-white backdrop-blur">
        <Link href="/tema" className="hover:underline">
          ← Katalog
        </Link>
        <span className="opacity-50">·</span>
        <span className="font-medium">{tema.namaTampilan}</span>
        <span className="opacity-50">·</span>
        <Link href={`/tema/${tema.slug}/kirim`} className="hover:underline">
          Alat kirim
        </Link>
      </div>

      <Invitation data={data} tema={tema} guestName={guest} analyticsContext={`demo:${tema.slug}`} />
    </>
  );
}
