import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { REGISTRY, getTemaBySlug } from '@/lib/engine';
import { Invitation } from '@/lib/invitation';
import { buildDemoData } from '@/lib/demo/couples';

// Demo undangan tiap tema dengan data pasangan fiktif. Dukungan ?to= (dibaca di
// client oleh <Invitation>), jadi halaman ini bisa fully-static (SSG).

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

export default function DemoTemaPage({ params }: { params: { slug: string } }) {
  const tema = getTemaBySlug(params.slug);
  if (!tema) notFound();

  const data = buildDemoData(tema);

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

      <Invitation data={data} tema={tema} analyticsContext={`demo:${tema.slug}`} />
    </>
  );
}
