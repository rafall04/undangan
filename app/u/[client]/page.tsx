import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadClient } from '@/lib/clients/load';
import { effectiveStatus } from '@/lib/clients/meta';
import { Invitation } from '@/lib/invitation';
import { pasanganPanggilan } from '@/lib/invitation/types';
import { BRAND, waLink } from '@/lib/brand';
import { getSettings } from '@/lib/settings';

// FASE 4 — Undangan klien nyata dari content/clients/<slug>/. Dukungan ?to=.
// ISR: HTML di-cache & di-serve cepat; di-render ulang tiap `revalidate` detik
// ATAU segera saat admin mengubah config/status (revalidatePath di API admin).
// Nama tamu (?to=) dibaca di client (Invitation), jadi tak memaksa dinamis.
export const revalidate = 300;

// [] → tak ada yang di-prerender saat build (hindari baca DB/config build-time),
// tapi mengaktifkan ISR: render on-demand di request pertama lalu DI-CACHE
// (dynamicParams default true). Slug baru dari admin otomatis ter-handle.
export function generateStaticParams() {
  return [] as { client: string }[];
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

function UndanganNonaktif({ whatsapp }: { whatsapp: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-cream px-6 text-center">
      <p className="font-brand-script text-4xl text-brand-gold">Rafayana</p>
      <h1 className="mt-3 font-brand-serif text-2xl font-semibold text-brand-ink">Undangan Tidak Aktif</h1>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">
        Masa aktif undangan ini telah berakhir. Silakan hubungi admin untuk mengaktifkannya kembali.
      </p>
      <a
        href={waLink(`Halo ${BRAND.nama}, saya ingin mengaktifkan kembali undangan saya.`, whatsapp)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 rounded-full bg-brand-ink px-6 py-2.5 text-sm font-medium text-brand-cream hover:opacity-90"
      >
        Hubungi via WhatsApp
      </a>
    </div>
  );
}

export default function ClientInvitationPage({ params }: { params: { client: string } }) {
  const bundle = loadClient(params.client);
  if (!bundle) notFound();

  // Masa aktif / status: expired atau dinonaktifkan → halaman nonaktif.
  if (effectiveStatus(params.client) === 'disabled') {
    return <UndanganNonaktif whatsapp={getSettings().whatsapp} />;
  }

  return (
    <Invitation
      data={bundle.data}
      tema={bundle.tema}
      analyticsContext={`client:${params.client}`}
      clientSlug={params.client}
    />
  );
}
