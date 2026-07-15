import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { listClientSlugs, loadClient } from '@/lib/clients/load';
import { Invitation } from '@/lib/invitation';
import { pasanganPanggilan } from '@/lib/invitation/types';

// FASE 4 — Undangan klien nyata dari content/clients/<slug>/. Dukungan ?to=.

export function generateStaticParams() {
  return listClientSlugs().map((client) => ({ client }));
}

export function generateMetadata({ params }: { params: { client: string } }): Metadata {
  let bundle;
  try {
    bundle = loadClient(params.client);
  } catch {
    bundle = null;
  }
  if (!bundle) return { title: 'Undangan tidak ditemukan' };
  const [a, b] = pasanganPanggilan(bundle.data);
  const judul = `Undangan Pernikahan ${a} & ${b}`;
  const desk = `Dengan hormat kami mengundang Anda ke pernikahan ${a} & ${b}. ${bundle.tema.tagline}`;
  return {
    title: judul,
    description: desk,
    openGraph: { title: judul, description: desk, type: 'website' },
    twitter: { card: 'summary_large_image', title: judul, description: desk },
  };
}

export default function ClientInvitationPage({
  params,
  searchParams,
}: {
  params: { client: string };
  searchParams: { to?: string };
}) {
  const bundle = loadClient(params.client);
  if (!bundle) notFound();

  const guest = typeof searchParams.to === 'string' ? searchParams.to : undefined;

  return (
    <Invitation
      data={bundle.data}
      tema={bundle.tema}
      guestName={guest}
      analyticsContext={`client:${params.client}`}
      clientSlug={params.client}
    />
  );
}
